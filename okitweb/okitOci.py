
# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
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
from common.okitCommon import jsonToFormattedString
from common.okitCommon import readJsonFile
from common.okitCommon import standardiseIds
from common.okitCommon import writeJsonFile
from common.okitCommon import getOkitHome
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
from facades.ociRegionSubscription import OCIRegionSubscriptions
from facades.ociRemotePeeringConnection import OCIRemotePeeringConnections
from facades.ociResourceManager import OCIResourceManagers
from facades.ociResourceTypes import OCIResourceTypes
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
from query.ociCompartmentQuery import OCICompartmentQuery
from query.ociRegionQuery import OCIRegionQuery
from query.ociDropdownQuery import OCIDropdownQuery

# Configure logging
logger = getLogger()

bp = Blueprint('oci', __name__, url_prefix='/okit/oci', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = f'{getOkitHome()}/visualiser/templates'

def loadDropdownFile(profile, region):
    dropdown_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'dropdown'))
    shipped_dropdown_file = os.path.abspath(os.path.join(dropdown_dir, 'dropdown.json'))
    profile_dropdown_dir = os.path.abspath(os.path.join(dropdown_dir, 'profiles'))
    profile_dropdown_file = os.path.abspath(os.path.join(profile_dropdown_dir, profile, f'{region}.json'))
    if os.path.exists(profile_dropdown_file):
        dropdown_file = profile_dropdown_file
        logger.info(f'Loading Dropdown file {dropdown_file}')
        dropdown_json = readJsonFile(dropdown_file)
    else:
        dropdown_file = shipped_dropdown_file
        logger.info(f'Loading Dropdown file {dropdown_file}')
        dropdown_json = readJsonFile(dropdown_file)
        dropdown_json["shipped"] = True
        dropdown_json["default"] = True
    return dropdown_json

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
        config_profile = request.args.get('config_profile', default='DEFAULT')
        compartment_id = request.args.get('compartment_id')
        region = request.args.get('region')
        config = json.loads(request.args.get('config', default='{}', type=str))
        config.update({'region': region})
        try:
            # config = {'region': region}
            oci_resourcemanager = OCIResourceManagers(config=config, profile=config_profile, compartment_id=compartment_id)
            stacks = oci_resourcemanager.list()
            return json.dumps(stacks, sort_keys=False, indent=2, separators=(',', ': '))
        except Exception as e:
            logger.exception(e)
            return str(e), 500
    elif request.method == 'POST':
        logger.debug('JSON     : {0:s}'.format(str(request.json)))
        okit_model_id = request.json.get('okit_model_id', '')
        config_profile = request.json.get('location', {}).get('config_profile', 'DEFAULT')
        compartment_id = request.json.get('location', {}).get('compartment_id', None)
        region = request.json.get('location', {}).get('region', None)
        config = json.loads(request.json.get('location', {}).get('config', '{}'))
        config.update({'region': region})
        plan_or_apply = request.json.get('location', {}).get('plan_or_apply', 'PLAN')
        create_or_update = request.json.get('location', {}).get('create_or_update', 'CREATE')
        stack_id = request.json.get('location', {}).get('stack_id', '')
        stack_name = request.json.get('location', {}).get('stack_name', 'okit-stack-{0!s:s}'.format(time.strftime('%Y%m%d%H%M%S')))
        logger.info('Using Profile : {0!s:s}'.format(config_profile))
        try:
            # config = {'region': region}
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
            stack['freeform_tags'] = generator.getOkitFreeformTags()
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


@bp.route('/compartments/<string:profile>', methods=(['GET']))
def ociCompartments(profile):
    if request.method == 'GET':
        config_profile = request.args.get('config_profile', 'DEFAULT')
        config = json.loads(request.args.get('config', default='{}', type=str))
        oci_compartment_query = OCICompartmentQuery(config=config, profile=profile)
        compartments = oci_compartment_query.executeQuery()
        response = jsonToFormattedString(compartments)
        logger.debug(">>>>>>>>> Compartments: {0!s:s}".format(response))
        return response
    else:
        return 404


