/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from '../../../../OcdDocument'
import { ResourceElementConfig, ResourceProperties } from '../../../OcdPropertyTypes'
import * as AutoGenerated from './generated/OciDatascienceNotebookSession'
import { OciDatascienceNotebookSessionConfigs } from './configs/OciDatascienceNotebookSession'

export const OciDatascienceNotebookSession = ({ ocdDocument, setOcdDocument, resource }: ResourceProperties): JSX.Element => {
    const configs: ResourceElementConfig[] = OciDatascienceNotebookSessionConfigs.configs()
    return (
        <AutoGenerated.OciDatascienceNotebookSession ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} configs={configs} key={`${resource.id}.AutoGenerated.OciDatascienceNotebookSession`} />
    )
}
