
# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
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
from common.okitCommon import readJsonFile
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()

bp = Blueprint('pricing', __name__, url_prefix='/okit/pricing', static_folder='static/okit')

debug_mode = bool(str(os.getenv('DEBUG_MODE', 'False')).title())

@bp.route('products', methods=(["GET"]))
def pricingProducts():
    if request.method == 'GET':
        bom_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'bom'))
        products_file = os.path.abspath(os.path.join(bom_dir, 'products.json'))
        return readJsonFile(products_file)
    else:
        return '404'

@bp.route('prices', methods=(["GET"]))
def pricingPrices():
    if request.method == 'GET':
        bom_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'bom'))
        prices_file = os.path.abspath(os.path.join(bom_dir, 'prices.json'))
        return readJsonFile(prices_file)
    else:
        return '404'

@bp.route('shapes', methods=(["GET"]))
def pricingShapes():
    if request.method == 'GET':
        bom_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'bom'))
        products_file = os.path.abspath(os.path.join(bom_dir, 'shapes.json'))
        return readJsonFile(products_file)
    else:
        return '404'

@bp.route('sku_map', methods=(["GET"]))
def pricingSkuMap():
    if request.method == 'GET':
        bom_dir = os.path.abspath(os.path.join(bp.static_folder, 'json', 'bom'))
        prices_file = os.path.abspath(os.path.join(bom_dir, 'sku_map.json'))
        return readJsonFile(prices_file)
    else:
        return '404'
