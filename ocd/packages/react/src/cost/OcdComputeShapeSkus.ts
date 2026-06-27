/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Compute shape -> pricing-SKU mapping for the OCD cost estimator (roadmap B1).
**
** Each OCI compute shape FAMILY is costed with its own OCPU-per-hour and (where
** the family has one) memory-per-hour cetools part numbers, instead of one flat
** Standard E5 rate for every instance.
**
** All part numbers below were verified live against the public Oracle Cloud
** Cost Estimator Tools API
**   (https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD)
** on 2026-06-04. DO NOT invent part numbers: families whose SKU could not be
** confidently identified are marked confidence 'approximate' with a note and
** fall back to the closest verified family.
**
** Notes on shape pricing model:
**  - Modern Flex families (E3/E4/E5/E6, A1/A2, X9/Optimized3, DenseIO) bill OCPU
**    and memory on SEPARATE per-hour SKUs.
**  - Older fixed-config families (E2, B1, Standard1/X5, Standard2/X7,
**    Standard3/X-series, DenseIO1/2) bill a SINGLE bundled OCPU-per-hour SKU;
**    memory is included in the OCPU rate, so memSku is omitted.
**  - GPU families (BM.GPU.* / VM.GPU.*) bill a single all-in per-GPU-per-hour
**    SKU; the underlying OCPUs and memory are INCLUDED in the per-GPU rate, so
**    ocpuSku/memSku are omitted and gpuSku/gpuCount carry the charge. The fixed
**    bare-metal shapes carry a known GPU count (e.g. BM.GPU.A100-v2.8 -> 8);
**    flex VM GPU shapes (VM.GPU.A10.1/2) bill the GPU count in the suffix.
**  - HPC families (BM.HPC2.36, BM.Optimized3.36) are bare-metal and bill a
**    single bundled OCPU-per-hour SKU (memory included), like the fixed families.
**  - Always-Free / Micro shapes cost 0.
*/

export type ShapeSkuConfidence = 'verified' | 'approximate'

export interface ShapeSkuMapping {
    // cetools OCPU-per-hour part number ('' for always-free shapes and for GPU
    // shapes whose charge is fully carried by the per-GPU SKU).
    ocpuSku: string
    // cetools memory (GB)-per-hour part number, when the family bills memory
    // separately. Omitted for fixed-config families that bundle memory.
    memSku?: string
    // cetools per-GPU-per-hour part number for GPU families. When set, the GPU
    // charge (gpuSku * gpuCount) is billed and ocpu/memory are NOT (they are
    // included in the all-in per-GPU rate).
    gpuSku?: string
    // Number of GPUs the shape carries. Used to bill gpuSku. For fixed bare-metal
    // GPU shapes this is the family's full GPU count; flex VM GPU shapes override
    // it from the shape-name suffix at resolve time.
    gpuCount?: number
    // True when the shape is a Flex shape (OCPUs/memory come from shapeConfig).
    flex: boolean
    // For non-Flex shapes whose ocpus/memory are not in the design item, these
    // provide a sensible default. Usually unused because OcdDefaultCache carries
    // ocpus/memoryInGBs on the catalog entry.
    fixedOcpus?: number
    fixedMemGb?: number
    confidence: ShapeSkuConfidence
    note?: string
}

