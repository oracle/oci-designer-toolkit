#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociContainer"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIContainerConnection
from facades.ociNodePool import OCINodePools

# Configure logging
logger = getLogger()


class OCIContainers(OCIContainerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.containers_json = []
        self.containers_obj = []
        super(OCIContainers, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        if filter is None:
            filter = {}
        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = ["ACTIVE", "CREATING"]

        if self.compartment_id is not None:
            containers = oci.pagination.list_call_get_all_results(self.client.list_clusters, compartment_id=compartment_id).data
            # Convert to Json object
            containers_json = self.toJson(containers)
            logger.debug(str(containers_json))

            # Filter results
            self.containers_json = self.filterJsonObjectList(containers_json, filter)
            logger.debug(str(self.containers_json))

            # Build List of Container Objects
            self.containers_obj = []
            for container in self.containers_json:
                # Get Node Pools
                container['pools'] = OCINodePools(config=self.config, configfile=self.configfile, profile=self.profile, compartment_id=compartment_id, cluster_id=container["id"]).list()
                # Build Object List
                self.containers_obj.append(OCIContainer(self.config, self.configfile, self.profile, container))
        else:
            logger.warn('Compartment Id has not been specified.')

        return self.containers_json


class OCIContainer(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

