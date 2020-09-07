#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociAutoScalingPolicies"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIAutoScalingConnection

# Configure logging
logger = getLogger()


class OCIAutoScalingPolicies(OCIAutoScalingConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.auto_scaling_policies_json = []
        self.auto_scaling_policies_obj = []
        super(OCIAutoScalingPolicies, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        auto_scaling_policies = oci.pagination.list_call_get_all_results(self.client.list_auto_scaling_policies, compartment_id=compartment_id).data

        # Convert to Json object
        auto_scaling_policies_json = self.toJson(auto_scaling_policies)
        logger.debug(str(auto_scaling_policies_json))

        # Filter results
        self.auto_scaling_policies_json = self.filterJsonObjectList(auto_scaling_policies_json, filter)
        logger.debug(str(self.auto_scaling_policies_json))

        return self.auto_scaling_policies_json


class OCIAutoScalingPolicie(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

