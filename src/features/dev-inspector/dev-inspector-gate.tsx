import { isDevAppEnv } from "@/lib/env";
import { DevInspectorPanel } from "@/features/dev-inspector/dev-inspector-panel";

/**
 * Server gate — inspector mounts only when APP_ENV=dev.
 * Production builds never render the client panel.
 */
export function DevInspectorGate() {
  if (!isDevAppEnv()) return null;
  return <DevInspectorPanel enabled />;
}
