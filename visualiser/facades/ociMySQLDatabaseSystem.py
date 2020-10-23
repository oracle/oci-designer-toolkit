#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociMySQLDatabaseSystem"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIMySQLDatabaseConnection

# Configure logging
logger = getLogger()

class OCIMySQLDatabaseSystems(OCIMySQLDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.mysql_database_systems_json = []
        super(OCIMySQLDatabaseSystems, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.getTenancy()
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = ["CREATING", "ACTIVE", "INACTIVE", "UPDATING"]

        mysql_database_systems = oci.pagination.list_call_get_all_results(self.client.list_db_systems, compartment_id=compartment_id).data
        logger.debug('============================== MySQLDatabaseSystems Raw ==============================')
        logger.debug(str(mysql_database_systems))
        # Convert to Json object
        mysql_database_systems_json = self.toJson(mysql_database_systems)
        logJson(mysql_database_systems_json)
        # Retrieve Full data
        for db_system in mysql_database_systems_json:
            db_system.update(self.get(db_system["id"]))
            # Trim version to just the number
            db_system["mysql_version"] = db_system["mysql_version"].split('-')[0]

        # Filter results
        self.mysql_database_systems_json = self.filterJsonObjectList(mysql_database_systems_json, filter)
        logger.info('============================== MySQLDatabaseSystems ==============================')
        logger.info(str(self.mysql_database_systems_json))

        return self.mysql_database_systems_json

    def get(self, id=None,):
        mysql_database_system = self.client.get_db_system(db_system_id=id).data
        logger.debug('============================== MySQLDatabaseSystems Raw ==============================')
        logger.debug(str(mysql_database_system))
        # Convert to Json object
        mysql_database_system_json = self.toJson(mysql_database_system)
        logJson(mysql_database_system_json)
        return mysql_database_system_json

