#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociLoadBalancerShape"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCILoadBalancerConnection

# Configure logging
logger = getLogger()

class OCILoadBalancerShapes(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.shapes_json = []
        self.shapes_obj = []
        super(OCILoadBalancerShapes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.getTenancy()
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        shapes = oci.pagination.list_call_get_all_results(self.client.list_shapes, compartment_id=compartment_id).data
        logger.debug('============================== LoadBalancerShapes Raw ==============================')
        logger.debug(str(shapes))
        # Convert to Json object
        shapes_json = self.toJson(shapes)
        logJson(shapes_json)

        # Filter results
        self.shapes_json = self.filterJsonObjectList(shapes_json, filter)
        logger.debug('============================== LoadBalancerShapes ==============================')
        logger.debug(str(self.shapes_json))

        return self.shapes_json



