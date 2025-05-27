#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociNoSQLDatabase"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCINoSQLDatabaseConnection

# Configure logging
logger = getLogger()


class OCINoSQLDatabases(OCINoSQLDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.nosql_databases_json = []
        super(OCINoSQLDatabases, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        nosql_databases = oci.pagination.list_call_get_all_results(self.client.list_nosql_databases, compartment_id=compartment_id).data

        # Convert to Json object
        nosql_databases_json = self.toJson(nosql_databases)
        logger.debug(str(nosql_databases_json))

        # Filter results
        self.nosql_databases_json = self.filterJsonObjectList(nosql_databases_json, filter)
        logger.debug(str(self.nosql_databases_json))

        return self.nosql_databases_json
