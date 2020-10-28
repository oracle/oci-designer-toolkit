#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociPricing"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

from common.okitLogging import getLogger
from model import okit_price_v2

# Configure logging
logger = getLogger()

class OCIPriceEstimator(object):
    def __init__(self, okit_json={}):
        self.okit_json = okit_json
        self.cost_estimate = {"total": '0', "per_item": '0'}
        self.xls_data = ''

    def estimate(self):
        logger.info('Generate Pricing Estimate for OKIT Json')
        self.cost_estimate = okit_price_v2.load_json(self.okit_json)
        return self.cost_estimate

    def downloadbom(self):
        logger.info('Download Bill of Material for OKIT Json in Excel format')
        self.xls_data = okit_price_v2.export_bom(self.okit_json)
        return self.xls_data
