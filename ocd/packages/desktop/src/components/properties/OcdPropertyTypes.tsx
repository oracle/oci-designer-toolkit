/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResource } from '@ocd/model'
import { OcdUtils } from '@ocd/core'
import { OcdDocument } from '../OcdDocument'
import { useContext, useEffect, useId, useMemo, useState } from 'react'
import { ActiveFileContext, CacheContext } from '../../pages/OcdConsole'
import { v4 as uuidv4 } from 'uuid'

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
    properties: ResourceElementProperties
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

export namespace OcdResourceProperties {
    export function reactAttributeElement(resource: OcdResource, name: string, attribute: ResourcePropertyAttributes) {
        // console.info('Name:', name)
        // console.info('>> Resource:', resource)
        // console.info('>> Attribute:', attribute)
        const configFind = `configs.find((c) => c.id === '${attribute.id}')`
        if (attribute.type === 'string')                                      return `<OcdTextProperty       ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'bool')                                   return `<OcdBooleanProperty    ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'number')                                 return `<OcdNumberProperty     ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'object')                                 return `<OcdObjectProperty     ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'list' && attribute.subtype === 'object') return `<OcdObjectListProperty ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'list')                                   return `<OcdListProperty       ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'set')                                    return `<OcdSetProperty        ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
        else if (attribute.type === 'map')                                    return `<OcdMapProperty        ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} config={${configFind}} attribute={${JSON.stringify(attribute)}} />`
    }
}

export const isPropertyDisplayConditionTrue = (conditional: boolean, condition: ResourcePropertyCondition | ResourcePropertyCondition[], resource: OcdResource, rootResource: OcdResource): boolean => {
    return OcdUtils.isPropertyConditionTrue(conditional, condition, resource, resource)
}

export const OcdDisplayNameProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue] = useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdDisplayNameProperty: ${attribute.id} onChange(${e.target.value})`)
        setValue(e.target.value)
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdDisplayNameProperty: ${attribute.id} onBlur(${e.target.value})`)
        e.target.reportValidity()
        resource[attribute.key] = e.target.value
        setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdDisplayNameProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div><input type='text' id={id} value={value} {...properties} list='variables' onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdTextProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdTextProperty: ${attribute.id} onChange(${e.target.value})`)
        setValue(e.target.value)
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdTextProperty: ${attribute.id} onBlur(${e.target.value})`)
        e.target.reportValidity()
        resource[attribute.key] = e.target.value
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdTextProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div><input type='text' id={id} value={value} {...properties} list='variables' onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdNumberProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdNumberProperty: ${attribute.id} onChange(${e.target.value})`)
        setValue(e.target.value)
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdNumberProperty: ${attribute.id} onBlur(${e.target.value})`)
        e.target.reportValidity()
        resource[attribute.key] = e.target.value
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdNumberProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div><input type='number' id={id} value={value} {...properties} list='variables' onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdBooleanProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdBooleanProperty: ${attribute.id} onChange(${e.target.checked})`)
        setValue(e.target.checked)
        resource[attribute.key] = e.target.checked
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdBooleanProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div></div>
            <div><input type='checkbox' id={id} checked={value} {...properties} onChange={onChange}></input><label htmlFor={id}>{attribute.label}</label></div>
        </div>
    )
}

export const OcdCodeProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        console.debug(`OcdPropertyTypes: OcdCodeProperty: ${attribute.id} onChange(${e.target.value})`)
        setValue(e.target.value)
    }
    const onBlur = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        console.debug(`OcdPropertyTypes: OcdCodeProperty: ${attribute.id} onBlur(${e.target.value})`)
        e.target.reportValidity()
        resource[attribute.key] = e.target.value
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdCodeProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div><textarea id={id} value={value} {...properties} onChange={onChange} onBlur={onBlur}></textarea></div>
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
            {/* {group.resources && group.resources.map((r: OcdResource) => {
                return <option value={r.id} key={r.id}>{r.displayName}</option>
            })} */}
        </optgroup>
    )
}

