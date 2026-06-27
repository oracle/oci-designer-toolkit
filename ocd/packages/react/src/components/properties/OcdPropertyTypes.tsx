/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from '../OcdDocument'
import { useEffect, useMemo } from 'react'
import { useCache } from '../../contexts/OcdCacheContext'
import { usePropertyField, propertyCodecs } from './usePropertyField'

export interface ResourcePropertyCondition extends OcdUtils.ResourcePropertyCondition {}

export interface ResourcePropertyAttributes {
    provider: string
    key: string
    name: string
    type: string
    subtype: string
    required: boolean
    label: string
    id: string
    attributes?: {[key: string]: ResourcePropertyAttributes}
    staticLookup?: boolean
    cacheLookup?: boolean
    lookup?: boolean
    lookupResource?: string,
    lookupResourceElement?: string,
    conditional: boolean,
    condition: ResourcePropertyCondition | ResourcePropertyCondition[],
    default?: string | number | boolean
    row?: number
}

export type SimpleFilterType = (r: any) => boolean

export type ResourceFilterType = (r: any, resource: any, rootResource: OcdResource) => boolean

export interface ResourceElementProperties extends Record<string, any> {
    pattern?: string
    min?: number
    max?: number
    title?: string
    maxLength?: number
    placeholder?: string
}

export interface ResourceElementConfig extends Record<string, any> {
    id: string
    properties: ResourceElementProperties // HTML input field properties
    resourceFilter?: ResourceFilterType // Filter function for Resource Selects. Checks Resource attributes against array element attributes
    simpleFilter?: SimpleFilterType     // Filter function for Reference Selects. Simple test of array element attribute against constant
    displayCondition?(): boolean        // Function to identify if conditional elements should be displayed
    configs: ResourceElementConfig[]
    options?: ResourceElementConfigOption[]
    lookupGroups?: ResourceElementConfigLookupGroup[]
    summary?: Function
}
export interface ResourceElementConfigOption {
    id: string
    displayName: string
}
export interface ResourceElementConfigLookupGroup {
    displayName: string,
    lookupResource?: string
    resources?: OcdResource[]
    simpleFilter?: SimpleFilterType     // Filter function for Reference Selects. Simple test of array element attribute against constant
}
export interface ResourceAdditionElements {
    jsxElement: Function
    afterElement?: string
}

export interface ResourceRootProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdResource
}

export interface GeneratedResourceRootProperties extends ResourceRootProperties {
    configs: ResourceElementConfig[]
    additionalElements?: ResourceAdditionElements[]
    summaryTitle?: string | Function
    onDelete?(child: any): void
}

export interface ResourceProperties {
    ocdDocument: OcdDocument
    setOcdDocument: React.Dispatch<any>
    resource: OcdResource
    rootResource: OcdResource
    summaryTitle?: string | Function
    onDelete?(child: any): void
}

export interface GeneratedResourceProperties extends ResourceProperties {
    configs: ResourceElementConfig[]
    onDelete?(child: any): void
    additionalElements?: ResourceAdditionElements[]
    row?: number
}

export interface ResourceProperty extends ResourceProperties {
    config: ResourceElementConfig | undefined
    attribute: ResourcePropertyAttributes
}

export const isPropertyDisplayConditionTrue = (conditional: boolean, condition: ResourcePropertyCondition | ResourcePropertyCondition[], resource: OcdResource, rootResource: OcdResource): boolean => {
    return OcdUtils.isPropertyConditionTrue(conditional, condition, resource, resource)
}

const identity = (v: any) => v

interface SimplePropertyConfig {
    element: 'input' | 'textarea'
    inputType?: string
    codec?: keyof typeof propertyCodecs // List join/split codec; omitted for identity write-back.
    clone?: boolean       // Only OcdDisplayNameProperty re-clones the document on blur.
    withOptions?: boolean // Only OcdTextProperty renders a per-field suggestion datalist.
}

/**
 * Factory for the simple <input>/<textarea> backed property fields. The shared
 * controlled-input + onBlur-commit behaviour lives in usePropertyField; this
 * factory only supplies the per-type element, value codec and write-back flags.
 *
 * The codec is resolved inside the component (render time) rather than at module
 * init, because usePropertyField -> OcdConsole -> property panels forms an import
 * cycle that leaves `propertyCodecs` undefined during this module's evaluation.
 */