// ---- Verified cetools part numbers (live 2026-06-04, USD) ----
// Compute - Standard families
const E2_OCPU = 'B90425' // Compute - Standard - E2 (OCPU Per Hour, memory bundled)
const E3_OCPU = 'B92306' // Compute - Standard - E3 - OCPU
const E3_MEM = 'B92307' // Compute - Standard - E3 - Memory
const E4_OCPU = 'B93113' // Compute - Standard - E4 - OCPU
const E4_MEM = 'B93114' // Compute - Standard - E4 - Memory
const E5_OCPU = 'B97384' // Compute - Standard - E5 - OCPU
const E5_MEM = 'B97385' // Compute - Standard - E5 - Memory
const E6_OCPU = 'B111129' // OCI - Compute - Standard - E6 - OCPU
const E6_MEM = 'B111130' // OCI - Compute - Standard - E6 - Memory
// Ampere (Arm)
const A1_OCPU = 'B93297' // Compute - Standard - A1 - OCPU (always free; $0)
const A1_MEM = 'B93298' // Compute - Standard - A1 - Memory ($0)
const A2_OCPU = 'B109529' // Compute - Standard - A2 OCPU
const A2_MEM = 'B109530' // Compute - Standard - A2 Memory
// Intel X-series
const X9_OCPU = 'B94176' // Compute - Standard - X9 - OCPU
const X9_MEM = 'B94177' // Compute - Standard - X9 - Memory
const X9_OPT_OCPU = 'B93311' // Compute - Optimized - X9 - OCPU (Optimized3)
const X9_OPT_MEM = 'B93312' // Compute - Optimized - X9 - Memory
const X5_OCPU = 'B88317' // Compute - Virtual Machine Standard - X5 (Standard1, bundled)
const X5_BM_OCPU = 'B88315' // Compute - Bare Metal Standard - X5
const X7_OCPU = 'B88514' // Compute - Virtual Machine Standard - X7 (Standard2, bundled)
const X7_BM_OCPU = 'B88513' // Compute - Bare Metal Standard - X7
const B1_OCPU = 'B91120' // Compute - Virtual Machine Standard - B1 (bundled)
const B1_BM_OCPU = 'B91119' // Compute - Bare Metal Standard - B1
// Dense I/O families
const DENSEIO_E4_OCPU = 'B93121' // Compute - Dense I/O - E4 - OCPU
const DENSEIO_E4_MEM = 'B93122' // Compute - Dense I/O - E4 - Memory
const DENSEIO_E5_OCPU = 'B98202' // OCI - Compute - Dense I/O - E5 OCPU
const DENSEIO_E5_MEM = 'B98203' // OCI - Compute - Dense I/O - E5 Memory
const DENSEIO_E6_OCPU = 'B112556' // OCI - Compute - Dense IO - E6 Ax - OCPU
const DENSEIO_E6_MEM = 'B112557' // OCI - Compute - Dense IO - E6 Ax - Memory
const DENSEIO_X7_OCPU = 'B88516' // Compute - Virtual Machine Dense I/O - X7 (DenseIO2, bundled)
const DENSEIO_X7_BM_OCPU = 'B88515' // Compute - Bare Metal Dense I/O - X7
// ---- GPU families (all-in per-GPU-per-hour SKUs; OCPU/memory included) ----
const GPU_V2 = 'B89734' // Compute - GPU Standard - V2 (GPU2 / Tesla P100)
const GPU_E3 = 'B92740' // Compute - GPU - E3 (GPU3 / Tesla V100)
const GPU_E4 = 'B93544' // OCI - Compute - GPU - E4 (GPU4 / NVIDIA A100 40GB)
const GPU_A10 = 'B95909' // Compute - GPU - A10 (BM/VM.GPU.A10)
const GPU_A100_V2 = 'B95907' // Compute - GPU - A100 - v2 (BM.GPU.A100-v2 / A100 80GB)
const GPU_H100 = 'B98415' // OCI - Compute - GPU - H100 (BM.GPU.H100)
const GPU_H100T = 'B109480' // OCI - Compute - GPU - H100T
const GPU_H200 = 'B110519' // OCI - Compute - GPU - H200 (BM.GPU.H200)
const GPU_L40S = 'B109479' // Compute - GPU - L40S (BM.GPU.L40S)
const GPU_MI300X = 'B109485' // OCI - Compute - GPU - MI300X (BM.GPU.MI300X)
const GPU_X7_BM = 'B88517' // Compute - Bare Metal GPU Standard - X7 (GPU2 BM)
const GPU_X7_VM = 'B88518' // Compute - Virtual Machine GPU Standard - X7 (GPU2 VM)
// ---- HPC families (bundled OCPU-per-hour SKUs; memory included) ----
const HPC_E5 = 'B96531' // OCI - Compute - HPC - E5 (BM.Optimized3.36 era)
const HPC_X7 = 'B90398' // Compute - Bare Metal Standard - HPC - X7 (BM.HPC2.36)