export const OcdLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    console.debug('OcdPropertyTypes: OcdLookupProperty', config, attribute, resource)
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const lookupGroups = config && config.lookupGroups ? config.lookupGroups : []
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    lookupGroups.forEach((g) => {
        const resourceType = OcdUtils.toResourceType(g.lookupResource) 
        g.resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(g.lookupResource ? g.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    })
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug(`OcdPropertyTypes: OcdLookupProperty: ${attribute.id} onChange(${e.target.value})`)
        resource[attribute.key] = e.target.value
        setValue(e.target.value)
        // TODO: Replace with a performant Solution
        setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdLookupProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div>
                {/* <select id={id} value={resource[attribute.key]} {...properties} onChange={onChange}> */}
                <select id={id} value={value} {...properties} onChange={onChange}>
                    {/* {!attribute.required && <option defaultValue='' key={`${attribute.lookupResource}-empty-option`}></option> } */}
                    <option value='' key={`${attribute.lookupResource}-empty-option`}></option>
                    {/* {lookupGroups.length === 0 ? resources.map((r: OcdResource) => {
                        return <option value={r.id} key={r.id}>{r.displayName}</option> */}
                    {lookupGroups.length === 0 ? resources.map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />) 
                                               : lookupGroups.map((g: ResourceElementConfigLookupGroup) => <OcdLookupGroupOption group={g} key={g.displayName}/>)}
                </select>
            </div>
        </div>
    )
}

export const OcdLookupListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter  && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdLookupListProperty: ${attribute.id} onChange(${e.target.value})`)
        const id = e.target.id
        const checked = e.target.checked
        if (checked) resource[attribute.key].push(id)
        else resource[attribute.key] = resource[attribute.key].filter((s: string) => s !== id)
        // TODO: Replace with a performant Solution
        setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdLookupListProperty: ${attribute.id} Render(${value})`)
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

export const OcdStaticLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue] = useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const resources = useMemo(() => config && config.options ? config.options : [], config?.options)
    // const resources = config && config.options ? config.options : []
    // console.info('Resources', resources)
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug(`OcdPropertyTypes: OcdStaticLookupProperty: ${attribute.id} onChange(${e.target.value})`)
        resource[attribute.key] = e.target.value
        setValue(e.target.value)
        // TODO: Replace with a performant Solution
        setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    useEffect(() => {
        if (!resource[attribute.key] || resource[attribute.key] === '') {
            if (resources.length > 0) {
                resource[attribute.key] = resources[0].id
                // TODO: Replace with a performant Solution
                // setOcdDocument(OcdDocument.clone(ocdDocument))
                if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
            }
        }
    }, [])
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdStaticLookupProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div>
                {/* <select id={id} value={resource[attribute.key]} {...properties} onChange={onChange}> */}
                <select id={id} value={value} {...properties} onChange={onChange}>
                    {resources.map((r: ResourceElementConfigOption) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />)}
                </select>
            </div>
        </div>
    )
}