@bp.route('/compartment', methods=(['GET']))
def ociCompartment():
    if request.method == 'GET':
        # query_string = request.query_string
        # parsed_query_string = urllib.parse.unquote(query_string.decode())
        # query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
        # logJson(query_json)
        # config_profile = query_json.get('config_profile', 'DEFAULT')
        config_profile = request.args.get('config_profile', 'DEFAULT')
        config = json.loads(request.args.get('config', default='{}', type=str))
        logger.debug('Using Profile : {0!s:s}'.format(config_profile))
        oci_tenancies = OCITenancies(config=config, profile=config_profile)
        tenancy = oci_tenancies.listCompartments()
        compartments = [{'display_name': c['display_name'], 'canonical_name': c['canonical_name'], 'id': c['id'], 'home_region_key': tenancy['home_region_key']} for c in tenancy['compartments']]
        compartments.append({'display_name': '/', 'canonical_name': '/', 'id': tenancy['id'], 'home_region_key': tenancy['home_region_key']})
        compartments.sort(key=lambda x: x['canonical_name'])
        logger.debug("Compartments: {0!s:s}".format(compartments))
        return json.dumps(compartments, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return 404


@bp.route('/subscription', methods=(['GET']))
def ociRegionSubscription():
    if request.method == 'GET':
        profile = request.args.get('profile', default='DEFAULT')
        config = json.loads(request.args.get('config', default='{}', type=str))
        # config = request.args.get('config', default={}, type=str)
        # if type(config) == str:
        #     config = json.loads(request.args.get('config', default={}, type=str))
        logger.info('Subscriptions Query Using Profile : {0!s:s}'.format(profile))
        logger.info(f'ociRegionSubscription: Passed Config: {type(config)} {config}')
        # try:
        oci_regions = OCIRegionSubscriptions(config=config, profile=profile)
        regions = oci_regions.list()
        logger.debug(">>>>>>>>> Region Subscriptions: {0!s:s}".format(regions))
        response = jsonToFormattedString(regions)
        logJson(response)
        return response
        # except Exception as e:
        #     return 500
    else:
        return 404


@bp.route('/regions/<string:profile>', methods=(['GET']))
def ociRegions(profile):
    if request.method == 'GET':
        logger.info(f'>>>>>>>>> Getting Regions for {profile}')
        # profile = request.args.get('profile', default=profile)
        config = json.loads(request.args.get('config', default='{}', type=str))
        oci_region_query = OCIRegionQuery(config=config, profile=profile)
        regions = oci_region_query.executeQuery()
        response = jsonToFormattedString(regions)
        logger.info(">>>>>>>>> Regions: {0!s:s}".format(response))
        return response
    else:
        return 404


@bp.route('/query', methods=(['GET']))
def ociQuery():
    if request.method == 'GET':
        config_profile = request.args.get('config_profile', default='DEFAULT')
        compartments = request.args.get('compartment_id')
        regions = request.args.get('region')
        region = request.args.get('region')
        sub_compartments = request.args.get('sub_compartments', default=False).lower() == 'true'
        logger.info('Using Profile : {0!s:s}'.format(config_profile))
        # config = request.args.get('config', {}, dict)
        config = json.loads(request.args.get('config', default='{}', type=str))
        config.update({'region': region})
        query = OCIQuery(config=config, profile=config_profile)
        response = query.executeQuery(regions=[regions] if regions else None, compartments=[compartments] if compartments else None, include_sub_compartments=sub_compartments)
        logJson(response)
        return response
    else:
        return 404


def response_to_json(data):
    # # simple hack to convert to json
    # return str(results).replace("'",'"')
    # more robust hack to convert to json
    json_str = re.sub(r"'([0-9a-zA-Z-\.]*)':", r'"\g<1>":', str(data))
    json_str = re.sub(r"'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", r'"\g<1>": "\g<2>"', json_str)
    return json.dumps(json.loads(json_str), indent=2)


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
        config = json.loads(request.args.get('config', default='{}', type=str))
        config.update({'region': region})
        try:
            logger.info(f'Dropdown Query Profile {profile}')
            logger.info(f'Dropdown Query Region {region}')
            dropdown_query = OCIDropdownQuery(config=config, profile=profile)
            dropdown_json = dropdown_query.executeQuery([region])
        except Exception as e:
            logger.exception(e)
            dropdown_json = loadDropdownFile(profile, region)
        return dropdown_json
    else:
        return 'Unknown Method', 500


