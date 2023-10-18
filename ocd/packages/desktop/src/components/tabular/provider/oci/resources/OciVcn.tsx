/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciResource } from "@ocd/model"
import { OciTabularResourceProps } from "../../../../../types/ReactComponentProperties"
import { useState } from "react"
import { OcdTabularContents } from "../OciTabularContents"

export const OciVcn = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    const columnTitles = ['CIDR Blocks', 'DNS Label']
    const resourceElements = ['cidrBlocks', 'dnsLabel']
    return (
        <OcdTabularContents 
            ocdDocument={ocdDocument}
            ociResources={ociResources}
            selected={selected}
            columnTitles={columnTitles}
            resourceElements={resourceElements}
        />
    )
}

export const OciVcn1 = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    const [sortColumn, setSortColumn] = useState('')
    const [sortAscending, setSortAscending] = useState(true)
    const onSortClick = (element: string) => {
        const sortFn = (a: Record<string, any>, b: Record<string, any>) => {console.debug('Sort Column:', sortColumn, a, b); return a[sortColumn].localeCompare(b[sortColumn])}
        console.debug('>>>>> OciVcn: Sort Click', element, sortFn)
        setSortColumn(element)
        setSortAscending(!sortAscending)
    }
    const sortFunction = (a: Record<string, any>, b: Record<string, any>): number => {
        if (!sortColumn || sortColumn === '') return 0
        else if (!sortAscending) return a[sortColumn].localeCompare(b[sortColumn]) * -1
        return a[sortColumn].localeCompare(b[sortColumn])
    }
    return (
        <div id='ocd_resource_grid' className='table ocd-tabular-content'>
            <div className='thead ocd-tabular-list-header'><div className='tr'><div className='th'>{ociResources[selected].length}</div><div className='th' onClick={() => onSortClick('displayName')}>Name</div><div className='th'>Compartment</div><div className='th'>CIDR Blocks</div><div className='th' onClick={() => onSortClick('dnsLabel')}>DNS Label</div></div></div>
            <div className='tbody ocd-tabular-list-body'>
                {ociResources[selected].sort(sortFunction).map((r: OciResource, i: number) => {
                    return <div className='tr' key={`tabular-${r.id}`}><div className='td'>{i + 1}</div><div className='td'>{r.displayName}</div><div className='td'>{ocdDocument.getResource(r.compartmentId) ? ocdDocument.getResource(r.compartmentId).displayName : ''}</div><div className='td'>{r.cidrBlocks.join(',')}</div><div className='td'>{r.dnsLabel}</div></div>
                })}
            </div>
        </div>
    )
}
