#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociInstanceConfigurations"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIComputeManagementConnection

# Configure logging
logger = getLogger()


class OCIInstanceConfigurations(OCIComputeManagementConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.instance_configurations_json = []
        self.instance_configurations_obj = []
        super(OCIInstanceConfigurations, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, instance_configuration_id=None):
        try:
            instance_configuration = self.client.get_instance_configuration(instance_configuration_id=instance_configuration_id).data
            logger.debug(str(instance_configuration))
            # Convert to Json object
            instance_configuration_json = self.toJson(instance_configuration)
            logJson(instance_configuration_json)
            return instance_configuration_json
        except oci.exceptions.ServiceError as e:
            logger.exception(e)
            return {}

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        instance_configurations = oci.pagination.list_call_get_all_results(self.client.list_instance_configurations, compartment_id=compartment_id).data

        # Convert to Json object
        instance_configurations_json = self.toJson(instance_configurations)
        logger.debug(str(instance_configurations_json))

        # Filter results
        self.instance_configurations_json = self.filterJsonObjectList(instance_configurations_json, filter)
        logger.debug(str(self.instance_configurations_json))

        return self.instance_configurations_json


class OCIInstanceConfiguration(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

