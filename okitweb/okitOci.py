
# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "okitOci"
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
from flask import request
from flask import jsonify

import json
from common.okitCommon import logJson
from common.okitCommon import readJsonFile
from common.okitCommon import standardiseIds
from common.okitCommon import writeJsonFile
from common.okitLogging import getLogger
from model.okitValidation import OCIJsonValidator
from facades.ociAutonomousDatabases import OCIAutonomousDatabases
from facades.ociBlockStorageVolumes import OCIBlockStorageVolumes
from facades.ociCompartment import OCICompartments
from facades.ociContainer import OCIContainers
from facades.ociCpeDeviceShapes import OCICpeDeviceShapes
from facades.ociCustomerPremiseEquipment import OCICustomerPremiseEquipments
from facades.ociDatabase import OCIDatabases
from facades.ociDatabaseSystem import OCIDatabaseSystems
from facades.ociDatabaseSystemShape import OCIDatabaseSystemShapes
from facades.ociDatabaseVersion import OCIDatabaseVersions
from facades.ociDbHome import OCIDbHomes
from facades.ociDbNode import OCIDbNodes
from facades.ociDynamicRoutingGateway import OCIDynamicRoutingGateways
from facades.ociExadataInfrastructure import OCIExadataInfrastructures
from facades.ociFastConnect import OCIFastConnects
from facades.ociFastConnectProviderServices import OCIFastConnectProviderServices
from facades.ociFileStorageSystems import OCIFileStorageSystems
from facades.ociImage import OCIImages
from facades.ociInstance import OCIInstances
from facades.ociInstancePool import OCIInstancePools
from facades.ociInternetGateway import OCIInternetGateways
from facades.ociIPSecConnection import OCIIPSecConnections
from facades.ociKubernetesVersion import OCIKubernetesVersions
from facades.ociLoadBalancer import OCILoadBalancers
from facades.ociLoadBalancerShape import OCILoadBalancerShapes
from facades.ociLocalPeeringGateway import OCILocalPeeringGateways
from facades.ociMySQLConfiguration import OCIMySQLConfigurations
from facades.ociMySQLDatabaseSystem import OCIMySQLDatabaseSystems
from facades.ociMySQLShape import OCIMySQLShapes
from facades.ociMySQLVersion import OCIMySQLVersions
from facades.ociNATGateway import OCINATGateways
from facades.ociNetworkSecurityGroup import OCINetworkSecurityGroups
from facades.ociObjectStorageBuckets import OCIObjectStorageBuckets
from facades.ociRegion import OCIRegions
from facades.ociRemotePeeringConnection import OCIRemotePeeringConnections
from facades.ociResourceManager import OCIResourceManagers
from facades.ociRouteTable import OCIRouteTables
from facades.ociSecurityList import OCISecurityLists
from facades.ociServiceGateway import OCIServiceGateways
from facades.ociServices import OCIServices
from facades.ociShape import OCIShapes
from facades.ociSubnet import OCISubnets
from facades.ociTenancy import OCITenancies
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from facades.ociVmCluster import OCIVmClusters
from facades.ociVmClusterNetwork import OCIVmClusterNetworks
from generators.okitResourceManagerGenerator import OCIResourceManagerGenerator
from query.ociQuery import OCIQuery

# Configure logging
logger = getLogger()

