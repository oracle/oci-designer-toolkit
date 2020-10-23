#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDatabaseSystemShape"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()

class OCIDatabaseSystemShapes(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.database_system_shapes_json = []
        self.database_system_shapes_obj = []
        super(OCIDatabaseSystemShapes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.getTenancy()
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        database_system_shapes = oci.pagination.list_call_get_all_results(self.client.list_db_system_shapes, compartment_id=compartment_id).data
        logger.debug('============================== DatabaseSystemShapes Raw ==============================')
        logger.debug(str(database_system_shapes))
        # Convert to Json object
        database_system_shapes_json = self.toJson(database_system_shapes)
        logJson(database_system_shapes_json)
        # De-Duplicate
        seen = []
        deduplicated = []
        for shape in database_system_shapes_json:
            if shape['shape'] not in seen:
                deduplicated.append(shape)
                seen.append(shape['shape'])
        logger.debug('============================== Shapes De-Duplicate ==============================')
        logJson(deduplicated)
        database_system_shapes_json = deduplicated


        # Filter results
        self.database_system_shapes_json = self.filterJsonObjectList(database_system_shapes_json, filter)
        logger.debug('============================== DatabaseSystemShapes ==============================')
        logger.debug(str(self.database_system_shapes_json))

        return self.database_system_shapes_json



