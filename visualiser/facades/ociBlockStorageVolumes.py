#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBlockStorageVolumes"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIBlockStorageVolumeConnection

# Configure logging
logger = getLogger()


class OCIBlockStorageVolumes(OCIBlockStorageVolumeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.block_storage_volumes_json = []
        self.block_storage_volumes_obj = []
        super(OCIBlockStorageVolumes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        block_storage_volumes = oci.pagination.list_call_get_all_results(self.client.list_volumes, compartment_id=compartment_id).data

        # Convert to Json object
        block_storage_volumes_json = self.toJson(block_storage_volumes)
        logger.debug(str(block_storage_volumes_json))

        # Filter results
        self.block_storage_volumes_json = self.filterJsonObjectList(block_storage_volumes_json, filter)
        logger.debug(str(self.block_storage_volumes_json))

        return self.block_storage_volumes_json


class OCIBlockStorageVolume(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

