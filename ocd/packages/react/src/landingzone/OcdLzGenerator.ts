/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** TypeScript port of the LZNG `lzGenerator.js` service. Serializes Step 1 into
** config.jsonnet, evaluates the Operating Entities multi-output entrypoint via
** the go-jsonnet WASM runtime, and turns the JSON output into download-ready
** generated files.
*/

import { EvaluateJsonnetArgs, evaluateJsonnet } from './OcdJsonnetWasm'
import { getOperatingEntitiesJsonnetFiles } from './OcdOeJsonnetFiles'
import { serializeStep1Config, Step1State } from './OcdLzStep1Config'
import { LandingZoneConfig, serializeLandingZoneConfig } from './OcdLzConfig'

const ENTRYPOINT = '/gen/landing_zone_multi.jsonnet'
const encoder = new TextEncoder()

export interface GeneratedFile {
    name: string
    content: string
    size: number
}

export interface GeneratedResult {
    configJsonnet: string
    files: GeneratedFile[]
    generatedAt: string
    renderer: string
}

export type JsonnetEvaluator = (args: EvaluateJsonnetArgs) => Promise<string>

/**
 * Generate the Operating Entities JSON files from a pre-serialized config.jsonnet
 * string. This is the shared core used by both the Phase 1 (Step1) and Phase 2
 * (full LandingZoneConfig) entrypoints.
 */
export async function generateFromConfigJsonnet(
    configJsonnet: string,
    evaluator: JsonnetEvaluator = evaluateJsonnet,
): Promise<GeneratedResult> {
    const files = getOperatingEntitiesJsonnetFiles()
    const code = files[ENTRYPOINT]
    if (!code) {
        throw new Error(`${ENTRYPOINT} was not bundled.`)
    }

    const raw = await evaluator({
        filename: ENTRYPOINT,
        code,
        files,
        tlaCodes: { config: configJsonnet },
    })

    const rendered = JSON.parse(raw) as Record<string, unknown>
    const outputFiles: GeneratedFile[] = Object.keys(rendered).sort().map((name) => {
        const content = JSON.stringify(rendered[name], null, 2) + '\n'
        return { name, content, size: encoder.encode(content).length }
    })

    return {
        configJsonnet,
        files: outputFiles,
        generatedAt: new Date().toISOString(),
        renderer: 'go-jsonnet-wasm',
    }
}

/** Phase 2 entrypoint: generate from the full Landing Zone wizard config. */
export async function generateLandingZone(
    config: LandingZoneConfig,
    evaluator: JsonnetEvaluator = evaluateJsonnet,
): Promise<GeneratedResult> {
    return generateFromConfigJsonnet(serializeLandingZoneConfig(config), evaluator)
}

export async function generateLandingZoneFiles(
    step1State: Step1State,
    evaluator: JsonnetEvaluator = evaluateJsonnet,
): Promise<GeneratedResult> {
    const configJsonnet = serializeStep1Config(step1State)
    const files = getOperatingEntitiesJsonnetFiles()
    const code = files[ENTRYPOINT]
    if (!code) {
        throw new Error(`${ENTRYPOINT} was not bundled.`)
    }

    const raw = await evaluator({
        filename: ENTRYPOINT,
        code,
        files,
        tlaCodes: { config: configJsonnet },
    })

    const rendered = JSON.parse(raw) as Record<string, unknown>
    const outputFiles: GeneratedFile[] = Object.keys(rendered).sort().map((name) => {
        const content = JSON.stringify(rendered[name], null, 2) + '\n'
        return { name, content, size: encoder.encode(content).length }
    })

    return {
        configJsonnet,
        files: outputFiles,
        generatedAt: new Date().toISOString(),
        renderer: 'go-jsonnet-wasm',
    }
}
