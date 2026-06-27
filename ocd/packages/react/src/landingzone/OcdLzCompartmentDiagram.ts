/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** TypeScript port of the LZNG `compartmentDiagram.js` service. Reads iam.json's
** compartments_configuration.compartments tree and shapes it into the diagram
** model (root, shared infra compartments, and per-environment compartments).
*/

import { GeneratedFile } from './OcdLzGenerator'

const SHARED_COMPARTMENT_ORDER = ['cmp-lz-network', 'cmp-lz-security', 'cmp-lz-platform']

export interface DiagramNode {
    key: string
    name: string
    description: string
    children: DiagramNode[]
}

export interface CompartmentDiagram {
    root: DiagramNode | null
    shared: DiagramNode[]
    environments: DiagramNode[]
}

interface RawCompartment {
    name?: string
    description?: string
    children?: Record<string, RawCompartment>
}

interface IamContent {
    compartments_configuration?: {
        compartments?: Record<string, RawCompartment>
    }
}

function toDiagramNode(key: string, value: RawCompartment = {}): DiagramNode {
    const children = value.children || {}
    return {
        key,
        name: value.name || key,
        description: value.description || '',
        children: Object.keys(children).sort().map((childKey) => toDiagramNode(childKey, children[childKey])),
    }
}

function sharedOrder(node: DiagramNode): number {
    const index = SHARED_COMPARTMENT_ORDER.indexOf(node.name)
    return index === -1 ? SHARED_COMPARTMENT_ORDER.length : index
}

export function buildCompartmentDiagram(iamContent: string | IamContent): CompartmentDiagram {
    const iam: IamContent = typeof iamContent === 'string' ? JSON.parse(iamContent) : iamContent
    const compartments = iam?.compartments_configuration?.compartments || {}
    const roots = Object.keys(compartments).sort().map((key) => toDiagramNode(key, compartments[key]))
    const root = roots[0] || null
    const children = root?.children || []
    const shared = children
        .filter((node) => SHARED_COMPARTMENT_ORDER.includes(node.name))
        .sort((a, b) => sharedOrder(a) - sharedOrder(b))
    const environments = children
        .filter((node) => !SHARED_COMPARTMENT_ORDER.includes(node.name))
        .sort((a, b) => a.name.localeCompare(b.name))

    return { root, shared, environments }
}

export function findGeneratedFile(files: GeneratedFile[], name: string): string | null {
    return files.find((file) => file.name === name)?.content || null
}
