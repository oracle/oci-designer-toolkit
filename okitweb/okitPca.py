
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "okitPca"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import oci
import os
import re
import shutil
import tempfile
import time
import urllib
from flask import Blueprint
from flask import make_response
from flask import request
from flask import jsonify

import json
from common.okitCommon import logJson
from common.okitCommon import jsonToFormattedString
from common.okitCommon import readJsonFile
from common.okitCommon import standardiseIds
from common.okitCommon import writeJsonFile
from common.okitCommon import getOkitHome
from common.okitLogging import getLogger
# from query.pcaQuery import PCAQuery
# from query.pcaRegionQuery import PCARegionQuery
from query.pcaDropdownQuery import PCADropdownQuery

# Configure logging
logger = getLogger()

bp = Blueprint('pca', __name__, url_prefix='/okit/pca', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = f'{getOkitHome()}/visualiser/templates'

#
# Define Error Handlers
#

@bp.errorhandler(oci.exceptions.ServiceError)
def handle_oci_service_error(error):
    status_code = 500
    success = False
    message = ''
    code = ''
    for x in error.args:
        logger.info(x)
        if 'opc-request-id' in x:
            code = x['code']
            message = x['message']
            status_code = x['status']
            break
    logger.info(message)
    response = {
        'success': success,
        'error': {
            'type': error.__class__.__name__,
            'code': code,
            'message': message
        }
    }
    logger.exception(error)
    logJson(response)
    return jsonify(response), status_code


#
# Define Endpoints
#

@bp.route('/compartment', methods=(['GET']))
def ociCompartment():
    # query_string = request.query_string
    # parsed_query_string = urllib.parse.unquote(query_string.decode())
    # query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
    # logJson(query_json)
    # config_profile = query_json.get('config_profile', 'DEFAULT')
    config_profile = request.args.get('config_profile')
    logger.debug('Using Profile : {0!s:s}'.format(config_profile))
    oci_tenancies = OCITenancies(profile=config_profile)
    tenancy = oci_tenancies.listCompartments()
    compartments = [{'display_name': c['display_name'], 'canonical_name': c['canonical_name'], 'id': c['id'], 'home_region_key': tenancy['home_region_key']} for c in tenancy['compartments']]
    compartments.append({'display_name': '/', 'canonical_name': '/', 'id': tenancy['id'], 'home_region_key': tenancy['home_region_key']})
    compartments.sort(key=lambda x: x['canonical_name'])
    logger.debug("Compartments: {0!s:s}".format(compartments))
    return json.dumps(compartments, sort_keys=False, indent=2, separators=(',', ': '))


@bp.route('/region', methods=(['GET']))
def ociRegion():
    query_string = request.query_string
    parsed_query_string = urllib.parse.unquote(query_string.decode())
    query_json = json.loads(parsed_query_string)
    logJson(query_json)
    config_profile = query_json.get('config_profile', 'DEFAULT')
    logger.info('Using Profile : {0!s:s}'.format(config_profile))
    oci_regions = OCIRegions(profile=config_profile)
    regions = oci_regions.list()
    logger.debug(">>>>>>>>> Regions: {0!s:s}".format(regions))
    return json.dumps(regions, sort_keys=False, indent=2, separators=(',', ': '))


@bp.route('/regions/<string:profile>', methods=(['GET']))
def ociRegions(profile):
    oci_region_query = OCIRegionQuery(profile=profile)
    regions = oci_region_query.executeQuery()
    response = jsonToFormattedString(regions)
    logger.debug(">>>>>>>>> Regions: {0!s:s}".format(response))
    return response


@bp.route('/query', methods=(['GET']))
def ociQuery():
    if request.method == 'GET':
        config_profile = request.args.get('config_profile', default='DEFAULT')
        compartments = request.args.get('compartment_id')
        regions = request.args.get('region')
        region = request.args.get('region')
        sub_compartments = request.args.get('sub_compartments', default=False).lower() == 'true'
        logger.info('Using Profile : {0!s:s}'.format(config_profile))
        config = {'region': region}
        query = OCIQuery(config=config, profile=config_profile)
        response = query.executeQuery(regions=[regions] if regions else None, compartments=[compartments] if compartments else None, include_sub_compartments=sub_compartments)
        logJson(response)
        return response
    else:
        return '404'


def response_to_json(data):
    json_str = re.sub("'([0-9a-zA-Z-\.]*)':", '"\g<1>":', str(data))
    json_str = re.sub("'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", '"\g<1>": "\g<2>"', json_str)
    return json.dumps(json.loads(json_str), indent=2)


@bp.route('/artefacts/<string:artifact>', methods=(['GET']))
def ociArtifacts(artifact):
    logger.debug('Artifact : {0:s}'.format(str(artifact)))
    query_string = request.query_string
    parsed_query_string = urllib.parse.unquote(query_string.decode())
    query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
    logger.debug('===================================== Query Json =====================================')
    logJson(query_json)
    logger.debug('======================================================================================')
    config_profile = query_json.get('config_profile', 'DEFAULT')
    logger.debug('Using Profile : {0!s:s}'.format(config_profile))
    response_json = {}
    config = {'region': query_json['region']}
    if artifact == 'Compartment':
        logger.info('---- Processing Compartment')
        oci_compartments = OCICompartments(config=config, profile=config_profile)
        response_json = oci_compartments.get(compartment_id=query_json['compartment_id'])
    elif artifact == 'AutonomousDatabase':
        logger.info('---- Processing Autonomous Databases')
        oci_autonomous_databases = OCIAutonomousDatabases(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_autonomous_databases.list(filter=query_json.get('autonomous_database_filter', None))
    elif artifact == 'BlockStorageVolume':
        logger.info('---- Processing Block Storage Volumes')
        oci_block_storage_volumes = OCIBlockStorageVolumes(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_block_storage_volumes.list(filter=query_json.get('block_storage_volume_filter', None))
    elif artifact == 'Compartments':
        logger.info('---- Processing Compartments')
        oci_compartments = OCICompartments(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_compartments.list(filter=query_json.get('compartment_filter', None))
    elif artifact == 'CustomerPremiseEquipment':
        logger.info('---- Processing Customer Premise Equipment')
        oci_cpes = OCICustomerPremiseEquipments(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_cpes.list(filter=query_json.get('cpe_filter', None))
    elif artifact == 'Database':
        logger.info('---- Processing Databases')
        oci_databases = OCIDatabases(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], db_home_id=query_json.get('db_home_id', None))
        response_json = oci_databases.list(filter=query_json.get('database_system_filter', None))
    elif artifact == 'DatabaseSystem':
        logger.info('---- Processing Database Systems')
        oci_database_systems = OCIDatabaseSystems(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_database_systems.list(filter=query_json.get('database_system_filter', None))
    elif artifact == 'DbHome':
        logger.info('---- Processing Db Home')
        oci_db_nodes = OCIDbHomes(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vm_cluster_id=query_json.get('vm_cluster_id', None))
        response_json = oci_db_nodes.list(filter=query_json.get('db_node_filter', None))
    elif artifact == 'DbNode':
        logger.info('---- Processing Db Node')
        oci_db_homes = OCIDbNodes(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vm_cluster_id=query_json.get('vm_cluster_id', None))
        response_json = oci_db_homes.list(filter=query_json.get('db_home_filter', None))
    elif artifact == 'DynamicRoutingGateway':
        logger.info('---- Processing Dynamic Routing Gateways')
        oci_dynamic_routing_gateways = OCIDynamicRoutingGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_dynamic_routing_gateways.list(filter=query_json.get('dynamic_routing_gateway_filter', None))
    elif artifact == 'ExadataInfrastructure':
        logger.info('---- Processing Exadata Infrastructures aka C@C')
        oci_exadata_infrastructures = OCIExadataInfrastructures(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_exadata_infrastructures.list(filter=query_json.get('exadata_infrastructure_filter', None))
    elif artifact == 'FastConnect':
        logger.info('---- Processing FastConnects')
        oci_fast_connects = OCIFastConnects(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_fast_connects.list(filter=query_json.get('fast_connect_filter', None))
    elif artifact == 'FileStorageSystem':
        logger.info('---- Processing File Storage Systems')
        oci_file_storage_systems = OCIFileStorageSystems(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_file_storage_systems.list(filter=query_json.get('file_storage_system_filter', None))
    elif artifact == 'Instance':
        logger.info('---- Processing Instances')
        oci_instances = OCIInstances(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_instances.list(filter=query_json.get('instance_filter', None))
    elif artifact == 'InstancePool':
        logger.info('---- Processing Instance Pools')
        oci_instance_pools = OCIInstancePools(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_instance_pools.list(filter=query_json.get('instance_filter', None))
    elif artifact == 'InternetGateway':
        logger.info('---- Processing Internet Gateways')
        oci_internet_gateways = OCIInternetGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_internet_gateways.list(filter=query_json.get('internet_gateway_filter', None))
    elif artifact == 'IPSecConnection':
        logger.info('---- Processing IPSec Connections')
        oci_ipsec_connections = OCIIPSecConnections(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_ipsec_connections.list(filter=query_json.get('ipsec_connection_filter', None))
    elif artifact == 'LoadBalancer':
        logger.info('---- Processing Load Balancers')
        oci_load_balancers = OCILoadBalancers(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_load_balancers.list(filter=query_json.get('load_balancer_filter', None))
        response_json = [lb for lb in response_json if query_json['subnet_id'] in lb['subnet_ids']]
    elif artifact == 'LocalPeeringGateway':
        logger.info('---- Processing LocalPeeringGateways')
        oci_local_peering_gateways = OCILocalPeeringGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_local_peering_gateways.list(filter=query_json.get('local_peering_gateway_filter', None))
    elif artifact == 'MySQLDatabaseSystem':
        logger.info('---- Processing MySQL Database Systems')
        oci_mysql_database_systems = OCIMySQLDatabaseSystems(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_mysql_database_systems.list(filter=query_json.get('mysql_database_system_filter', None))
    elif artifact == 'NATGateway':
        logger.info('---- Processing NAT Gateways')
        oci_nat_gateways = OCINATGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_nat_gateways.list(filter=query_json.get('nat_gateway_filter', None))
    elif artifact == 'NetworkSecurityGroup':
        logger.info('---- Processing Network Security Groups')
        oci_network_security_groups = OCINetworkSecurityGroups(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_network_security_groups.list(filter=query_json.get('network_security_group_filter', None))
    elif artifact == 'ObjectStorageBucket':
        logger.info('---- Processing Object Storage Buckets')
        oci_object_storage_buckets = OCIObjectStorageBuckets(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_object_storage_buckets.list(filter=query_json.get('object_storage_bucket_filter', None))
    elif artifact == 'OkeCluster':
        logger.info('---- Processing OKE Clusters')
        oke_clusters = OCIContainers(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oke_clusters.list(filter=query_json.get('oke_cluster_filter', None))
    elif artifact == 'RemotePeeringConnection':
        logger.info('---- Processing Remote Peering Connections')
        oci_remote_peering_connections = OCIRemotePeeringConnections(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_remote_peering_connections.list(filter=query_json.get('remote_peering_connection_filter', None))
    elif artifact == 'RouteTable':
        logger.info('---- Processing Route Tables')
        oci_route_tables = OCIRouteTables(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_route_tables.list(filter=query_json.get('route_table_filter', None))
    elif artifact == 'SecurityList':
        logger.info('---- Processing Security Lists')
        oci_security_lists = OCISecurityLists(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_security_lists.list(filter=query_json.get('security_list_filter', None))
    elif artifact == 'ServiceGateway':
        logger.info('---- Processing Service Gateways')
        oci_service_gateways = OCIServiceGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_service_gateways.list(filter=query_json.get('service_gateway_filter', None))
    elif artifact == 'Subnet':
        logger.info('---- Processing Subnets')
        oci_subnets = OCISubnets(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_subnets.list(filter=query_json.get('subnet_filter', None))
    elif artifact == 'VirtualCloudNetwork':
        logger.info('---- Processing Virtual Cloud Networks')
        oci_virtual_cloud_networks = OCIVirtualCloudNetworks(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_virtual_cloud_networks.list(filter=query_json.get('virtual_cloud_network_filter', None))
    elif artifact == 'VmCluster':
        logger.info('---- Processing VM Clusters')
        oci_vm_clusters = OCIVmClusters(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], exadata_infrastructure_id=query_json.get('exadata_infrastructure_id', None))
        # oci_vm_clusters = OCIVmClusters(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_vm_clusters.list(filter=query_json.get('vm_cluster_filter', None))
    elif artifact == 'VmClusterNetwork':
        logger.info('---- Processing VM Cluster Networks')
        oci_vm_cluster_networks = OCIVmClusterNetworks(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], exadata_infrastructure_id=query_json['exadata_infrastructure_id'])
        response_json = oci_vm_cluster_networks.list(filter=query_json.get('vm_cluster_network_filter', None))
    else:
        logger.warn('---- Unknown Artifact : {0:s}'.format(str(artifact)))
        return '404'

    logger.debug(json.dumps(response_json, sort_keys=True, indent=2, separators=(',', ': ')))
    return json.dumps(standardiseIds(response_json), sort_keys=True)


@bp.route('/resourcetypes/<string:profile>', methods=(['GET']))
def resourceTypes(profile):
    if request.method == 'GET':
        resource_types = OCIResourceTypes(profile=profile)
        resource_types_json = resource_types.list()
        return jsonToFormattedString(resource_types_json)
    else:
        return 'Unknown Method', 500


@bp.route('/dropdown', methods=(['GET']))
def dropdownQuery():
    if request.method == 'GET':
        profile = request.args.get('profile', None)
        region = request.args.get('region', None)
        dropdown_query = PCADropdownQuery(profile=profile)
        dropdown_json = dropdown_query.executeQuery([region])
        return dropdown_json
    else:
        return 'Unknown Method', 500


