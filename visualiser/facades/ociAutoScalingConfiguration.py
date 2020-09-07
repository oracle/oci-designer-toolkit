#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociAutoScalingConfigurations"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIAutoScalingConnection

# Configure logging
logger = getLogger()


class OCIAutoScalingConfigurations(OCIAutoScalingConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.auto_scaling_configurations_json = []
        self.auto_scaling_configurations_obj = []
        super(OCIAutoScalingConfigurations, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        auto_scaling_configurations = oci.pagination.list_call_get_all_results(self.client.list_auto_scaling_configurations, compartment_id=compartment_id).data

        # Convert to Json object
        auto_scaling_configurations_json = self.toJson(auto_scaling_configurations)
        logger.debug(str(auto_scaling_configurations_json))

        # Filter results
        self.auto_scaling_configurations_json = self.filterJsonObjectList(auto_scaling_configurations_json, filter)
        logger.debug(str(self.auto_scaling_configurations_json))

        return self.auto_scaling_configurations_json


class OCIAutoScalingConfiguration(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