const createSimpleProperty = (cfg: SimplePropertyConfig) => {
    const clone = cfg.clone ?? false
    return (props: ResourceProperty): JSX.Element => {
        const { config, attribute } = props
        const codec = cfg.codec ? propertyCodecs[cfg.codec] : undefined
        const toStored = codec ? codec.toStored : identity
        const { id, value, setValue, properties, className, commit } = usePropertyField(props, { toDisplay: codec?.toDisplay })
        const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value)
        const onBlur = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            e.target.reportValidity()
            commit(toStored(e.target.value), clone)
        }
        if (cfg.element === 'textarea') {
            return (
                <div className={className}>
                    <div><label htmlFor={id}>{attribute.label}</label></div>
                    <div><textarea id={id} value={value} {...properties} onChange={onChange} onBlur={onBlur}></textarea></div>
                </div>
            )
        }
        // When a config supplies options (e.g. Cloud Agent plugin names, see Issue #563), render them as a
        // per-field suggestion datalist; otherwise fall back to the shared Terraform variables datalist.
        const options = cfg.withOptions && config && config.options ? config.options : []
        const listId = options.length > 0 ? `${id}-options` : 'variables'
        return (
            <div className={className}>
                <div><label htmlFor={id}>{attribute.label}</label></div>
                <div>
                    <input type={cfg.inputType ?? 'text'} id={id} value={value} {...properties} list={listId} onChange={onChange} onBlur={onBlur}></input>
                    {options.length > 0 && <datalist id={listId}>{options.map((o) => <option value={o.id} key={o.id}>{o.displayName}</option>)}</datalist>}
                </div>
            </div>
        )
    }
}

export const OcdDisplayNameProperty = createSimpleProperty({ element: 'input', inputType: 'text', clone: true })
export const OcdTextProperty = createSimpleProperty({ element: 'input', inputType: 'text', withOptions: true })
export const OcdNumberProperty = createSimpleProperty({ element: 'input', inputType: 'number' })
export const OcdCodeProperty = createSimpleProperty({ element: 'textarea' })
export const OcdStringListProperty = createSimpleProperty({ element: 'input', inputType: 'text', codec: 'stringList' })
export const OcdNumberListProperty = createSimpleProperty({ element: 'input', inputType: 'text', codec: 'numberList' })

export const OcdBooleanProperty = (props: ResourceProperty): JSX.Element => {
    const { attribute } = props
    const { id, value, setValue, properties, className, commit } = usePropertyField(props)
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.checked)
        commit(e.target.checked)
    }
    return (
        <div className={className}>
            <div></div>
            <div><input type='checkbox' id={id} checked={value} {...properties} onChange={onChange}></input><label htmlFor={id}>{attribute.label}</label></div>
        </div>
    )
}

export const OcdLookupOption = ({id, displayName}: {id: string, displayName: string}): JSX.Element => {
    return <option value={id} key={id}>{displayName}</option>
}

export const OcdLookupGroupOption = ({group}: {group: ResourceElementConfigLookupGroup}): JSX.Element => {
    return (
        <optgroup label={group.displayName}>
            {group.resources && group.resources.map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />)}
        </optgroup>
    )
}

export const OcdLookupProperty = (props: ResourceProperty): JSX.Element => {
    const { ocdDocument, resource, config, attribute, rootResource } = props
    const { id, value, setValue, properties, className, commit } = usePropertyField(props)
    const lookupGroups = config && config.lookupGroups ? config.lookupGroups : []
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    lookupGroups.forEach((g) => {
        g.resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(g.lookupResource ? g.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    })
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value)
        // TODO: Replace with a performant Solution
        commit(e.target.value, true)
    }
    // Issue #369: when a config opts in via `properties.editable`, render an editable combobox (text input
    // backed by a datalist of the same grouped lookup options) so the user can either pick a known resource
    // or type a free-text OCID (e.g. a private-IP route target OCD does not model as a selectable resource).
    // The default rendering remains a strict <select> for every other lookup field.
    const {editable, ...inputProperties} = properties
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        commit(e.target.value, true)
    }
    if (editable) {
        const datalistId = `${id}-options`
        return (
            <div className={className}>
                <div><label htmlFor={id}>{attribute.label}</label></div>
                <div>
                    <input type='text' id={id} value={value} {...inputProperties} list={datalistId} onChange={onInputChange}></input>
                    <datalist id={datalistId}>
                        {lookupGroups.length === 0 ? resources.map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />)
                                                   : lookupGroups.flatMap((g: ResourceElementConfigLookupGroup) => (g.resources ?? []).map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />))}
                    </datalist>
                </div>
            </div>
        )
    }
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div>
                <select id={id} value={value} {...properties} onChange={onChange}>
                    <option value='' key={`${attribute.lookupResource}-empty-option`}></option>
                    {lookupGroups.length === 0 ? resources.map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />)
                                               : lookupGroups.map((g: ResourceElementConfigLookupGroup) => <OcdLookupGroupOption group={g} key={g.displayName}/>)}
                </select>
            </div>
        </div>
    )
}

