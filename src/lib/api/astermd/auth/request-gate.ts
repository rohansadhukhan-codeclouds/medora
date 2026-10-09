import "server-only";

type QueuedTask = {
  run: (accessToken: string) => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

type GateState = {
  queue: QueuedTask[];
  draining: boolean;
};

const globalState = globalThis as typeof globalThis & {
  __medoraAsterMdRequestGate?: GateState;
};

function gateState(): GateState {
  if (!globalState.__medoraAsterMdRequestGate) {
    globalState.__medoraAsterMdRequestGate = {
      queue: [],
      draining: false,
    };
  }
  return globalState.__medoraAsterMdRequestGate;
}

/**
 * Hold authenticated AsterMD calls until a usable access token exists.
 * Calls that arrive while POST /v1/auth/api-credentials/token is in flight
 * stay in this queue. They start only after that token is stored.
 * If the token call fails, queued calls are rejected and never sent.
 */
export function enqueueAuthenticatedCall<T>(
  run: (accessToken: string) => Promise<T>,
  ensureToken: () => Promise<string>,
): Promise<T> {
  const state = gateState();

  return new Promise<T>((resolve, reject) => {
    state.queue.push({
      run: run as (accessToken: string) => Promise<unknown>,
      resolve: resolve as (value: unknown) => void,
      reject,
    });
    void drain(ensureToken);
  });
}

async function drain(ensureToken: () => Promise<string>): Promise<void> {
  const state = gateState();
  if (state.draining) return;
  state.draining = true;

  try {
    while (state.queue.length > 0) {
      const batch = state.queue.splice(0, state.queue.length);
      let accessToken: string;

      const waitStartedAt = Date.now();

      try {
        accessToken = await ensureToken();
      } catch (error) {
        console.error(
          `[AsterMD] ${batch.length} queued API call(s) cancelled — access token is not ready`,
        );
        for (const task of batch) task.reject(error);
        continue;
      }

      if (batch.length > 1 || Date.now() - waitStartedAt > 25) {
        console.info(
          `[AsterMD] access token ready, releasing ${batch.length} queued API call(s)`,
        );
      }

      await Promise.all(
        batch.map(async (task) => {
          try {
            task.resolve(await task.run(accessToken));
          } catch (error) {
            task.reject(error);
          }
        }),
      );
    }
  } finally {
    state.draining = false;
    if (state.queue.length > 0) {
      void drain(ensureToken);
    }
  }
}
