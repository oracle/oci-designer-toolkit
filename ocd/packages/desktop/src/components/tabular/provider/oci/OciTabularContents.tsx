/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciResource } from "@ocd/model"
import { OciTabularContentsProps, OciTabularResourceProps } from "../../../../types/ReactComponentProperties"
import { useState } from "react"

export const OciDefault = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    return (
        <div id='ocd_resource_grid' className='table ocd-tabular-content'>
            <div className='thead ocd-tabular-list-header'><div className='tr'><div className='th'>{ociResources[selected].length}</div><div className='th'>Name</div><div className='th'>Compartment</div></div></div>
            <div className='tbody ocd-tabular-list-body'>
                {ociResources[selected].map((r: OciResource, i: number) => {
                    return <div className='tr' key={`tabular-${r.id}`}><div className='td'>{i + 1}</div><div className='td'>{r.displayName}</div><div className='td'>{ocdDocument.getResource(r.compartmentId) ? ocdDocument.getResource(r.compartmentId).displayName : ''}</div></div>
                })}
            </div>
        </div>
    )
}

export const OcdTabularContents = ({ ocdDocument, ociResources, selected, columnTitles, resourceElements }: OciTabularContentsProps): JSX.Element => {
    const [sortColumn, setSortColumn] = useState('')
    const [sortAscending, setSortAscending] = useState(true)
    const onSortClick = (element: string) => {
        const sortFn = (a: Record<string, any>, b: Record<string, any>) => {console.debug('Sort Column:', sortColumn, a, b); return a[sortColumn].localeCompare(b[sortColumn])}
        console.debug('>>>>> OcdTabularContents: Sort Click', element, sortFn)
        setSortColumn(element)
        setSortAscending(!sortAscending)
    }
    const sortFunction = (a: Record<string, any>, b: Record<string, any>): number => {
        let result = 0
        if (!sortColumn || sortColumn === '') result = 0
        else if (Array.isArray(a[sortColumn])) result = a[sortColumn].join(',').localeCompare(b[sortColumn].join(','))
        else if (isElementId(sortColumn)) result = getReferenceDisplayName(a[sortColumn]).localeCompare(getReferenceDisplayName(b[sortColumn]))
        else if (isElementIdList(sortColumn)) result = getReferenceListDisplayNames(a[sortColumn]).localeCompare(getReferenceDisplayName(b[sortColumn]))
        else result = String(a[sortColumn]).localeCompare(String(b[sortColumn]))
        // Check Ascending or Descending
        result = sortAscending ? result : result * -1
        return result
    }
    const getReferenceDisplayName = (id: string) => {
        const resource = ocdDocument.getResource(id)
        return resource ? resource.displayName : 'Unknown'
    }
    const getReferenceListDisplayNames = (ids: string[]) => {
        return ids ? ids.map((id) => getReferenceDisplayName(id)).join(', ') : ''
    }
    const isElementId = (name: string) => name ? name.endsWith('Id') : false
    const isElementIdList = (name: string) => name ? name.endsWith('Ids') : false
    return (
        <div id='ocd_resource_grid' className='table ocd-tabular-content'>
            <div className='thead ocd-tabular-list-header'>
                <div className='tr' key={`tabular-header-row`}>
                    <div className='th'>{ociResources[selected].length}</div>
                    <div className='th' onClick={() => onSortClick('displayName')}>Name</div>
                    <div className='th' onClick={() => onSortClick('compartmentId')}>Compartment</div>
                    {columnTitles.map((title: string, i: number) => {return <div className='th' onClick={() => onSortClick(resourceElements[i])}>{title}</div>})}
                </div>
            </div>
            <div className='tbody ocd-tabular-list-body'>
                {ociResources[selected].sort(sortFunction).map((r: OciResource, i: number) => {
                    return <div className='tr' key={`tabular-${r.id}`}>
                                <div className='td'>{i + 1}</div><div className='td'>{r.displayName}</div>
                                <div className='td'>{getReferenceDisplayName(r.compartmentId)}</div>
                                {/* <div className='td'>{ocdDocument.getResource(r.compartmentId) ? ocdDocument.getResource(r.compartmentId).displayName : ''}</div> */}
                                {resourceElements.map((element) => {return <div className='td'>{isElementId(element) ? getReferenceDisplayName(r[element]) : isElementIdList(element) ? getReferenceListDisplayNames(r[element]) : String(r[element])}</div>})}
                            </div>
                })}
            </div>
        </div>
    )
}
