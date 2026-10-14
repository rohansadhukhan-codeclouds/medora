import "server-only";
import { getChannelDetailWithMeta } from "@/lib/api/astermd/channels";
import { getAsterMdConfig } from "@/lib/api/astermd/config";
import type { AsterMdChannelDetail } from "@/lib/api/astermd/channel-types";
import { getDevApiHistory } from "@/lib/dev-inspector/server-trace-store";
import { maskId, sanitizeDebugData } from "@/lib/dev-inspector/sanitize";
import type {
  DevInspectorChannelSummary,
  DevInspectorOverview,
  DevInspectorPayload,
} from "@/lib/dev-inspector/types";
import { getServerEnv } from "@/lib/env";
import { getVisitorSessionId } from "@/lib/session/visitor-session";
import packageJson from "../../../package.json";

function readVersion(name: string, fallback: string): string {
  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  } as Record<string, string>;
  return deps[name]?.replace(/^[\^~]/, "") ?? fallback;
}

function buildOverview(): DevInspectorOverview {
  const env = getServerEnv();
  const config = getAsterMdConfig();

  return {
    environment: env.APP_ENV,
    framework: `Next.js ${readVersion("next", "16")}`,
    react: `React ${readVersion("react", "19")}`,
    language: "TypeScript",
    styling: "Tailwind CSS v4",
    formLib: "React Hook Form + Zod (static intake); schema-driven teleform",
    networking: "fetch (BFF + asterMdFetch)",
    asterMd: config.useMock ? "Mock" : config.baseUrl ? "Enabled" : "Disabled",
    payment: "Not configured / Unknown",
  };
}

function summarizeChannel(
  channelId: string | undefined,
  channel: AsterMdChannelDetail | null | undefined,
  apiResponse: unknown,
  cacheMeta: { cacheHit: boolean; cachedAt: number | null },
): DevInspectorChannelSummary | null {
  if (!channel && !apiResponse) return null;

  const products = (channel?.products ?? []).map((entry) => {
    const details = entry.product;
    const teleformIds = (details?.teleforms ?? [])
      .map((item) => {
        if (typeof item === "string") return item;
        return item?._id || item?.name || "";
      })
      .filter(Boolean);

    return {
      id: details?._id || details?.product_id || entry.product_id,
      name: details?.name || entry.product_id,
      teleformIds: teleformIds.length ? teleformIds : undefined,
    };
  });

  const mappingType = channel?.products
    ?.flatMap((entry) => entry.product_mappings ?? [])
    .map((mapping) => mapping.integration?.type || mapping.mapping?.type)
    .find(Boolean);

  const paymentIntegrationType =
    channel?.payment_processor?.type ||
    channel?.payment_processor?.name ||
    mappingType ||
    undefined;

  const endpointId = channelId || channel?._id || "{id}";

  return {
    endpoint: `/v1/sales/channels/detail/${endpointId}`,
    id: channel?._id,
    name: channel?.name,
    status: channel?.status,
    productCount: products.length,
    products,
    paymentIntegrationType,
    cacheHit: cacheMeta.cacheHit,
    cachedAt: cacheMeta.cachedAt
      ? new Date(cacheMeta.cachedAt).toISOString()
      : null,
    detailResponse: sanitizeDebugData(apiResponse),
  };
}

export async function buildDevInspectorPayload(): Promise<DevInspectorPayload> {
  const config = getAsterMdConfig();
  const history = await getDevApiHistory();
  const sessionId = await getVisitorSessionId();

  let channelSummary: DevInspectorChannelSummary | null = null;
  try {
    // Reuse the same helper as GET /api/channel (cache → live → mock).
    // Reading only getCachedChannel() left the tab empty after refresh / mock mode.
    const result = await getChannelDetailWithMeta();
    channelSummary = summarizeChannel(
      config.channelId || result.payload.data?._id,
      result.payload.data ?? null,
      result.payload,
      {
        cacheHit: result.cacheHit,
        cachedAt: result.cachedAt,
      },
    );
  } catch {
    channelSummary = null;
  }

  return {
    overview: buildOverview(),
    channel: channelSummary,
    journey: {
      sessionIdMasked: maskId(sessionId),
      remoteCartIdMasked: null,
      intakeFormIdConfigured: Boolean(config.intakeFormId),
      currentPath: undefined,
    },
    lastCall: history[0] ?? null,
    history,
  };
}
