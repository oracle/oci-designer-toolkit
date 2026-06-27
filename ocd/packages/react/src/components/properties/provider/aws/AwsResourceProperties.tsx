/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Minimal, generic AWS properties panel. AWS has no codegen-driven per-resource
** property components (unlike OCI/Azure/Google), so a single hand-authored
** component renders the Name plus every editable string field on the selected
** AWS model resource. This keeps the panel useful (not blank) without
** hand-authoring five separate wrappers + configs + proxies.
*/

import { OcdResource } from '@ocd/model'
import { OcdDocument } from '../../../OcdDocument'
import {
    OcdDisplayNameProperty,
    OcdTextProperty,
    ResourceProperties,
    ResourcePropertyAttributes,
} from '../../OcdPropertyTypes'

// OcdResource / AwsResource base + designer-internal keys that must not be
// rendered as editable fields.
const HIDDEN_KEYS = new Set<string>([
    'provider', 'locked', 'editLocked', 'terraformResourceName', 'okitReference',
    'resourceType', 'resourceTypeName', 'id', 'documentation', 'region', 'parentId',
    'displayName', 'name', 'compartmentId',
])

const toLabel = (key: string): string =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .replace(/\bId\b/, 'Id')
        .trim()

const attributeFor = (key: string): ResourcePropertyAttributes => ({
    provider: 'aws',
    key,
    name: key,
    type: 'string',
    subtype: '',
    required: false,
    label: toLabel(key),
    id: key,
    conditional: false,
    condition: {},
})

const displayNameAttribute: ResourcePropertyAttributes = {
    provider: 'aws',
    key: 'displayName',
    name: 'displayName',
    type: 'string',
    subtype: '',
    required: true,
    label: 'Name',
    id: 'displayName',
    conditional: false,
    condition: {},
}

export const AwsResourceProperties = ({ ocdDocument, setOcdDocument, resource, rootResource }: ResourceProperties): JSX.Element => {
    const editableKeys = Object.keys(resource).filter(
        (k) => !HIDDEN_KEYS.has(k) && typeof (resource as Record<string, any>)[k] === 'string',
    )
    return (
        <div>
            <details open={true}>
                <summary>Core</summary>
                <div>
                    <OcdDisplayNameProperty
                        ocdDocument={ocdDocument}
                        setOcdDocument={(d: OcdDocument) => setOcdDocument(d)}
                        resource={resource}
                        rootResource={rootResource}
                        config={undefined}
                        attribute={displayNameAttribute}
                        key={`${resource.id}-displayName`}
                    />
                    {editableKeys.map((k) => (
                        <OcdTextProperty
                            ocdDocument={ocdDocument}
                            setOcdDocument={(d: OcdDocument) => setOcdDocument(d)}
                            resource={resource}
                            rootResource={rootResource}
                            config={undefined}
                            attribute={attributeFor(k)}
                            key={`${resource.id}-${k}`}
                        />
                    ))}
                </div>
            </details>
        </div>
    )
}

export default AwsResourceProperties