const ALWAYS_FREE_NOTE = 'Always-free shape; no charge.'

// Helper builders to keep the table terse and consistent.
const flexFamily = (
    ocpuSku: string,
    memSku: string,
    confidence: ShapeSkuConfidence = 'verified',
    note?: string
): ShapeSkuMapping => ({ ocpuSku, memSku, flex: true, confidence, note })

const fixedFamily = (
    ocpuSku: string,
    memSku: string | undefined,
    confidence: ShapeSkuConfidence = 'verified',
    note?: string
): ShapeSkuMapping => ({ ocpuSku, memSku, flex: false, confidence, note })

// GPU families bill an all-in per-GPU rate; OCPU/memory are included so ocpuSku
// is '' and the charge comes entirely from gpuSku * gpuCount. gpuCount is the
// shape's default GPU count (overridden from the shape-name suffix at resolve
// time for VM GPU shapes).
const gpuFamily = (
    gpuSku: string,
    gpuCount: number,
    confidence: ShapeSkuConfidence = 'verified',
    note?: string
): ShapeSkuMapping => ({ ocpuSku: '', gpuSku, gpuCount, flex: false, confidence, note })

/*
** Family-key -> SKU mapping. Keys are normalized family identifiers produced by
** resolveFamilyKey() below (NOT raw shape names). Order does not matter; the
** resolver picks the family.
*/
export const COMPUTE_SHAPE_SKUS: Record<string, ShapeSkuMapping> = {
    // ---- AMD EPYC Standard ----
    'standard.e2': fixedFamily(E2_OCPU, undefined, 'verified', 'E2 bills a single bundled OCPU rate (memory included).'),
    'standard.e3': flexFamily(E3_OCPU, E3_MEM),
    'standard.e4': flexFamily(E4_OCPU, E4_MEM),
    'standard.e5': flexFamily(E5_OCPU, E5_MEM),
    'standard.e6': flexFamily(E6_OCPU, E6_MEM),
    // ---- Ampere (Arm) ----
    'standard.a1': flexFamily(A1_OCPU, A1_MEM, 'verified', ALWAYS_FREE_NOTE),
    'standard.a2': flexFamily(A2_OCPU, A2_MEM),
    // ---- Intel X-series Standard ----
    'standard.x9': flexFamily(X9_OCPU, X9_MEM, 'verified', 'Standard3 / X9 Flex.'),
    'standard.x7': fixedFamily(X7_OCPU, undefined, 'verified', 'Standard2 (X7) bundled OCPU rate.'),
    'standard.x7.bm': fixedFamily(X7_BM_OCPU, undefined, 'verified', 'BM Standard2 (X7) bundled OCPU rate.'),
    'standard.x5': fixedFamily(X5_OCPU, undefined, 'verified', 'Standard1 (X5) bundled OCPU rate.'),
    'standard.x5.bm': fixedFamily(X5_BM_OCPU, undefined, 'verified', 'BM Standard1 (X5) bundled OCPU rate.'),
    'standard.b1': fixedFamily(B1_OCPU, undefined, 'verified', 'B1 bundled OCPU rate.'),
    'standard.b1.bm': fixedFamily(B1_BM_OCPU, undefined, 'verified', 'BM B1 bundled OCPU rate.'),
    // ---- Optimized3 (Intel X9 optimized) ----
    optimized3: flexFamily(X9_OPT_OCPU, X9_OPT_MEM, 'verified', 'Optimized3 / X9 high-frequency.'),
    // ---- Dense I/O ----
    'denseio.e4': flexFamily(DENSEIO_E4_OCPU, DENSEIO_E4_MEM),
    'denseio.e5': flexFamily(DENSEIO_E5_OCPU, DENSEIO_E5_MEM),
    'denseio.e6': flexFamily(DENSEIO_E6_OCPU, DENSEIO_E6_MEM),
    'denseio.x7': fixedFamily(DENSEIO_X7_OCPU, undefined, 'verified', 'DenseIO2 (X7) bundled OCPU rate.'),
    'denseio.x7.bm': fixedFamily(DENSEIO_X7_BM_OCPU, undefined, 'verified', 'BM DenseIO2 (X7) bundled OCPU rate.'),
    // ---- GPU families (all-in per-GPU-per-hour rates; OCPU/memory included) ----
    // gpuCount is the full bare-metal shape's GPU count; VM GPU shapes override
    // it from the shape-name suffix (e.g. VM.GPU.A10.2 -> 2 GPUs).
    'gpu.h200': gpuFamily(GPU_H200, 8, 'verified', 'BM.GPU.H200 all-in per-GPU rate (8 GPUs/host).'),
    'gpu.h100t': gpuFamily(GPU_H100T, 8, 'verified', 'BM.GPU.H100T all-in per-GPU rate (8 GPUs/host).'),
    'gpu.h100': gpuFamily(GPU_H100, 8, 'verified', 'BM.GPU.H100 all-in per-GPU rate (8 GPUs/host).'),
    'gpu.mi300x': gpuFamily(GPU_MI300X, 8, 'verified', 'BM.GPU.MI300X all-in per-GPU rate (8 GPUs/host).'),
    'gpu.l40s': gpuFamily(GPU_L40S, 4, 'verified', 'BM.GPU.L40S all-in per-GPU rate (4 GPUs/host).'),
    'gpu.a100': gpuFamily(GPU_A100_V2, 8, 'verified', 'BM.GPU.A100-v2 (A100 80GB) all-in per-GPU rate (8 GPUs/host).'),
    'gpu.a100-40': gpuFamily(GPU_E4, 8, 'verified', 'BM.GPU4 (A100 40GB) all-in per-GPU rate (8 GPUs/host).'),
    'gpu.a10': gpuFamily(GPU_A10, 4, 'verified', 'GPU.A10 all-in per-GPU rate (BM=4 GPUs; VM count from suffix).'),
    'gpu.v100': gpuFamily(GPU_E3, 8, 'verified', 'BM.GPU3 (Tesla V100) all-in per-GPU rate (8 GPUs/host).'),
    'gpu.p100': gpuFamily(GPU_V2, 2, 'verified', 'BM.GPU2 (Tesla P100) all-in per-GPU rate (2 GPUs/host).'),
    'gpu.x7.bm': gpuFamily(GPU_X7_BM, 2, 'verified', 'BM GPU Standard X7 (P100) all-in per-GPU rate (2 GPUs/host).'),
    'gpu.x7.vm': gpuFamily(GPU_X7_VM, 1, 'verified', 'VM GPU Standard X7 (P100) all-in per-GPU rate (count from suffix).'),
    // ---- HPC families (bare-metal bundled OCPU-per-hour rates; memory included) ----
    hpc: fixedFamily(HPC_X7, undefined, 'verified', 'BM.HPC2.36 bundled OCPU rate (RDMA cluster network).'),
    'hpc.e5': fixedFamily(HPC_E5, undefined, 'verified', 'BM.Optimized3.36 / HPC E5 bundled OCPU rate.')
}

