export type OcdClassicCapabilityStatus = 'available' | 'enhanced' | 'partial' | 'planned'

export interface OcdClassicCapability {
    id: string
    capability: string
    classicSurface: string
    nextGenSurface: string
    status: OcdClassicCapabilityStatus
    nextStep: string
}

export interface OcdNextGenEnhancement {
    id: string
    title: string
    summary: string
}

export const okitClassicDesktopViews: OcdClassicCapability[] = [
    {
        id: 'design-view',
        capability: 'Freeform visual design canvas',
        classicSurface: 'Design view with editable resource properties and resource descriptions',
        nextGenSurface: 'Designer canvas, properties panel, drag-to-connect mode, architecture templates',
        status: 'enhanced',
        nextStep: 'Keep adding curated OCI services and association wiring as schema coverage expands.'
    },
    {
        id: 'documentation-view',
        capability: 'Documentation view',
        classicSurface: 'Generated documentation page for the active design',
        nextGenSurface: 'Documentation and Markdown pages backed by the current OcdDocument',
        status: 'available',
        nextStep: 'Add Landing Zone and discovery summaries to generated documentation.'
    },
    {
        id: 'variables-view',
        capability: 'Variables view',
        classicSurface: 'Variable inspection and editing',
        nextGenSurface: 'Variables page with current design variable metadata',
        status: 'available',
        nextStep: 'Add landing-zone-aware variable grouping and validation hints.'
    },
    {
        id: 'common-tags-view',
        capability: 'Common Tags view',
        classicSurface: 'Common freeform and defined tags for resources',
        nextGenSurface: 'Common Tags page plus Enterprise IAM blueprint tag namespace and cost-tracking tags',
        status: 'enhanced',
        nextStep: 'Surface tag compliance deltas from Governance.'
    },
    {
        id: 'markdown-view',
        capability: 'Markdown view',
        classicSurface: 'Markdown rendering of the design model',
        nextGenSurface: 'Markdown page and Markdown export',
        status: 'available',
        nextStep: 'Add discovery/LZNG appendix sections to Markdown export.'
    },
    {
        id: 'tabular-view',
        capability: 'Tabular view',
        classicSurface: 'Table view of design resources',
        nextGenSurface: 'Tabular page with resource-specific generated tables and Excel export',
        status: 'available',
        nextStep: 'Add saved column presets for discovery and migration review.'
    },
    {
        id: 'terraform-view',
        capability: 'Terraform view',
        classicSurface: 'Generated Terraform view for the current design',
        nextGenSurface: 'Terraform page, Terraform export, Terraform import, Landing Zone plan/diff',
        status: 'enhanced',
        nextStep: 'Add Resource Manager package validation before export handoff.'
    }
]

export const okitClassicImportExportCapabilities: OcdClassicCapability[] = [
    {
        id: 'image-export',
        capability: 'Image export',
        classicSurface: 'SVG, PNG, and JPEG export from the visual design',
        nextGenSurface: 'Image/SVG export pipeline through the current design canvas exporters',
        status: 'partial',
        nextStep: 'Expose PNG/JPEG affordances consistently from the desktop menu alongside SVG.'
    },
    {
        id: 'markdown-export',
        capability: 'Markdown export',
        classicSurface: 'Markdown documentation generation',
        nextGenSurface: 'Markdown exporter and Markdown page',
        status: 'available',
        nextStep: 'Extend exported Markdown with governance, discovery, and LZNG sections.'
    },
    {
        id: 'terraform-export',
        capability: 'Terraform export',
        classicSurface: 'Terraform output for designed resources',
        nextGenSurface: 'Generated Terraform exporter plus LZNG import/plan comparison',
        status: 'enhanced',
        nextStep: 'Add pre-export checks for required variables, regions, and association completeness.'
    },
    {
        id: 'resource-manager-export',
        capability: 'OCI Resource Manager handoff',
        classicSurface: 'Resource Manager integration for rapid prototyping and build handoff',
        nextGenSurface: 'Resource Manager export dialog and Terraform package generation path',
        status: 'available',
        nextStep: 'Add package manifest preview and validation results before stack creation.'
    },
    {
        id: 'excel-export',
        capability: 'Excel export',
        classicSurface: 'Desktop export option for detailed tabular data',
        nextGenSurface: 'Generated Excel exporter for curated OCI resource surfaces',
        status: 'available',
        nextStep: 'Add discovery snapshot inventory sheets to the Excel export.'
    },
    {
        id: 'portable-json',
        capability: 'Portable JSON model',
        classicSurface: 'Generic JSON from query/introspection for visualization and automation',
        nextGenSurface: 'OcdDocument JSON, OKIT export, OCI discovery snapshots, and draw.io/Terraform import paths',
        status: 'enhanced',
        nextStep: 'Add import review and mapping confidence before opening queried environments on the canvas.'
    },
    {
        id: 'oci-query-import',
        capability: 'OCI query and introspection',
        classicSurface: 'Embedded OCI query functionality for existing environments',
        nextGenSurface: 'Desktop OCI query IPC, web-server discovery endpoints, Discovery Workbench',
        status: 'enhanced',
        nextStep: 'Expand discovery adapters and OCI mapping rules for remaining workload and platform services.'
    },
    {
        id: 'terraform-import',
        capability: 'Terraform import',
        classicSurface: 'Desktop Terraform import option',
        nextGenSurface: 'Terraform importer, Landing Zone file import, draw.io import',
        status: 'enhanced',
        nextStep: 'Add batch import diagnostics and unresolved reference repair suggestions.'
    }
]

export const okitNextGenEnhancements: OcdNextGenEnhancement[] = [
    {
        id: 'lzng',
        title: 'Landing Zone Next-Gen',
        summary: 'Wizard, jsonnet-WASM generation, LZNG import, live scaffold reconcile, plan/diff, and add-on overlays.'
    },
    {
        id: 'governance',
        title: 'Governance and reachability',
        summary: 'Public exposure, segmentation, tags, budgets, database placement, route-table gaps, and remediation guidance.'
    },
    {
        id: 'discovery',
        title: 'Discovery Workbench',
        summary: 'Inventory, topology, analytics, OCI target mapping, migration waves, and LZ recommendations.'
    },
    {
        id: 'catalog',
        title: 'Expanded OCI service catalog',
        summary: 'Curated/generated OCI resources including discovery and migration services such as Cloud Bridge and Cloud Migrations.'
    }
]

export const okitClassicCapabilities = [
    ...okitClassicDesktopViews,
    ...okitClassicImportExportCapabilities
]

export const summarizeClassicParity = (capabilities: OcdClassicCapability[] = okitClassicCapabilities): Record<OcdClassicCapabilityStatus, number> => capabilities.reduce(
    (summary, capability) => ({
        ...summary,
        [capability.status]: summary[capability.status] + 1
    }),
    {
        available: 0,
        enhanced: 0,
        partial: 0,
        planned: 0
    }
)
