#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociFileSystem"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIFileSystemConnection

# Configure logging
logger = getLogger()


class OCIFileSystems(OCIFileSystemConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.file_systems_json = []
        super(OCIFileSystems, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        file_systems = oci.pagination.list_call_get_all_results(self.client.list_file_systems, compartment_id=compartment_id).data

        # Convert to Json object
        file_systems_json = self.toJson(file_systems)
        logger.debug(str(file_systems_json))

        # Filter results
        self.file_systems_json = self.filterJsonObjectList(file_systems_json, filter)
        logger.debug(str(self.file_systems_json))

        return self.file_systems_json