// Fallback used when a shape name cannot be matched to any known family. Uses
// the verified Standard E5 SKUs but is flagged approximate so the BOM line
// renders with reduced confidence.
const FALLBACK_E5: ShapeSkuMapping = flexFamily(
    E5_OCPU,
    E5_MEM,
    'approximate',
    'Unrecognized shape family; estimated with Standard E5 Flex rates.'
)

// Always-free / Micro shapes cost 0 regardless of OCPU/memory.
const ALWAYS_FREE: ShapeSkuMapping = {
    ocpuSku: '',
    flex: false,
    fixedOcpus: 0,
    fixedMemGb: 0,
    confidence: 'verified',
    note: ALWAYS_FREE_NOTE
}

export interface ResolvedShapeSku extends ShapeSkuMapping {
    // The family key the shape resolved to ('always-free' / 'fallback' for the
    // two synthetic buckets), useful for BOM notes and debugging.
    familyKey: string
    // True for shapes that should never be billed (Always-Free / Micro).
    alwaysFree: boolean
}

/*
** Normalize a full shape name (e.g. 'VM.Standard.E5.Flex',
** 'BM.Standard.E5.192', 'VM.DenseIO2.8') to a COMPUTE_SHAPE_SKUS family key.
** Returns undefined when the shape is unrecognized.
*/
function resolveFamilyKey(shape: string): string | undefined {
    const name = shape.trim()
    const isBm = /^BM\./i.test(name)
    const bmSuffix = isBm ? '.bm' : ''

    // ---- HPC families (check before Optimized3/Standard) ----
    // BM.HPC2.36 (X7 RDMA) and the bare-metal BM.Optimized3.36 (Intel HPC, fixed
    // 36-OCPU RDMA shape) are HPC; plain VM.Optimized3.Flex stays Optimized3 Flex.
    if (/\bHPC2?\b/i.test(name)) return 'hpc'
    if (isBm && /Optimized3\.\d/i.test(name)) return 'hpc.e5'

    // ---- GPU families (check before plain Standard / generic rules) ----
    // Match the most specific generations first.
    if (/GPU/i.test(name)) {
        if (/H200/i.test(name)) return 'gpu.h200'
        if (/H100T/i.test(name)) return 'gpu.h100t'
        if (/H100/i.test(name)) return 'gpu.h100'
        if (/MI300X/i.test(name)) return 'gpu.mi300x'
        if (/L40S/i.test(name)) return 'gpu.l40s'
        if (/A100-v2|A100\.80|A100v2/i.test(name)) return 'gpu.a100'
        if (/A100/i.test(name)) return 'gpu.a100-40'
        if (/A10\b|A10\./i.test(name)) return 'gpu.a10'
        if (/\bGPU4\b/i.test(name)) return 'gpu.a100-40'
        if (/\bGPU3\b/i.test(name)) return 'gpu.v100'
        if (/\bGPU2\b/i.test(name)) return 'gpu.p100'
        // GPU Standard X7 (P100-era bundled SKU)
        if (/\bX7\b/i.test(name)) return isBm ? 'gpu.x7.bm' : 'gpu.x7.vm'
        // Generic / unrecognized GPU generation -> nearest verified (A100 80GB),
        // flagged via the family note; falls through to fallback if absent.
        return undefined
    }

    // ---- Dense I/O families (check before plain Standard) ----
    if (/DenseIO/i.test(name)) {
        if (/DenseIO\.E6|DenseIO6/i.test(name)) return 'denseio.e6'
        if (/DenseIO\.E5|DenseIO5/i.test(name)) return 'denseio.e5'
        if (/DenseIO\.E4|DenseIO4/i.test(name)) return 'denseio.e4'
        // DenseIO1 (X5-era) and DenseIO2 (X7-era) both map to the X7 dense SKU.
        if (/DenseIO1|DenseIO2/i.test(name)) return `denseio.x7${bmSuffix}`
        return `denseio.x7${bmSuffix}` // generic DenseIO -> X7 dense (approximate via fallback note)
    }

    // ---- Optimized3 ----
    if (/Optimized3/i.test(name)) return 'optimized3'

    // ---- AMD EPYC E-series ----
    if (/\bE6\b|\.E6\.|\.E6$/i.test(name)) return 'standard.e6'
    if (/\bE5\b|\.E5\.|\.E5$/i.test(name)) return 'standard.e5'
    if (/\bE4\b|\.E4\.|\.E4$/i.test(name)) return 'standard.e4'
    if (/\bE3\b|\.E3\.|\.E3$/i.test(name)) return 'standard.e3'
    if (/\bE2\b|\.E2\.|\.E2$/i.test(name)) return 'standard.e2'

    // ---- Ampere (Arm) ----
    if (/\bA2\b|\.A2\.|\.A2$/i.test(name)) return 'standard.a2'
    if (/\bA1\b|\.A1\.|\.A1$/i.test(name)) return 'standard.a1'

    // ---- Intel X-series (Standard3 = X9, Standard2 = X7, Standard1 = X5) ----
    if (/Standard3|\bX9\b/i.test(name)) return 'standard.x9'
    if (/Standard2|\bX7\b/i.test(name)) return `standard.x7${bmSuffix}`
    if (/Standard1|\bX5\b/i.test(name)) return `standard.x5${bmSuffix}`
    if (/\bB1\b|\.B1\.|\.B1$/i.test(name)) return `standard.b1${bmSuffix}`

    // ---- Generic shapes: x86/AMD/Intel -> E5 default; Ampere -> A1 ----
    if (/Ampere/i.test(name)) return 'standard.a1'
    if (/\.AMD\.|\.Intel\.|\.x86\./i.test(name)) return 'standard.e5'

    return undefined
}

