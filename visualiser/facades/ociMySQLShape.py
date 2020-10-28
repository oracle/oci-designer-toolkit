#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociMySQLShape"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIMySQLaaSConnection

# Configure logging
logger = getLogger()

class OCIMySQLShapes(OCIMySQLaaSConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.mysql_shapes_json = []
        self.mysql_shapes_obj = []
        super(OCIMySQLShapes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.getTenancy()
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        mysql_shapes = oci.pagination.list_call_get_all_results(self.client.list_shapes, compartment_id=compartment_id).data
        logger.debug('============================== MySQLShapes Raw ==============================')
        logger.debug(str(mysql_shapes))
        # Convert to Json object
        mysql_shapes_json = self.toJson(mysql_shapes)
        logJson(mysql_shapes_json)


        # Filter results
        self.mysql_shapes_json = self.filterJsonObjectList(mysql_shapes_json, filter)
        logger.debug('============================== MySQLShapes ==============================')
        logger.debug(str(self.mysql_shapes_json))

        return self.mysql_shapes_json
