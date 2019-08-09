#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


from common.ociCommon import logJson
from common.ociCommon import standardiseIds
from facades.ociCompartment import OCICompartments
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


def standardiseJson(json_data={}, **kwargs):
    logJson(json_data)
    json_data = standardiseIds(json_data)
    logJson(json_data)
    return json_data


def executeQuery(request_json={}, ** kwargs):
    response_json = {}
    logger.info('Request JSON : {0:s}'.format(str(request_json)))
    compartment_id = request_json['compartment_id']
    filter = request_json.get('virtual_cloud_network_filter', None)
    if filter == '':
        filter = None
    oci_compartments = OCICompartments()
    compartment_json = oci_compartments.get(compartment_id=compartment_id)
    oci_compartment = oci_compartments.compartments_obj[0]
    # Build OKIT Response json add compartment information
    response_json['compartment'] = {}
    response_json['compartment']['id'] = compartment_json['id']
    response_json['compartment']['name'] = compartment_json['name']
    logger.info('Compartment: {0!s:s}'.format(oci_compartment.data['name']))
    # Query all Virtual Cloud Networks
    oci_virtual_cloud_networks = oci_compartment.getVirtualCloudNetworkClients()
    response_json['compartment']["virtual_cloud_networks"] = oci_virtual_cloud_networks.list(filter=filter)
    # Loop through resulting json
    for oci_virtual_cloud_network in oci_virtual_cloud_networks.virtual_cloud_networks_obj:
        logger.info('\tVirtual Cloud Network : {0!s:s}'.format(oci_virtual_cloud_network.data['display_name']))
        # Internet Gateways
        oci_internet_gateways = oci_virtual_cloud_network.getInternetGatewayClients()
        response_json['compartment']['internet_gateways'] = oci_internet_gateways.list()
        for oci_internet_gateway in oci_internet_gateways.internet_gateways_obj:
            logger.info('\t\tInternet Gateway : {0!s:s}'.format(oci_internet_gateway.data['display_name']))
        # Route Tables
        oci_route_tables = oci_virtual_cloud_network.getRouteTableClients()
        response_json['compartment']['route_tables'] = oci_route_tables.list()
        for oci_route_table in oci_route_tables.route_tables_obj:
            logger.info('\t\tRoute Table : {0!s:s}'.format(oci_route_table.data['display_name']))
        # Security Lists
        security_lists = oci_virtual_cloud_network.getSecurityListClients()
        response_json['compartment']['security_lists'] = security_lists.list()
        for security_list in security_lists.security_lists_obj:
            logger.info('\t\tSecurity List : {0!s:s}'.format(security_list.data['display_name']))
        # Subnets
        subnets = oci_virtual_cloud_network.getSubnetClients()
        response_json['compartment']['subnets'] = subnets.list()
        for subnet in subnets.subnets_obj:
            logger.info('\t\tSubnet : {0!s:s}'.format(subnet.data['display_name']))
    logger.info('Response     : {0:s}'.format(str(response_json)))
    logJson(response_json)
    response_json = standardiseJson(response_json)
    logJson(response_json)
    return response_json



