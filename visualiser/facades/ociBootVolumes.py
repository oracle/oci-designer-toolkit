#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBootVolumes"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIBlockStorageVolumeConnection

# Configure logging
logger = getLogger()


class OCIBootVolumes(OCIBlockStorageVolumeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.boot_volume_json = []
        self.boot_volumes_json = []
        self.boot_volumes_obj = []
        super(OCIBootVolumes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        boot_volumes = oci.pagination.list_call_get_all_results(self.client.list_boot_volumes, compartment_id=compartment_id).data

        # Convert to Json object
        boot_volumes_json = self.toJson(boot_volumes)
        logger.debug(str(boot_volumes_json))

        # Filter results
        self.boot_volumes_json = self.filterJsonObjectList(boot_volumes_json, filter)
        logger.debug(str(self.boot_volumes_json))

        return self.boot_volumes_json

    def get(self, boot_volume_id):
        boot_volume = self.client.get_boot_volume(boot_volume_id=boot_volume_id).data
        # Convert to Json object
        self.boot_volume_json = self.toJson(boot_volume)
        logger.debug(str(self.boot_volume_json))

        return self.boot_volume_json


class OCIBootVolume(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

