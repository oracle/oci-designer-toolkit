#!/usr/bin/python

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
from common.okitCommon import logJson
from common.okitLogging import getLogger
from parsers.okitHclJsonParser import OkitHclJsonParser

# Configure logging
logger = getLogger()

bp = Blueprint('parsers', __name__, url_prefix='/okit/parse', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())

@bp.route('hcljson', methods=(['GET']))
def parseHclJson():
    #logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'GET':
        query_string = request.query_string
        parsed_query_string = urllib.parse.unquote(query_string.decode())
        query_json = json.loads(parsed_query_string)
        logJson(query_json)
        # Import HCL
        parser = OkitHclJsonParser()
        response_json = parser.parse(query_json)
        logJson(response_json)
        return json.dumps(response_json, sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'
