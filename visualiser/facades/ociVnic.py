#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociVnic"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIVnics(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, vnic_id=None):
        self.vnic_id = vnic_id
        self.vnics_json = []
        self.vnics_obj = []
        super(OCIVnics, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, vnic_id=None):
        try:
            vnic = self.client.get_vnic(vnic_id=vnic_id).data
            logger.debug(str(vnic))
            # Convert to Json object
            vnic_json = self.toJson(vnic)
            logJson(vnic_json)
            return vnic_json
        except oci.exceptions.ServiceError as e:
            logger.exception(e)
            return {}


