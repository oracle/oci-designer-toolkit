/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Schema-driven properties panel for runtime custom stencils. The manifest stored
** on design.userDefined.customStencils[resource.class] declares each editable
** property (string/number/boolean); we render a Name field plus one input per
** property, bound to the matching TOP-LEVEL field on the model resource. When the
** manifest is missing (e.g. a design opened without re-importing the stencil) we
** fall back to a generic "every editable field" panel so the user is never blocked.
*/

import { OcdDocument } from '../../../OcdDocument'
import {
    OcdBooleanProperty,
    OcdDisplayNameProperty,
    OcdNumberProperty,
    OcdTextProperty,
    ResourceProperties,
    ResourcePropertyAttributes,
} from '../../OcdPropertyTypes'
import { CustomStencilManifest, CustomStencilProperty } from '../../../../stencils/OcdStencilRegistry'

// OcdResource / CustomResource base + designer-internal keys that must not be
// rendered as editable fields in the generic fallback.
const HIDDEN_KEYS = new Set<string>([
    'provider', 'locked', 'editLocked', 'terraformResourceName', 'okitReference',
    'resourceType', 'resourceTypeName', 'id', 'documentation', 'parentId',
    'displayName', 'name', 'compartmentId', 'class',
])

const toLabel = (key: string): string =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim()

const baseAttribute = (key: string, label: string, type: string): ResourcePropertyAttributes => ({
    provider: 'custom',
    key,
    name: key,
    type,
    subtype: '',
    required: false,
    label,
    id: key,
    conditional: false,
    condition: {},
})

const displayNameAttribute: ResourcePropertyAttributes = {
    provider: 'custom',
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

const PropertyField = ({ property, ocdDocument, setOcdDocument, resource, rootResource }: {
    property: CustomStencilProperty
} & ResourceProperties): JSX.Element => {
    const attribute = baseAttribute(property.key, property.label || toLabel(property.key), property.type)
    const common = {
        ocdDocument,
        setOcdDocument: (d: OcdDocument) => setOcdDocument(d),
        resource,
        rootResource,
        config: undefined,
        attribute,
        key: `${resource.id}-${property.key}`,
    }
    if (property.type === 'number') return <OcdNumberProperty {...common} />
    if (property.type === 'boolean') return <OcdBooleanProperty {...common} />
    return <OcdTextProperty {...common} />
}

export const CustomResourceProperties = ({ ocdDocument, setOcdDocument, resource, rootResource }: ResourceProperties): JSX.Element => {
    const stencils = ocdDocument?.design?.userDefined?.customStencils as Record<string, CustomStencilManifest> | undefined
    const manifest = stencils ? stencils[(resource as Record<string, any>).class] : undefined

    // Generic fallback: render every editable string field (mirrors AwsResourceProperties).
    const fallbackKeys = Object.keys(resource).filter(
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
                    {manifest
                        ? manifest.properties.map((property) => (
                              <PropertyField
                                  property={property}
                                  ocdDocument={ocdDocument}
                                  setOcdDocument={setOcdDocument}
                                  resource={resource}
                                  rootResource={rootResource}
                                  key={`${resource.id}-${property.key}`}
                              />
                          ))
                        : fallbackKeys.map((k) => (
                              <OcdTextProperty
                                  ocdDocument={ocdDocument}
                                  setOcdDocument={(d: OcdDocument) => setOcdDocument(d)}
                                  resource={resource}
                                  rootResource={rootResource}
                                  config={undefined}
                                  attribute={baseAttribute(k, toLabel(k), 'string')}
                                  key={`${resource.id}-${k}`}
                              />
                          ))}
                </div>
            </details>
        </div>
    )
}

export default CustomResourceProperties
