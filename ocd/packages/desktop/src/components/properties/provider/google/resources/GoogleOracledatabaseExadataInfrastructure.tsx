/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from '../../../../OcdDocument'
import { ResourceElementConfig, ResourceProperties } from '../../../OcdPropertyTypes'
import * as AutoGenerated from './generated/GoogleOracledatabaseExadataInfrastructure'
import { GoogleOracledatabaseExadataInfrastructureConfigs } from './configs/GoogleOracledatabaseExadataInfrastructure'

export const GoogleOracledatabaseExadataInfrastructure = ({ ocdDocument, setOcdDocument, resource }: ResourceProperties): JSX.Element => {
    const configs: ResourceElementConfig[] = GoogleOracledatabaseExadataInfrastructureConfigs.configs()
    return (
        <AutoGenerated.GoogleOracledatabaseExadataInfrastructure ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={resource} configs={configs} key={`${resource.id}.AutoGenerated.GoogleOracledatabaseExadataInfrastructure`} />
    )
}
