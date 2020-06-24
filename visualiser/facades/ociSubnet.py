#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociSubnet"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCISubnets(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vcn_id=None):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.subnets_json = []
        self.subnets_obj = []
        super(OCISubnets, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        if self.vcn_id is not None:
            subnets = oci.pagination.list_call_get_all_results(self.client.list_subnets, compartment_id=compartment_id, vcn_id=self.vcn_id).data
            # Convert to Json object
            subnets_json = self.toJson(subnets)
            logger.debug(str(subnets_json))

            # Filter results
            self.subnets_json = self.filterJsonObjectList(subnets_json, filter)
            logger.debug(str(self.subnets_json))

            # Build List of Subnet Objects
            self.subnets_obj = []
            for subnet in self.subnets_json:
                self.subnets_obj.append(OCISubnet(self.config, self.configfile, self.profile, subnet))
        else:
            logger.warn('Virtual Cloud Network Id has not been specified.')

        return self.subnets_json


class OCISubnet(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

