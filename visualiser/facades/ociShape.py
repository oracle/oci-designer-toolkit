#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociShape"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from facades.ociConnection import OCIComputeConnection

# Configure logging
logger = getLogger()

class OCIShapes(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.shapes_json = []
        self.shapes_obj = []
        super(OCIShapes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.config['tenancy']
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        shapes = oci.pagination.list_call_get_all_results(self.client.list_shapes, compartment_id=compartment_id).data
        logger.debug('============================== Shapes Raw ==============================')
        logger.debug(str(shapes))

        # Convert to Json object
        shapes_json = self.toJson(shapes)
        logger.debug(str(shapes_json))

        # Filter results
        self.shapes_json = self.filterJsonObjectList(shapes_json, filter)
        logger.debug('============================== Shapes ==============================')
        logger.debug(str(self.shapes_json))

        return self.shapes_json