export const OcdLookupListProperty = (props: ResourceProperty): JSX.Element => {
    const { ocdDocument, resource, config, attribute, rootResource } = props
    const { properties, className, cloneDocument, markModified } = usePropertyField(props)
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const id = e.target.id
        const checked = e.target.checked
        if (checked) resource[attribute.key].push(id)
        else resource[attribute.key] = resource[attribute.key].filter((s: string) => s !== id)
        // TODO: Replace with a performant Solution
        cloneDocument()
        markModified()
    }
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div>
                <div className='ocd-set-lookup'>
                    {resources.map((r: OcdResource) => {
                            return <div key={r.id}><input type='checkbox' id={r.id} key={r.id} {...properties} onChange={onChange} checked={resource[attribute.key].includes(r.id)}></input><label htmlFor={r.id}>{r.displayName}</label></div>
                        })}
                </div>
            </div>
        </div>
    )
}

export const OcdStaticLookupProperty = (props: ResourceProperty): JSX.Element => {
    const { resource, config, attribute } = props
    const { id, value, setValue, properties, className, commit, markModified } = usePropertyField(props)
    const configOptions = config?.options ? config.options : []
    const resources = useMemo(() => config?.options ? config.options : [], configOptions)
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value)
        // TODO: Replace with a performant Solution
        commit(e.target.value, true)
    }
    useEffect(() => {
        if (!resource[attribute.key] || resource[attribute.key] === '') {
            if (resources.length > 0) {
                resource[attribute.key] = resources[0].id
                markModified()
            }
        }
    }, [])
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div>
                <select id={id} value={value} {...properties} onChange={onChange}>
                    {resources.map((r: ResourceElementConfigOption) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />)}
                </select>
            </div>
        </div>
    )
}

export const OcdCacheLookupProperty = (props: ResourceProperty): JSX.Element => {
    const { resource, config, attribute, rootResource } = props
    const { value, setValue, properties, className, commit } = usePropertyField(props)
    const ocdCache = useCache()
    const lookupGroups = config?.lookupGroups ? config.lookupGroups : []
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config?.resourceFilter ? (r: any) => config.resourceFilter && config.resourceFilter(r, resource, rootResource) : config?.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdCache.getOciReferenceDataList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    lookupGroups.forEach((g) => {
        if (Object.hasOwn(g, 'lookupResource')) {
            g.resources = attribute.provider === 'oci' ? ocdCache.getOciReferenceDataList(g.lookupResource ? g.lookupResource : '').filter(customFilter).filter(baseFilter) : []
        } else if (Object.hasOwn(g, 'simpleFilter')) {
            g.resources = attribute.provider === 'oci' ? ocdCache.getOciReferenceDataList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter).filter(g.simpleFilter) : []
        }
    })
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value)
        // TODO: Replace with a performant Solution
        commit(e.target.value, true)
    }
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div>
                <select value={value} {...properties} onChange={onChange}>
                    <option value='' key={`${attribute.lookupResource}-empty-option`}></option>
                    {lookupGroups.length === 0 ? resources.map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />) : lookupGroups.map((g: ResourceElementConfigLookupGroup) => {return <OcdLookupGroupOption group={g} key={g.displayName}/>})}
                </select>
            </div>
        </div>
    )
}

export const OcdSetLookupProperty = (props: ResourceProperty): JSX.Element => {
    const { ocdDocument, resource, config, attribute, rootResource } = props
    const { properties, className, markModified } = usePropertyField(props)
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const securityListId = e.target.id
        const checked = e.target.checked
        if (checked) resource[attribute.key].push(securityListId)
        else resource[attribute.key] = resource[attribute.key].filter((s: string) => s !== securityListId)
        markModified()
    }
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div>
                <div className='ocd-set-lookup'>
                    {resources.map((r: OcdResource) => {
                            return <div key={r.id}><input type='checkbox' id={r.id} key={r.id} {...properties} onChange={onChange} checked={resource[attribute.key].includes(r.id)}></input><label htmlFor={r.id}>{r.displayName}</label></div>
                        })}
                </div>
            </div>
        </div>
    )
}

/** Placeholder fields that only render a static label (List / Set / Map). */
const createPlaceholderProperty = (text: string) => {
    return (props: ResourceProperty): JSX.Element => {
        const { attribute } = props
        const { className } = usePropertyField(props)
        return (
            <div className={className}>
                <div><span>{attribute.label}</span></div>
                <div><span>{text}</span></div>
            </div>
        )
    }
}

export const OcdListProperty = createPlaceholderProperty('List Property')
export const OcdSetProperty = createPlaceholderProperty('Set Property')
export const OcdMapProperty = createPlaceholderProperty('Map Property')
