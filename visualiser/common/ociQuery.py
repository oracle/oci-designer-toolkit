#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


from common.okitCommon import logJson
from common.okitCommon import standardiseIds
from common.okitLogging import getLogger
from facades.ociCompartment import OCICompartments

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
    response_json['compartments'] = [compartment_json]
    logger.info('Compartment: {0!s:s}'.format(oci_compartment.data['name']))
    # Query all Virtual Cloud Networks
    oci_virtual_cloud_networks = oci_compartment.getVirtualCloudNetworkClients()
    response_json["virtual_cloud_networks"] = oci_virtual_cloud_networks.list(filter=filter)
    # Loop through resulting json
    for oci_virtual_cloud_network in oci_virtual_cloud_networks.virtual_cloud_networks_obj:
        logger.info('\tVirtual Cloud Network : {0!s:s}'.format(oci_virtual_cloud_network.data['display_name']))
        # Internet Gateways
        oci_internet_gateways = oci_virtual_cloud_network.getInternetGatewayClients()
        response_json['internet_gateways'] = oci_internet_gateways.list()
        for oci_internet_gateway in oci_internet_gateways.internet_gateways_obj:
            logger.info('\t\tInternet Gateway : {0!s:s}'.format(oci_internet_gateway.data['display_name']))
        # Route Tables
        oci_route_tables = oci_virtual_cloud_network.getRouteTableClients()
        response_json['route_tables'] = oci_route_tables.list()
        for oci_route_table in oci_route_tables.route_tables_obj:
            logger.info('\t\tRoute Table : {0!s:s}'.format(oci_route_table.data['display_name']))
        # Security Lists
        security_lists = oci_virtual_cloud_network.getSecurityListClients()
        response_json['security_lists'] = security_lists.list()
        for security_list in security_lists.security_lists_obj:
            logger.info('\t\tSecurity List : {0!s:s}'.format(security_list.data['display_name']))
        # Subnets
        subnets = oci_virtual_cloud_network.getSubnetClients()
        response_json['subnets'] = subnets.list()
        for subnet in subnets.subnets_obj:
            logger.info('\t\tSubnet : {0!s:s}'.format(subnet.data['display_name']))
    # Query all Instances
    oci_instances = oci_compartment.getInstanceClients()
    response_json['instances'] = oci_instances.list(filter=filter)
    oci_instance_vnics = oci_compartment.getInstanceVnicClients()
    for instance in response_json['instances']:
        instance['vnics'] = oci_instance_vnics.list(instance_id=instance['id'])
        instance['subnet_id'] = instance['vnics'][0]['subnet_id']
    # Query all Load Balancers
    oci_load_balancers = oci_compartment.getLoadBalancerClients()
    response_json['load_balancers'] = oci_load_balancers.list(filter=filter)

    logger.debug('Response     : {0:s}'.format(str(response_json)))
    logJson(response_json)
    response_json = standardiseJson(response_json)
    logJson(response_json)
    return response_json


def queryCompartment():
    return