export const OcdCacheLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    console.debug('OcdPropertyTypes: OcdCacheLookupProperty', config, attribute, resource)
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    // @ts-ignore
    const {ocdCache, setOcdCache} = useContext(CacheContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    // const id = `${rootResource.id.replace(/\W+/g, "")}_${attribute.id.replace(/\W+/g, "")}`
    const lookupGroups = config && config.lookupGroups ? config.lookupGroups : []
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdCache.getOciReferenceDataList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    // const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    lookupGroups.forEach((g) => {
        if (Object.hasOwn(g, 'lookupResource')) {
            const resourceType = OcdUtils.toResourceType(g.lookupResource) 
            g.resources = attribute.provider === 'oci' ? ocdCache.getOciReferenceDataList(g.lookupResource ? g.lookupResource : '').filter(customFilter).filter(baseFilter) : []
        } else if (Object.hasOwn(g, 'simpleFilter')) {
            g.resources = attribute.provider === 'oci' ? ocdCache.getOciReferenceDataList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter).filter(g.simpleFilter) : []
        }
    })
    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.debug(`OcdPropertyTypes: OcdCacheLookupProperty: ${attribute.id} onChange(${e.target.value})`)
        resource[attribute.key] = e.target.value
        setValue(e.target.value)
        // TODO: Replace with a performant Solution
        setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug('OcdPropertyTypes: OcdCacheLookupProperty', config, attribute, resource, resources)
    console.debug(`>>>> OcdPropertyTypes: OcdCacheLookupProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div>
                {/* <select id={id} value={resource[attribute.key]} {...properties} onChange={onChange}> */}
                {/* <select value={resource[attribute.key]} {...properties} onChange={onChange}> */}
                <select value={value} {...properties} onChange={onChange}>
                    {/* {!attribute.required && <option defaultValue='' key={`${attribute.lookupResource}-empty-option`}></option> } */}
                    <option value='' key={`${attribute.lookupResource}-empty-option`}></option>
                    {lookupGroups.length === 0 ? resources.map((r: OcdResource) => <OcdLookupOption id={r.id} displayName={r.displayName} key={r.id} />) : lookupGroups.map((g: ResourceElementConfigLookupGroup) => {return <OcdLookupGroupOption group={g} key={g.displayName}/>})}
                </select>
            </div>
        </div>
    )
}

export const OcdStringListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key] ? resource[attribute.key].join(',') : '')
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdStringListProperty: ${attribute.id} onChange(${e.target.value})`)
        setValue(e.target.value)
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdStringListProperty: ${attribute.id} onBlur(${e.target.value})`)
        e.target.reportValidity()
        resource[attribute.key] = e.target.value.split(',').filter((v) => v !== '')
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdStringListProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div><input type='text' id={id} value={value} {...properties} list='variables' onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdNumberListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    const id = useId()
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key].join(','))
    const properties = config && config.properties ? config.properties : {}
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdNumberListProperty: ${attribute.id} onChange(${e.target.value})`)
        setValue(e.target.value)
    }
    const onBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.debug(`OcdPropertyTypes: OcdNumberListProperty: ${attribute.id} onBlur(${e.target.value})`)
        e.target.reportValidity()
        resource[attribute.key] = e.target.value.split(',')
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdNumberListProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><label htmlFor={id}>{attribute.label}</label></div>
            <div><input type='text' id={id} value={value} {...properties} list='variables' onChange={onChange} onBlur={onBlur}></input></div>
        </div>
    )
}

export const OcdListProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    // const id = `${rootResource.id.replace(/\W+/g, "")}_${attribute.id.replace(/\W+/g, "")}`
    console.debug(`>>>> OcdPropertyTypes: OcdListProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div><span>List Property</span></div>
        </div>
    )
}

export const OcdSetProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    // const id = `${rootResource.id.replace(/\W+/g, "")}_${attribute.id.replace(/\W+/g, "")}`
    console.debug(`>>>> OcdPropertyTypes: OcdSetProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div><span>Set Property</span></div>
        </div>
    )
}

export const OcdSetLookupProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const properties = config && config.properties ? config.properties : {}
    const resourceType = OcdUtils.toResourceType(attribute.lookupResource)
    const baseFilter = (r: any) => r.resourceType !== resourceType || r.id !== resource.id
    const customFilter = config && config.resourceFilter ? (r: any) => config.resourceFilter  && config.resourceFilter(r, resource, rootResource) : config && config.simpleFilter ? config.simpleFilter : () => true
    const resources = attribute.provider === 'oci' ? ocdDocument.getOciResourceList(attribute.lookupResource ? attribute.lookupResource : '').filter(customFilter).filter(baseFilter) : []
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const securityListId = e.target.id
        const checked = e.target.checked
        if (checked) resource[attribute.key].push(securityListId)
        else resource[attribute.key] = resource[attribute.key].filter((s: string) => s !== securityListId)
        // setOcdDocument(OcdDocument.clone(ocdDocument))
        if(!activeFile.modified) setActiveFile({...activeFile, modified: true})
    }
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdSetLookupProperty: ${attribute.id} Render(${value})`)
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

export const OcdMapProperty = ({ ocdDocument, setOcdDocument, resource, config, attribute, rootResource }: ResourceProperty): JSX.Element => {
    // @ts-ignore
    const {activeFile, setActiveFile} = useContext(ActiveFileContext)
    const [value, setValue]= useState(resource[attribute.key])
    const className = isPropertyDisplayConditionTrue(attribute.conditional, attribute.condition, resource, rootResource) ? `ocd-property-row ocd-simple-property-row` : `collapsed hidden`
    console.debug(`>>>> OcdPropertyTypes: OcdMapProperty: ${attribute.id} Render(${value})`)
    return (
        <div className={className}>
            <div><span>{attribute.label}</span></div>
            <div><span>Map Property</span></div>
        </div>
    )
}
