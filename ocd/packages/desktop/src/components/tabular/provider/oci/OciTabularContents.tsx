/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OciResource } from "@ocd/model"
import { OciTabularResourceProps } from "../../../../types/ReactComponentProperties"

export const OciDefault = ({ ocdDocument, ociResources, selected }: OciTabularResourceProps): JSX.Element => {
    return (
        <div id='ocd_resource_grid' className='table ocd-tabular-content'>
            <div className='thead ocd-tabular-list-header'><div className='tr'><div className='th'>{ociResources[selected].length}</div><div className='th'>Name</div><div className='th'>Compartment</div></div></div>
            <div className='tbody ocd-tabular-list-body'>
                {ociResources[selected].map((r: OciResource, i: number) => {
                    return <div className='tr'><div className='td'>{i + 1}</div><div className='td'>{r.displayName}</div><div className='td'>{ocdDocument.getResource(r.compartmentId) ? ocdDocument.getResource(r.compartmentId).displayName : ''}</div></div>
                })}
            </div>
    </div>
)
}