
# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitWebDesigner"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import oci
import os
import shutil
import tempfile
import time
import urllib
from flask import Blueprint
from flask import render_template
from flask import request
from flask import send_from_directory

import json
from common.ociCommon import logJson
from common.ociCommon import readJsonFile
from common.ociCommon import standardiseIds
from common.ociLogging import getLogger
from common.ociQuery import executeQuery
from facades.ociAutonomousDatabases import OCIAutonomousDatabases
from facades.ociBlockStorageVolumes import OCIBlockStorageVolumes
from facades.ociCompartment import OCICompartments
from facades.ociDynamicRoutingGateway import OCIDynamicRoutingGateways
from facades.ociFastConnect import OCIFastConnects
from facades.ociFileStorageSystems import OCIFileStorageSystems
from facades.ociInstance import OCIInstances
from facades.ociInternetGateway import OCIInternetGateways
from facades.ociLoadBalancer import OCILoadBalancers
from facades.ociLocalPeeringGateway import OCILocalPeeringGateways
from facades.ociNATGateway import OCINATGateways
from facades.ociObjectStorageBuckets import OCIObjectStorageBuckets
from facades.ociRegion import OCIRegions
from facades.ociResourceManager import OCIResourceManagers
from facades.ociRouteTable import OCIRouteTables
from facades.ociSecurityList import OCISecurityLists
from facades.ociServiceGateway import OCIServiceGateways
from facades.ociSubnet import OCISubnets
from facades.ociTenancy import OCITenancies
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from generators.ociAnsibleGenerator import OCIAnsibleGenerator
from generators.ociResourceManagerGenerator import OCIResourceManagerGenerator
from generators.ociTerraform11Generator import OCITerraform11Generator
from generators.ociTerraformGenerator import OCITerraformGenerator

# Configure logging
logger = getLogger()

