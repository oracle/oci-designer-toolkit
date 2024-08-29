#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDatabase"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()


class OCIDatabases(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, db_home_id=None):
        self.compartment_id = compartment_id
        self.db_home_id = db_home_id
        self.databases_json = []
        super(OCIDatabases, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #     filter['lifecycle_state'] = 'AVAILABLE'

        databases = oci.pagination.list_call_get_all_results(self.client.list_databases, compartment_id=compartment_id).data if self.db_home_id is None else oci.pagination.list_call_get_all_results(self.client.list_databases, compartment_id=compartment_id, db_home_id=self.db_home_id).data

        # Convert to Json object
        databases_json = self.toJson(databases)
        logger.debug(str(databases_json))

        # Filter results
        self.databases_json = self.filterJsonObjectList(databases_json, filter)
        logger.debug(str(self.databases_json))

        return self.databases_json
