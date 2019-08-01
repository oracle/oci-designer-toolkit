# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "okitWebDesigner"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import os
import shutil
import tempfile

from flask import Blueprint
from flask import redirect
from flask import render_template
from flask import request
from flask import send_file
from flask import send_from_directory
from flask import session
from flask import url_for

from common.ociCommon import logJson
from generators.ociTerraformGenerator import OCITerraformGenerator
from generators.ociAnsibleGenerator import OCIAnsibleGenerator
from generators.ociPythonGenerator import OCIPythonGenerator
from facades.ociCompartment import OCICompartments
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks

from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

bp = Blueprint('okit', __name__, url_prefix='/okit', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())
template_root = '/okit/visualiser/templates'

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


def standardiseJson(json_data={}, **kwargs):
    if 'compartment' in json_data:
        if 'virtual_cloud_networks' in json_data['compartment']:
            for virtual_network in json_data['compartment']['virtual_cloud_networks']:
                virtual_network['id'] = standardiseId(virtual_network['id'])
                virtual_network['compartment_id'] = standardiseId(virtual_network['compartment_id'])
        if 'internet_gateways'in json_data['compartment']:
            for internet_gateway in json_data['compartment']['internet_gateways']:
                internet_gateway['id'] = standardiseId(internet_gateway['id'])
                internet_gateway['vcn_id'] = standardiseId(internet_gateway['vcn_id'])
                internet_gateway['compartment_id'] = standardiseId(internet_gateway['compartment_id'])
        if 'route_tables'in json_data['compartment']:
            for route_table in json_data['compartment']['route_tables']:
                route_table['id'] = standardiseId(route_table['id'])
                route_table['vcn_id'] = standardiseId(route_table['vcn_id'])
                route_table['compartment_id'] = standardiseId(route_table['compartment_id'])
        if 'security_lists'in json_data['compartment']:
            for security_list in json_data['compartment']['security_lists']:
                security_list['id'] = standardiseId(security_list['id'])
                security_list['vcn_id'] = standardiseId(security_list['vcn_id'])
                security_list['compartment_id'] = standardiseId(security_list['compartment_id'])
        if 'subnets'in json_data['compartment']:
            for subnet in json_data['compartment']['subnets']:
                subnet['id'] = standardiseId(subnet['id'])
                subnet['vcn_id'] = standardiseId(subnet['vcn_id'])
                subnet['compartment_id'] = standardiseId(subnet['compartment_id'])
                subnet['route_table_id'] = standardiseId(subnet['route_table_id'])
                subnet['security_list_ids'] = [standardiseId(id) for id in subnet['security_list_ids']]
    return json_data


def standardiseId(id, from_char='.', to_char='-'):
    return id.replace(from_char, to_char)


@bp.route('/designer', methods=(['GET', 'POST']))
def designer():
    oci_assets_js = os.listdir(os.path.join(bp.static_folder, 'js', 'oci_assets'))
    if request.method == 'POST':
        request_json = {}
        for key, value in request.form.items():
            request_json[key] = value
        request_json['virtual_cloud_network_filter'] = {'display_name': request_json.get('virtual_cloud_network_name_filter', '')}
        response_json = executeQuery(request_json)
        response_string = json.dumps(response_json, separators=(',', ': '))
        return render_template('okit/designer.html', oci_assets_js=oci_assets_js, okit_query_json=response_string)
    elif request.method == 'GET':
        return render_template('okit/designer.html', oci_assets_js=oci_assets_js)


@bp.route('/propertysheets/<string:sheet>', methods=(['GET']))
def propertysheets(sheet):
    return render_template('okit/propertysheets/{0:s}'.format(sheet))


@bp.route('/generate/<string:language>', methods=(['GET', 'POST']))
def generate(language):
    logger.info('Language : {0:s} - {1:s}'.format(str(language), str(request.method)))
    logger.info('JSON     : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        try:
            destination_dir = tempfile.mkdtemp();
            if language == 'terraform':
                generator = OCITerraformGenerator(template_root, destination_dir, request.json)
            elif language == 'ansible':
                generator = OCIAnsibleGenerator(template_root, destination_dir, request.json)
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
    ociCompartments = OCICompartments()
    compartments = ociCompartments.listTenancy()
    #logger.info("Compartments: {0!s:s}".format(compartments))
    return json.dumps(compartments, sort_keys=False, indent=2, separators=(',', ': '))


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

