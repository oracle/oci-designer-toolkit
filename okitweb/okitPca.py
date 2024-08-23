
# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
from query.pcaCompartmentQuery import PCACompartmentQuery
from query.pcaDropdownQuery import PCADropdownQuery
from query.pcaQuery import PCAQuery
from query.pcaRegionQuery import PCARegionQuery

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


@bp.route('/query', methods=(['GET']))
def pcaQuery():
    if request.method == 'GET':
        config_profile = request.args.get('config_profile', default='DEFAULT')
        compartments = request.args.get('compartment_id')
        regions = request.args.get('region')
        region = request.args.get('region')
        sub_compartments = request.args.get('sub_compartments', default=False).lower() == 'true'
        # logger.info(f'Using Profile : {config_profile}')
        config = {'region': region}
        query = PCAQuery(config=config, profile=config_profile)
        response = query.executeQuery(regions=[regions] if regions else [], compartments=[compartments] if compartments else [], include_sub_compartments=sub_compartments)
        # logJson(response)
        # logger.info(jsonToFormattedString(response))
        return response
    else:
        return 404


@bp.route('/regions', methods=(['GET']))
def pcaRegions():
    logger.info('>>>>>>> PCA Region Query Endpoint')
    if request.method == 'GET':
        config_profile = request.args.get('profile', default='DEFAULT')
        # logger.info(f'>>>>>>>>> Getting PCA Regions for {config_profile}')
        query = PCARegionQuery(config={}, profile=config_profile)
        regions = query.executeQuery()
        response = jsonToFormattedString(regions)
        # logJson(response)
        return response
    else:
        return 404


@bp.route('/compartments/<string:profile>', methods=(['GET']))
def pcaCompartments(profile):
    # logger.debug(">>>>>>>>> Compartments: {0!s:s}".format(profile))
    if request.method == 'GET':
        query = PCACompartmentQuery(profile=profile)
        compartments = query.executeQuery()
        response = jsonToFormattedString(compartments)
        # logJson(response)
        return response
    else:
        return 404


