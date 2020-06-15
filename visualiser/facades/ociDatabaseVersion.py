#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociDatabaseVersion"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()

class OCIDatabaseVersions(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.database_versions_json = []
        self.database_versions_obj = []
        super(OCIDatabaseVersions, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.config['tenancy']
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        database_versions = oci.pagination.list_call_get_all_results(self.client.list_db_versions, compartment_id=compartment_id).data
        logger.debug('============================== DatabaseVersions Raw ==============================')
        logger.debug(str(database_versions))
        # Convert to Json object
        database_versions_json = self.toJson(database_versions)
        logJson(database_versions_json)

        # Filter results
        self.database_versions_json = self.filterJsonObjectList(database_versions_json, filter)
        logger.debug('============================== DatabaseVersions ==============================')
        logger.debug(str(self.database_versions_json))

        return self.database_versions_json



