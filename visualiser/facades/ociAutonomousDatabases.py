#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0.0"
__module__ = "ociAutonomousDatabases"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()


class OCIAutonomousDatabases(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.autonomous_databases_json = []
        self.autonomous_databases_obj = []
        super(OCIAutonomousDatabases, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        autonomous_databases = oci.pagination.list_call_get_all_results(self.client.list_autonomous_databases, compartment_id=compartment_id).data

        # Convert to Json object
        autonomous_databases_json = self.toJson(autonomous_databases)
        logger.debug(str(autonomous_databases_json))

        # Filter results
        self.autonomous_databases_json = self.filterJsonObjectList(autonomous_databases_json, filter)
        logger.debug(str(self.autonomous_databases_json))

        return self.autonomous_databases_json


class OCIAutonomousDatabase(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

