#!/usr/bin/python

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "okitImport"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import os
from flask import Blueprint
from flask import request

import json
from common.okitCommon import logJson
from common.okitLogging import getLogger
from parsers.okitHclJsonParser import OkitHclJsonParser

# Configure logging
logger = getLogger()

bp = Blueprint('parsers', __name__, url_prefix='/okit/import', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())

@bp.route('hcljson', methods=(['POST']))
def importHclJson():
    logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        logJson(request.json)
        # Import HCL
        parser = OkitHclJsonParser(request.json)
        return json.dumps(parser.parse(), sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'
