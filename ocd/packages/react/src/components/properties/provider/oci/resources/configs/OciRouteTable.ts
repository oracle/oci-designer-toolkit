/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { ResourceElementConfig } from "../../../../OcdPropertyTypes"
import { OciCommonConfigs } from "../../OciCommonConfigs"

export namespace OciRouteTableConfigs {
    export function configs(): ResourceElementConfig[] {
        return [
            ...OciCommonConfigs.configs(),
            {
                id: 'route_rules.destination',
                properties: {
                    placeholder: '0.0.0.0/0',
                    pattern: "^((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))$)+|^var\.+$",
                    title: 'IPv4 CIDR block'
                },
                configs: []
            },
            {
                id: 'route_rules.destination_type',
                properties: {},
                configs: [],
                options: [
                    {id: 'CIDR_BLOCK', displayName: 'CIDR Block'},
                    {id: 'SERVICE_CIDR_BLOCK', displayName: 'Service CIDR Block'}
                ]
            },
            {
                id: 'route_rules.network_entity_id',
                // Issue #369: OCD does not model a Private IP as a standalone, selectable resource, so a
                // private-IP route target (e.g. a VNIC private IP used as a network virtual appliance hop)
                // cannot be picked from the gateway lists. Render this lookup as an editable combobox so the
                // user can still pick a known gateway OR paste a private-IP OCID as free text.
                properties: {editable: true},
                configs: [],
                lookupGroups: [
                    {displayName: 'Internet Gateways', lookupResource: 'internet_gateway'},
                    {displayName: 'NAT Gateways', lookupResource: 'nat_gateway'},
                    {displayName: 'Dynamic Routing Gateways', lookupResource: 'drg_attachment'},
                    {displayName: 'Service Gateways', lookupResource: 'service_gateway'},
                    {displayName: 'Local Peering Gateways', lookupResource: 'local_peering_gateway'}
                ],
                // Issue #452: gateways in the SAME VCN but a different compartment must still appear. The
                // previous strict equality (`r.vcnId === rootResource.vcnId`) wrongly excluded valid targets
                // whenever either side's vcnId is empty/undefined — e.g. DRG attachments (which carry no
                // vcnId in the model) or any gateway/route table imported without a resolved vcnId. Treat a
                // missing vcnId on either side as "do not exclude", while still excluding gateways whose
                // vcnId is set and differs from the route table's set vcnId (so other VCNs are not listed).
                // r: Gateway / rootResource: route_table
                resourceFilter: (r, resource, rootResource) => !r.vcnId || !rootResource.vcnId || r.vcnId === rootResource.vcnId
            },
        ]
    }
}