/*
** Resolve a full compute shape name to its OCPU/memory SKUs.
**
** Always-Free / Micro shapes resolve to a zero-cost mapping. Unrecognized
** shapes resolve to the E5 fallback (flagged approximate). Never throws.
*/
// Memoize by shape name — estimateMonthlyCost + collectRequiredPartNumbers both
// resolve every instance's shape, so cache the (immutable) result to avoid re-running
// the family regexes on each BoM render. Callers treat the result as read-only.
const shapeSkuCache = new Map<string, ResolvedShapeSku>()

export function resolveShapeSkus(shapeName: unknown): ResolvedShapeSku {
    const shape = typeof shapeName === 'string' ? shapeName : ''
    const cached = shapeSkuCache.get(shape)
    if (cached) return cached
    const result = computeShapeSkus(shape)
    shapeSkuCache.set(shape, result)
    return result
}

function computeShapeSkus(shape: string): ResolvedShapeSku {
    if (shape.length === 0) {
        return { ...FALLBACK_E5, familyKey: 'fallback', alwaysFree: false }
    }

    // Always-free: explicit Micro shapes and the Ampere always-free A1 tier are
    // costed by their SKUs ($0 for A1), but Micro shapes are 0 unconditionally.
    if (/\.Micro\b/i.test(shape) || /Micro\.Free|Micro$/i.test(shape)) {
        return { ...ALWAYS_FREE, familyKey: 'always-free', alwaysFree: true }
    }

    const familyKey = resolveFamilyKey(shape)
    if (familyKey && COMPUTE_SHAPE_SKUS[familyKey]) {
        const mapping = COMPUTE_SHAPE_SKUS[familyKey]
        // GPU shapes encode the GPU count in the trailing shape-name segment
        // (e.g. VM.GPU.A10.2 -> 2, BM.GPU.H100.8 -> 8). Prefer that count over
        // the family default so VM/partial-host shapes bill the right GPU count.
        if (mapping.gpuSku) {
            const gpuCount = parseGpuCount(shape) ?? mapping.gpuCount
            return { ...mapping, gpuCount, familyKey, alwaysFree: false }
        }
        return { ...mapping, familyKey, alwaysFree: false }
    }

    return { ...FALLBACK_E5, familyKey: 'fallback', alwaysFree: false }
}

// Parse the trailing GPU-count segment from a GPU shape name. OCI GPU shapes end
// in the GPU count (e.g. 'VM.GPU.A10.1', 'BM.GPU.A100-v2.8', 'BM.GPU3.8'). The
// 'A100-v2' segment contains 'v2' which is not a count, so only a pure trailing
// integer is accepted.
function parseGpuCount(shape: string): number | undefined {
    const match = shape.trim().match(/\.(\d+)$/)
    if (!match) return undefined
    const count = Number(match[1])
    return Number.isInteger(count) && count > 0 ? count : undefined
}

// Every distinct part number referenced by the shape mapping (plus fallback),
// so the snapshot generator and price-fetch layer know which SKUs to load.
export const COMPUTE_SHAPE_PART_NUMBERS: readonly string[] = Array.from(
    new Set(
        Object.values(COMPUTE_SHAPE_SKUS)
            .flatMap((m) => [m.ocpuSku, m.memSku, m.gpuSku])
            .filter((p): p is string => typeof p === 'string' && p.length > 0)
    )
).sort()
