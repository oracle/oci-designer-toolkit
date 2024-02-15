/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import OcdDocument from '../../../../OcdDocument'
import { ResourceElementConfig, ResourceProperties } from '../../../OcdPropertyTypes'
import * as AutoGenerated from './generated/OciLoadBalancerBackend'
import { OciLoadBalancerBackendConfigs } from './configs/OciLoadBalancerBackend'

export const OciLoadBalancerBackend = ({ ocdDocument, setOcdDocument, resource }: ResourceProperties): JSX.Element => {
    const configs: ResourceElementConfig[] = OciLoadBalancerBackendConfigs.configs()
    const proxyHandler = {}
    // Proxy Resource to handle inter-element relationships
    const proxyResource = new Proxy(resource, proxyHandler)
    return (
        <AutoGenerated.OciLoadBalancerBackend ocdDocument={ocdDocument} setOcdDocument={(ocdDocument:OcdDocument) => setOcdDocument(ocdDocument)} resource={proxyResource} configs={configs} />
    )
}