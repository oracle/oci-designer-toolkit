/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { evaluateJsonnetDirect, probeJsonnetEngineDirect } from './OcdJsonnetRuntime'
import { EvaluateJsonnetArgs, JsonnetEngineProbe } from './OcdJsonnetTypes'

type JsonnetWorkerRequest =
    | { id: number; type: 'evaluate'; args: EvaluateJsonnetArgs }
    | { id: number; type: 'probe' }

type JsonnetWorkerResponse =
    | { id: number; ok: true; result: string | JsonnetEngineProbe }
    | { id: number; ok: false; error: string }

const workerScope = self as unknown as {
    onmessage: ((event: MessageEvent<JsonnetWorkerRequest>) => void | Promise<void>) | null
    postMessage: (message: JsonnetWorkerResponse) => void
}

workerScope.onmessage = async (event: MessageEvent<JsonnetWorkerRequest>): Promise<void> => {
    const request = event.data
    try {
        const result = request.type === 'evaluate'
            ? await evaluateJsonnetDirect(request.args)
            : await probeJsonnetEngineDirect()
        workerScope.postMessage({ id: request.id, ok: true, result } satisfies JsonnetWorkerResponse)
    } catch (error: unknown) {
        workerScope.postMessage({
            id: request.id,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
        } satisfies JsonnetWorkerResponse)
    }
}
