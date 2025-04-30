#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitImport"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import os
import urllib
from flask import Blueprint
from flask import request
import json
from werkzeug.utils import secure_filename
from common.okitCommon import logJson
from common.okitCommon import jsonToFormattedString
from common.okitLogging import getLogger
from parsers.okitHclJsonParser import OkitHclJsonParser
from parsers.okitCceJsonParser import OkitCceJsonParser
from parsers.okitCd3ExcelParser import OkitCd3ExcelParser
from parsers.okitTfStateFileParser import OkitTfStateFileParser
from facades.ociResourceManager import OCIResourceManagers

# Configure logging
logger = getLogger()

bp = Blueprint('parsers', __name__, url_prefix='/okit/import', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())

@bp.route('hcljson', methods=(['GET']))
def parseHclJson():
    #logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'GET':
        # query_string = request.query_string
        # parsed_query_string = urllib.parse.unquote(query_string.decode())
        # import_json = json.loads(parsed_query_string)
        import_json = json.loads(request.args.get('json', '{}'))
        logJson(import_json)
        # Import HCL
        parser = OkitHclJsonParser()
        response_json = parser.parse(import_json)
        logJson(response_json)
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

@bp.route('tfstate', methods=(['GET']))
def parseTfStateJson():
    if request.method == 'GET':
        import_json = json.loads(request.args.get('json', '{}'))
        logJson(import_json)
        # Import State
        parser = OkitTfStateFileParser()
        response_json = parser.parse(import_json)
        logJson(response_json)
        return jsonToFormattedString(response_json)
    else:
        return '404'

@bp.route('rmtfstate', methods=(['GET']))
def parseRmTfStateJson():
    if request.method == 'GET':
        config_profile = request.args.get('profile', default='DEFAULT')
        compartment_id = request.args.get('compartment_id')
        region = request.args.get('region')
        stack_id = request.args.get('stack_id', '')
        config = {'region': region}
        oci_resourcemanager = OCIResourceManagers(config=config, profile=config_profile, compartment_id=compartment_id)
        import_json = oci_resourcemanager.getState(stack_id)
        logJson(import_json)
        # Import State
        response_json = {}
        parser = OkitTfStateFileParser()
        response_json = parser.parse(import_json)
        logJson(response_json)
        return jsonToFormattedString(response_json)
    else:
        return '404'

@bp.route('ccejson', methods=(['GET']))
def parseCceJson():
    #logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'GET':
        # query_string = request.query_string
        # parsed_query_string = urllib.parse.unquote(query_string.decode())
        # import_json = json.loads(parsed_query_string)
        import_json = json.loads(request.args.get('json', '{}'))
        logJson(import_json)
        # Import CCE
        parser = OkitCceJsonParser()
        response_json = parser.parse(import_json)
        logJson(response_json)
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

@bp.route('cd3xlsx', methods=(['POST']))
def parseCd3Xlsx():
    if request.method == 'POST':
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename != '':
                filename = os.path.join('/okit/workspace', secure_filename(file.filename))
                logger.info("Saving Xlsx File {0!s:s}".format(filename))
                file.save(filename)
                # Import CD3
                parser = OkitCd3ExcelParser()
                response_json = parser.parse(filename)
                logJson(response_json)
        else:
            response_json = {}
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'
