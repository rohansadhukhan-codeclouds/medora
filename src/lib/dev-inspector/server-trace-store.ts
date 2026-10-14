import "server-only";
import { cookies } from "next/headers";
import {
  DEV_INSPECTOR_COOKIE,
  MAX_DEBUG_HISTORY,
  type DebugApiCall,
} from "@/lib/dev-inspector/types";
import { isDevAppEnv } from "@/lib/env";

type TraceBucket = {
  calls: DebugApiCall[];
};

type TraceState = {
  buckets: Map<string, TraceBucket>;
};

const globalState = globalThis as typeof globalThis & {
  __medoraDevInspectorTraces?: TraceState;
};

function state(): TraceState {
  if (!globalState.__medoraDevInspectorTraces) {
    globalState.__medoraDevInspectorTraces = { buckets: new Map() };
  }
  return globalState.__medoraDevInspectorTraces;
}

function bucketFor(id: string): TraceBucket {
  const buckets = state().buckets;
  let bucket = buckets.get(id);
  if (!bucket) {
    bucket = { calls: [] };
    buckets.set(id, bucket);
  }
  return bucket;
}

export async function getDevInspectorBucketId(): Promise<string | null> {
  if (!isDevAppEnv()) return null;
  try {
    const jar = await cookies();
    return jar.get(DEV_INSPECTOR_COOKIE)?.value?.trim() || "anonymous";
  } catch {
    return "anonymous";
  }
}

/** Record an already-sanitized API call into the current browser bucket. */
export async function recordDevApiCall(call: DebugApiCall): Promise<void> {
  if (!isDevAppEnv()) return;
  const bucketId = await getDevInspectorBucketId();
  if (!bucketId) return;

  const bucket = bucketFor(bucketId);
  bucket.calls.unshift(call);
  if (bucket.calls.length > MAX_DEBUG_HISTORY) {
    bucket.calls.length = MAX_DEBUG_HISTORY;
  }
}

export async function getDevApiHistory(): Promise<DebugApiCall[]> {
  if (!isDevAppEnv()) return [];
  const bucketId = await getDevInspectorBucketId();
  if (!bucketId) return [];
  return [...(bucketFor(bucketId).calls)];
}

export async function clearDevApiHistory(): Promise<void> {
  if (!isDevAppEnv()) return;
  const bucketId = await getDevInspectorBucketId();
  if (!bucketId) return;
  state().buckets.set(bucketId, { calls: [] });
}

export function createDebugCallId(): string {
  return `dbg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