bp = Blueprint('oci', __name__, url_prefix='/okit/oci', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = '/okit/visualiser/templates'

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

@bp.route('/resourcemanager', methods=(['GET', 'POST']))
def ociResourceManger():
    if request.method == 'GET':
        query_string = request.query_string
        parsed_query_string = urllib.parse.unquote(query_string.decode())
        query_json = json.loads(parsed_query_string)
        logJson(query_json)
        config_profile = query_json.get('location', {}).get('config_profile', 'DEFAULT')
        compartment_id = query_json.get('location', {}).get('compartment_id', None)
        region = query_json.get('location', {}).get('region', None)
        try:
            config = {'region': region}
            oci_resourcemanager = OCIResourceManagers(config=config, profile=config_profile, compartment_id=compartment_id)
            stacks = oci_resourcemanager.list()
            return json.dumps(stacks, sort_keys=False, indent=2, separators=(',', ': '))
        except Exception as e:
            logger.exception(e)
            return str(e), 500
    elif request.method == 'POST':
        logger.debug('JSON     : {0:s}'.format(str(request.json)))
        config_profile = request.json.get('location', {}).get('config_profile', 'DEFAULT')
        compartment_id = request.json.get('location', {}).get('compartment_id', None)
        region = request.json.get('location', {}).get('region', None)
        plan_or_apply = request.json.get('location', {}).get('plan_or_apply', 'PLAN')
        create_or_update = request.json.get('location', {}).get('create_or_update', 'CREATE')
        stack_id = request.json.get('location', {}).get('stack_id', '')
        stack_name = request.json.get('location', {}).get('stack_name', 'okit-stack-{0!s:s}'.format(time.strftime('%Y%m%d%H%M%S')))
        logger.info('Using Profile : {0!s:s}'.format(config_profile))
        try:
            config = {'region': region}
            destination_dir = tempfile.mkdtemp();
            logger.debug(">>>>>>>>>>>>> {0!s:s}".format(destination_dir))
            stack = {}
            stack['display_name'] = stack_name
            oci_compartments = OCICompartments(config=config, profile=config_profile)
            # Generate Resource Manager Terraform zip
            generator = OCIResourceManagerGenerator(template_root, destination_dir, request.json,
                                                    tenancy_ocid=oci_compartments.getTenancy(),
                                                    region=region,
                                                    compartment_ocid=compartment_id)
            generator.generate()
            generator.writeFiles()
            zipname = generator.createZipArchive(os.path.join(destination_dir, 'resource-manager'), "/tmp/okit-resource-manager")
            logger.info('Zipfile : {0:s}'.format(str(zipname)))
            # Upload to Resource manager
            stack['compartment_id'] = compartment_id
            stack['zipfile'] = zipname
            stack['variables'] = generator.getVariables()
            resource_manager = OCIResourceManagers(config=config, profile=config_profile, compartment_id=compartment_id)
            if create_or_update == 'UPDATE':
                stack['id'] = stack_id
                stack_json = resource_manager.updateStack(stack)
            else:
                stack_json = resource_manager.createStack(stack)
            resource_manager.createJob(stack_json, plan_or_apply)
            return_code = 200
            resource_manager.list()
            shutil.rmtree(destination_dir)
            return stack['display_name'], return_code
        except Exception as e:
            logger.exception(e)
            return str(e), 500
    return


@bp.route('/compartment', methods=(['GET']))
def ociCompartment():
    query_string = request.query_string
    parsed_query_string = urllib.parse.unquote(query_string.decode())
    query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
    logJson(query_json)
    config_profile = query_json.get('config_profile', 'DEFAULT')
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


@bp.route('/query', methods=(['GET']))
def ociQuery():
    if request.method == 'GET':
        query_string = request.query_string
        parsed_query_string = urllib.parse.unquote(query_string.decode())
        query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
        logger.debug('===================================== Query Json =====================================')
        logJson(query_json)
        logger.debug('======================================================================================')
        config_profile = query_json.get('config_profile', 'DEFAULT')
        regions = query_json.get('region', None)
        compartments = query_json.get('compartment_id', None)
        #compartments = None # TODO need to pass list of compartment ocids
        logger.info('Using Profile : {0!s:s}'.format(config_profile))
        config = {'region': query_json['region']}
        query = OCIQuery(config=config, profile=config_profile)
        response = query.executeQuery(regions=[regions] if regions else None, compartments=[compartments] if compartments else None, include_sub_compartments=query_json['sub_compartments'])
        config = {'region': query_json['region']}
        #response_json = response_to_json(response)
        logJson(response)
        return response
    else:
        return '404'


def response_to_json(data):
    # # simple hack to convert to json
    # return str(results).replace("'",'"')
    # more robust hack to convert to json
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


@bp.route('/dropdown', methods=(['GET']))
def dropdownQuery():
    if request.method == 'GET':
        dropdown_json = {}
        # Regions
        oci_regions = OCIRegions()
        dropdown_json["regions"] = sorted(oci_regions.list(), key=lambda k: k['name'])
        # Services
        oci_services = OCIServices()
        dropdown_json["services"] = sorted(oci_services.list(), key=lambda k: k['name'])
        # Instance Shapes
        oci_shapes = OCIShapes()
        dropdown_json["shapes"] = sorted(oci_shapes.list(), key=lambda k: k['sort_key'])
        # Instance Images
        oci_images = OCIImages()
        dropdown_json["images"] = sorted(oci_images.list(), key=lambda k: k['sort_key'])
        # Database System Shapes
        db_system_shapes = OCIDatabaseSystemShapes()
        dropdown_json["db_system_shapes"] = sorted(db_system_shapes.list(), key=lambda k: k['shape'])
        # Database Versions
        db_versions = OCIDatabaseVersions()
        dropdown_json["db_versions"] = sorted(db_versions.list(), key=lambda k: k['version'])
        # CPE Device Shapes
        cpe_device_shapes = OCICpeDeviceShapes()
        dropdown_json["cpe_device_shapes"] = sorted(cpe_device_shapes.list(), key=lambda k: k['cpe_device_info']['vendor'])
        # Fast Connect Provider Services
        fast_connect_provider_services = OCIFastConnectProviderServices()
        dropdown_json["fast_connect_provider_services"] = sorted(fast_connect_provider_services.list(), key=lambda k: k['provider_name'])
        # MySQL Shapes
        mysql_shapes = OCIMySQLShapes()
        dropdown_json["mysql_shapes"] = sorted(mysql_shapes.list(), key=lambda k: k['name'])
        # Database Versions
        mysql_versions = OCIMySQLVersions()
        dropdown_json["mysql_versions"] = sorted(mysql_versions.list(), key=lambda k: k['version_family'])
        # MySQL Configurations
        mysql_configurations = OCIMySQLConfigurations()
        dropdown_json["mysql_configurations"] = sorted(mysql_configurations.list(), key=lambda k: k['display_name'])
        # Instance Shapes
        oci_loadbalancer_shapes = OCILoadBalancerShapes()
        dropdown_json["loadbalancer_shapes"] = sorted(oci_loadbalancer_shapes.list(), key=lambda k: k['name'])
        # Kubernetes Versions
        k8_versions = OCIKubernetesVersions()
        dropdown_json["kubernetes_versions"] = sorted(k8_versions.list(), key=lambda k: k['version'], reverse=True)
        return dropdown_json
    else:
        return 'Unknown Method', 500


