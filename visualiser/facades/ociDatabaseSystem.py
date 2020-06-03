#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociDatabaseSystem"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from common.ociCommon import logJson
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()

class OCIDatabaseSystems(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.database_systems_json = []
        self.database_systems_obj = []
        super(OCIDatabaseSystems, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.config['tenancy']
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = ["PROVISIONING", "AVAILABLE", "UPDATING"]

        database_systems = oci.pagination.list_call_get_all_results(self.client.list_db_systems, compartment_id=compartment_id).data
        logger.debug('============================== DatabaseSystems Raw ==============================')
        logger.debug(str(database_systems))
        # Convert to Json object
        database_systems_json = self.toJson(database_systems)
        logJson(database_systems_json)
        # Retrieve Full data
        for db_system in database_systems_json:
            db_system.update(self.get(db_system["id"]))

        # Filter results
        self.database_systems_json = self.filterJsonObjectList(database_systems_json, filter)
        logger.info('============================== DatabaseSystems ==============================')
        logger.info(str(self.database_systems_json))

        return self.database_systems_json

    def get(self, id=None,):
        database_system = self.client.get_db_system(db_system_id=id).data
        logger.debug('============================== DatabaseSystems Raw ==============================')
        logger.debug(str(database_system))
        # Convert to Json object
        database_system_json = self.toJson(database_system)
        logJson(database_system_json)
        return database_system_json