bp = Blueprint('okit', __name__, url_prefix='/okit', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = '/okit/visualiser/templates'


def standardiseJson(json_data={}, **kwargs):
    logJson(json_data)
    json_data = standardiseIds(json_data)
    logJson(json_data)
    return json_data


@bp.route('/designer', methods=(['GET', 'POST']))
def designer():
    oci_assets_js = sorted(os.listdir(os.path.join(bp.static_folder, 'js', 'oci_assets')))
    #palette_icons_svg = os.listdir(os.path.join(bp.static_folder, 'palette'))
    #logger.info('Basic List Dir : {0!s:s}'.format(palette_icons_svg))
    #palette_icons_svg = [f for f in os.listdir(os.path.join(bp.static_folder, 'palette')) if os.path.isfile(os.path.join(bp.static_folder, 'palette', f))]
    #logger.info('Files List Dir : {0!s:s}'.format(palette_icons_svg))
    svg_files = []
    svg_icon_groups = {}
    # Get Palette Icon Groups / Icons
    for (dirpath, dirnames, filenames) in os.walk(os.path.join(bp.static_folder, 'palette')):
        logger.debug('dirpath : {0!s:s}'.format(dirpath))
        logger.debug('dirnames : {0!s:s}'.format(dirnames))
        logger.debug('filenames : {0!s:s}'.format(filenames))
        if os.path.basename(dirpath) != 'palette':
            svg_files.extend([os.path.join(os.path.basename(dirpath), f) for f in filenames])
            svg_icon_groups[os.path.basename(dirpath)] = filenames;
        else:
            svg_files.extend(filenames)
    logger.debug('Files Walk : {0!s:s}'.format(svg_files))
    logger.debug('SVG Icon Groups {0!s:s}'.format(svg_icon_groups))
    palette_icons_svg = svg_files

    palette_icons = []
    for palette_svg in sorted(palette_icons_svg):
        palette_icon = {'svg': palette_svg, 'title': os.path.basename(palette_svg).split('.')[0].replace('_', ' ')}
        palette_icons.append(palette_icon)
    logger.debug('Palette Icons : {0!s:s}'.format(palette_icons))

    palette_icon_groups = []
    for key in sorted(svg_icon_groups.keys()):
        palette_icon_group = {'name': str(key).title(), 'icons': []}
        for palette_svg in sorted(svg_icon_groups[key]):
            palette_icon = {'svg': os.path.join(key, palette_svg), 'title': os.path.basename(palette_svg).split('.')[0].replace('_', ' ')}
            palette_icon_group['icons'].append(palette_icon)
        palette_icon_groups.append(palette_icon_group)
    logger.debug('Palette Icon Groups : {0!s:s}'.format(palette_icon_groups))
    logJson(palette_icon_groups)

    # Read Template Files
    template_files = os.listdir(os.path.join(bp.static_folder, 'templates'))
    okit_templates = []
    for template_file in sorted(template_files):
        logger.debug('Template : {0!s:s}'.format(template_file))
        logger.debug('Template full : {0!s:s}'.format(os.path.join(bp.static_folder, 'templates', template_file)))
        okit_template = {'json': template_file, 'id': template_file.replace('.', '_')}
        template_json = readJsonFile(os.path.join(bp.static_folder, 'templates', template_file))
        logger.debug('Template Json : {0!s:s}'.format(template_json))
        okit_template['title'] = template_json['title']
        okit_template['description'] = template_json.get('description', template_json['title'])
        okit_templates.append(okit_template)
    logger.debug('Templates : {0!s:s}'.format(okit_templates))

    # Read Fragment Files
    fragment_files = os.listdir(os.path.join(bp.static_folder, 'fragments', 'svg'))
    fragment_icons = []
    for fragment_svg in sorted(fragment_files):
        logger.info('Fragment : {0!s:s}'.format(fragment_svg))
        logger.info('Fragment full : {0!s:s}'.format(os.path.join(bp.static_folder, 'fragments', 'svg', fragment_svg)))
        fragment_icon = {'svg': fragment_svg, 'title': os.path.basename(fragment_svg).split('.')[0].replace('_', ' ').title()}
        logger.info('Icon : {0!s:s}'.format(fragment_icon))
        fragment_icons.append(fragment_icon)

    if request.method == 'POST':
        request_json = {}
        response_json = {}
        logger.debug('>>>>>>>>> Compartments {0!s:s}'.format(request.form.getlist('compartment_id')))
        logger.debug('>>>>>>>>> Regions {0!s:s}'.format(request.form.getlist('region')))
        for key, value in request.form.items():
            logger.debug('>>>>>>>>>>>>>>>>> {0!s:s} : {1!s:s}'.format(key, request.form.get(key)))
            logger.debug('>>>>>>>>>>>>>>>>> {0!s:s} : {1!s:s}'.format(key, request.form.getlist(key)))
            request_json[key] = value
            if key.endswith('name_filter'):
                request_json[key.replace('_name', '')] = {'display_name': request_json[key]}
        request_json['regions'] = request.form.getlist('regions')
        #request_json['virtual_cloud_network_filter'] = {'display_name': request_json.get('virtual_cloud_network_name_filter', '')}
        #request_json['block_storage_volume_filter'] = {'display_name': request_json.get('block_storage_volume_name_filter', '')}
        logger.info('Request Json {0!s:s}'.format(request_json))
        logJson(request_json)
        #response_json = executeQuery(request_json)
        logger.info('Response Json {0!s:s}'.format(response_json))
        logJson(response_json)
        response_string = json.dumps(response_json, separators=(',', ': '))
        return render_template('okit/designer.html', oci_assets_js=oci_assets_js, palette_icons=palette_icons, palette_icon_groups=palette_icon_groups, okit_templates=okit_templates, fragment_icons=fragment_icons, okit_query_request_json=request_json, okit_query_response_json=response_string)
    elif request.method == 'GET':
        logger.info('>>>>>>>>> oci version {0!s:s}'.format(oci.__version__))
        return render_template('okit/designer.html', oci_assets_js=oci_assets_js, palette_icons=palette_icons, palette_icon_groups=palette_icon_groups, okit_templates=okit_templates, fragment_icons=fragment_icons)


@bp.route('/propertysheets/<string:sheet>', methods=(['GET']))
def propertysheets(sheet):
    return render_template('okit/propertysheets/{0:s}'.format(sheet))


@bp.route('/generate/<string:language>', methods=(['GET', 'POST']))
def generate(language):
    logger.info('Language : {0:s} - {1:s}'.format(str(language), str(request.method)))
    logger.debug('JSON     : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        try:
            destination_dir = tempfile.mkdtemp();
            if language == 'terraform':
                generator = OCITerraformGenerator(template_root, destination_dir, request.json)
            elif language == 'ansible':
                generator = OCIAnsibleGenerator(template_root, destination_dir, request.json)
            elif language == 'terraform11':
                generator = OCITerraform11Generator(template_root, destination_dir, request.json)
            generator.generate()
            generator.writeFiles()
            zipname = generator.createZipArchive(os.path.join(destination_dir, language), "/tmp/okit-{0:s}".format(str(language)))
            logger.info('Zipfile : {0:s}'.format(str(zipname)))
            shutil.rmtree(destination_dir)
            filename = os.path.split(zipname)
            logger.info('Split Zipfile : {0:s}'.format(str(filename)))
            return zipname
            #return send_file(zipname, mimetype='application/zip', as_attachment=True)
            #return send_from_directory(filename[0], filename[-1], mimetype='application/zip', as_attachment=True)
        except Exception as e:
            logger.exception(e)
            return str(e), 500
    else:
        return send_from_directory('/tmp', "okit-{0:s}.zip".format(str(language)), mimetype='application/zip', as_attachment=True)


@bp.route('/oci/compartment', methods=(['GET']))
def ociCompartment():
    query_string = request.query_string
    parsed_query_string = urllib.parse.unquote(query_string.decode())
    query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
    logJson(query_json)
    config_profile = query_json.get('config_profile', 'DEFAULT')
    logger.info('Using Profile : {0!s:s}'.format(config_profile))
    oci_tenancies = OCITenancies(profile=config_profile)
    tenancy = oci_tenancies.listCompartments()
    compartments = [{'display_name': c['display_name'], 'id': c['id'], 'home_region_key': tenancy['home_region_key']} for c in tenancy['compartments']]
    compartments.sort(key=lambda x: x['display_name'])
    #logger.info("Compartments: {0!s:s}".format(compartments))
    return json.dumps(compartments, sort_keys=False, indent=2, separators=(',', ': '))


@bp.route('/oci/region', methods=(['GET']))
def ociRegion():
    query_string = request.query_string
    parsed_query_string = urllib.parse.unquote(query_string.decode())
    query_json = json.loads(parsed_query_string)
    logJson(query_json)
    config_profile = query_json.get('config_profile', 'DEFAULT')
    logger.info('Using Profile : {0!s:s}'.format(config_profile))
    oci_regions = OCIRegions(profile=config_profile)
    regions = oci_regions.list()
    #logger.info(">>>>>>>>> Regions: {0!s:s}".format(regions))
    return json.dumps(regions, sort_keys=False, indent=2, separators=(',', ': '))

@bp.route('/oci/query/<string:cloud>', methods=(['GET', 'POST']))
def ociQuery(cloud):
    if cloud == 'oci':
        if request.method == 'POST':
            response_json = {}
            logger.info('Post JSON : {0:s}'.format(str(request.json)))
            return executeQuery(request.json)
        else:
            ociCompartments = OCICompartments()
            compartments = ociCompartments.listTenancy()
            return render_template('okit/oci_query.html', compartments=compartments)
    else:
        return '404'


@bp.route('/oci/artifacts/<string:artifact>', methods=(['GET']))
def ociArtifacts(artifact):
    logger.info('Artifact : {0:s}'.format(str(artifact)))
    query_string = request.query_string
    parsed_query_string = urllib.parse.unquote(query_string.decode())
    query_json = standardiseIds(json.loads(parsed_query_string), from_char='-', to_char='.')
    logJson(query_json)
    logger.info(json.dumps(query_json, sort_keys=True, indent=2, separators=(',', ': ')))
    config_profile = query_json.get('config_profile', 'DEFAULT')
    logger.info('Using Profile : {0!s:s}'.format(config_profile))
    response_json = {}
    config = {'region': query_json['region']}
    if artifact == 'Compartment':
        logger.info('---- Processing Compartments')
        oci_compartments = OCICompartments(config=config, profile=config_profile)
        #response_json = oci_compartments.list(filter=query_json.get('compartment_filter', None))
        response_json = oci_compartments.get(compartment_id=query_json['compartment_id'])
    elif artifact == 'VirtualCloudNetwork':
        logger.info('---- Processing Virtual Cloud Networks')
        oci_virtual_cloud_networks = OCIVirtualCloudNetworks(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_virtual_cloud_networks.list(filter=query_json.get('virtual_cloud_network_filter', None))
    elif artifact == 'InternetGateway':
        logger.info('---- Processing Internet Gateways')
        oci_internet_gateways = OCIInternetGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_internet_gateways.list(filter=query_json.get('internet_gateway_filter', None))
    elif artifact == 'NATGateway':
        logger.info('---- Processing NAT Gateways')
        oci_nat_gateways = OCINATGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_nat_gateways.list(filter=query_json.get('nat_gateway_filter', None))
    elif artifact == 'ServiceGateway':
        logger.info('---- Processing Service Gateways')
        oci_service_gateways = OCIServiceGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_service_gateways.list(filter=query_json.get('service_gateway_filter', None))
    elif artifact == 'DynamicRoutingGateway':
        logger.info('---- Processing Dynamic Routing Gateways')
        oci_dynamic_routing_gateways = OCIDynamicRoutingGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_dynamic_routing_gateways.list(filter=query_json.get('dynamic_routing_gateway_filter', None))
    elif artifact == 'FastConnect':
        logger.info('---- Processing FastConnects')
        oci_fast_connects = OCIFastConnects(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_fast_connects.list(filter=query_json.get('fast_connect_filter', None))
    elif artifact == 'RouteTable':
        logger.info('---- Processing Route Tables')
        oci_route_tables = OCIRouteTables(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_route_tables.list(filter=query_json.get('route_table_filter', None))
    elif artifact == 'SecurityList':
        logger.info('---- Processing Security Lists')
        oci_security_lists = OCISecurityLists(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_security_lists.list(filter=query_json.get('security_list_filter', None))
    elif artifact == 'Subnet':
        logger.info('---- Processing Subnets')
        oci_subnets = OCISubnets(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_subnets.list(filter=query_json.get('subnet_filter', None))
    elif artifact == 'LocalPeeringGateway':
        logger.info('---- Processing LocalPeeringGateways')
        oci_local_peering_gateways = OCILocalPeeringGateways(config=config, profile=config_profile, compartment_id=query_json['compartment_id'], vcn_id=query_json['vcn_id'])
        response_json = oci_local_peering_gateways.list(filter=query_json.get('local_peering_gateway_filter', None))
    elif artifact == 'Instance':
        logger.info('---- Processing Instances')
        oci_instances = OCIInstances(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_instances.list(filter=query_json.get('instance_filter', None))
    elif artifact == 'LoadBalancer':
        logger.info('---- Processing Load Balancers')
        oci_load_balancers = OCILoadBalancers(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_load_balancers.list(filter=query_json.get('load_balancer_filter', None))
        response_json = [lb for lb in response_json if query_json['subnet_id'] in lb['subnet_ids']]
    elif artifact == 'BlockStorageVolume':
        logger.info('---- Processing Block Storage Volumes')
        oci_block_storage_volumes = OCIBlockStorageVolumes(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_block_storage_volumes.list(filter=query_json.get('block_storage_volume_filter', None))
    elif artifact == 'AutonomousDatabase':
        logger.info('---- Processing Autonomous Databases')
        oci_autonomous_databases = OCIAutonomousDatabases(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_autonomous_databases.list(filter=query_json.get('autonomous_database_filter', None))
    elif artifact == 'ObjectStorageBucket':
        logger.info('---- Processing Object Storage Buckets')
        oci_object_storage_buckets = OCIObjectStorageBuckets(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_object_storage_buckets.list(filter=query_json.get('object_storage_bucket_filter', None))
    elif artifact == 'FileStorageSystem':
        logger.info('---- Processing File Storage Systems')
        oci_file_storage_systems = OCIFileStorageSystems(config=config, profile=config_profile, compartment_id=query_json['compartment_id'])
        response_json = oci_file_storage_systems.list(filter=query_json.get('file_storage_system_filter', None))
    else:
        logger.warn('---- Unknown Artifact : {0:s}'.format(str(artifact)))
        return '404'

    logger.debug(json.dumps(response_json, sort_keys=True, indent=2, separators=(',', ': ')))
    return json.dumps(standardiseIds(response_json), sort_keys=True)


@bp.route('/export/<string:destination>', methods=(['POST']))
def export(destination):
    logger.debug('Destination : {0:s} - {1:s}'.format(str(destination), str(request.method)))
    logger.debug('JSON     : {0:s}'.format(str(request.json)))
    config_profile = request.json.get('config_profile', 'DEFAULT')
    logger.info('Using Profile : {0!s:s}'.format(config_profile))
    if request.method == 'POST':
        try:
            config = {}
            destination_dir = tempfile.mkdtemp();
            logger.debug(">>>>>>>>>>>>> {0!s:s}".format(destination_dir))
            stack = {}
            stack['display_name'] = 'okit-stack-export-{0!s:s}'.format(time.strftime('%Y%m%d%H%M%S'))
            stack['display_name'] = 'nightmare-stack-{0!s:s}'.format(time.strftime('%Y%m%d%H%M%S'))
            if destination == 'resourcemanager':
                # Get Compartment Information
                export_compartment_index = request.json.get('open_compartment_index', 0)
                export_compartment_name = request.json['compartments'][export_compartment_index]['name']
                logger.info("Compartment Name {0!s:s}".format(export_compartment_name))
                oci_compartments = OCICompartments(config=config, profile=config_profile)
                compartments = oci_compartments.listTenancy(filter={'name': export_compartment_name})
                logger.debug("Compartments {0!s:s}".format(compartments))
                # If we find a compartment
                if len(compartments) > 0:
                    # Generate Resource Manager Terraform zip
                    generator = OCIResourceManagerGenerator(template_root, destination_dir, request.json,
                                                            tenancy_ocid=oci_compartments.config['tenancy'],
                                                            region=oci_compartments.config['region'],
                                                            compartment_ocid=compartments[0]['id'])
                    generator.generate()
                    generator.writeFiles()
                    zipname = generator.createZipArchive(os.path.join(destination_dir, 'resource-manager'), "/tmp/okit-resource-manager")
                    logger.info('Zipfile : {0:s}'.format(str(zipname)))
                    # Upload to Resource manager
                    stack['compartment_id'] = compartments[0]['id']
                    stack['zipfile'] = zipname
                    stack['variables'] = generator.getVariables()
                    resource_manager = OCIResourceManagers(config=config, profile=config_profile, compartment_id=compartments[0]['id'])
                    stack_json = resource_manager.createStack(stack)
                    resource_manager.createJob(stack_json)
                    return_code = 200
                else:
                    logger.warn('Unknown Compartment {0!s:s}'.format(export_compartment_name))
                    return_code = 400
            shutil.rmtree(destination_dir)
            return stack['display_name'], return_code
        except Exception as e:
            logger.exception(e)
            return str(e), 500
    return
