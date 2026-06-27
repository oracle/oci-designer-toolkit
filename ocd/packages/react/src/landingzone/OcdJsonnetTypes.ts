/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

// go-jsonnet's 7-arg evaluator, installed on the global scope by the WASM module.
export type JsonnetEvaluate = (
    filename: string,
    code: string,
    files: Record<string, string>,
    extStrs: Record<string, string>,
    extCodes: Record<string, string>,
    tlaStrs: Record<string, string>,
    tlaCodes: Record<string, string>,
) => Promise<string>

export interface EvaluateJsonnetArgs {
    filename: string
    code: string
    files: Record<string, string>
    tlaCodes?: Record<string, string>
}

export interface JsonnetEngineProbe {
    available: boolean
    error?: string
}

export interface JsonnetRequestOptions {
    timeoutMs?: number
}
