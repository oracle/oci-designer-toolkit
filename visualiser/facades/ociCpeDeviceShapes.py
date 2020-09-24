#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociCpeDeviceShape"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCICpeDeviceShapes(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.cpe_device_shapes_json = []
        super(OCICpeDeviceShapes, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        cpe_device_shapes = oci.pagination.list_call_get_all_results(self.client.list_cpe_device_shapes).data
        # Convert to Json object
        cpe_device_shapes_json = self.toJson(cpe_device_shapes)
        logger.debug(str(cpe_device_shapes_json))

        # Filter results
        self.cpe_device_shapes_json = self.filterJsonObjectList(cpe_device_shapes_json, filter)
        logger.debug(str(self.cpe_device_shapes_json))

        return self.cpe_device_shapes_json

