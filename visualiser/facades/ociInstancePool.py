#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociInstancePools"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIComputeManagementConnection
from facades.ociInstanceConfiguration import OCIInstanceConfigurations

# Configure logging
logger = getLogger()


class OCIInstancePools(OCIComputeManagementConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.instance_pools_json = []
        self.instance_pools_obj = []
        super(OCIInstancePools, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, instance_pool_id=None):
        try:
            instance_pool = self.client.get_instance_pool(instance_pool_id=instance_pool_id).data
            logger.debug(str(instance_pool))
            # Convert to Json object
            instance_pool_json = self.toJson(instance_pool)
            logJson(instance_pool_json)
            return instance_pool_json
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
            filter['lifecycle_state'] = 'RUNNING'

        instance_pools = oci.pagination.list_call_get_all_results(self.client.list_instance_pools, compartment_id=compartment_id).data

        # Convert to Json object
        instance_pools_json = self.toJson(instance_pools)
        logger.debug(str(instance_pools_json))

        # Filter results
        self.instance_pools_json = self.filterJsonObjectList(instance_pools_json, filter)
        logger.debug(str(self.instance_pools_json))

        # Instance Configuration
        oci_instance_configurations = OCIInstanceConfigurations(config=self.config, configfile=self.configfile, profile=self.profile)
        for instance_pool in self.instance_pools_json:
            instance_pool.update(self.get(instance_pool["id"]))
            instance_pool["instance_configuration"] = oci_instance_configurations.get(instance_pool["instance_configuration_id"])

        return self.instance_pools_json


class OCIInstancePool(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

