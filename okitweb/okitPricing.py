
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "okitPriceEstimator"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import os
from flask import Blueprint
from flask import request

import json
from common.okitCommon import logJson
from model.okitCostEstimator import OCIPriceEstimator
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

bp = Blueprint('pricing', __name__, url_prefix='/okit/pricing', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())

@bp.route('estimate', methods=(['POST']))
def pricingEstimate():
    logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'POST':
        logJson(request.json)
        # Price input json
        estimator = OCIPriceEstimator(request.json)
        return json.dumps(estimator.estimate(), sort_keys=False, indent=2, separators=(',', ': '))
    else:
        return '404'

@bp.route('downloadbom', methods=(['GET', 'POST']))
def pricingEstimateDownload():
    logger.debug('JSON : {0:s}'.format(str(request.form['hdnJson'])))
    #logger.debug('JSON : {0:s}'.format(str(request.json)))
    if request.method == 'GET' or request.method == 'POST':
        # logJson(request.json)
        logJson(request.form['hdnJson'])
        estimator = OCIPriceEstimator(request.form['hdnJson'])
        #estimator = OCIPriceEstimator(request.json)
        xlsx_data = estimator.downloadbom()
        return xlsx_data
    else:
        return '404'

