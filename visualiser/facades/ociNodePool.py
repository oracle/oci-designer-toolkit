#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociNodePool"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIContainerConnection
from facades.ociImage import OCIImages

# Configure logging
logger = getLogger()


class OCINodePools(OCIContainerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, cluster_id=None):
        self.compartment_id = compartment_id
        self.cluster_id = cluster_id
        self.node_pools_json = []
        self.node_pools_obj = []
        super(OCINodePools, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, cluster_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id
        if cluster_id is None:
            cluster_id = self.cluster_id

        if self.compartment_id is not None:
            logger.info('Pools for Cluster {0!s:s}'.format(self.cluster_id))
            node_pools = oci.pagination.list_call_get_all_results(self.client.list_node_pools, compartment_id=compartment_id, cluster_id=cluster_id).data
            # Convert to Json object
            node_pools_json = self.toJson(node_pools)
            logger.debug(str(node_pools_json))

            # Filter results
            self.node_pools_json = self.filterJsonObjectList(node_pools_json, filter)
            logger.debug(str(self.node_pools_json))

            # Build List of NodePool Objects
            self.node_pools_obj = []
            for node_pool in self.node_pools_json:
                # If the Source Details are not created then we will need to create the element and transfer across
                if 'node_source_details' not in node_pool:
                    node_pool['node_source_details'] = {}
                    node_pool['node_source_details']['image_id'] = node_pool['node_image_id']
                    node_pool['node_source_details']['image'] = node_pool['node_image_name']
                    node_pool['node_source_details']['source_type'] = 'IMAGE'
                    node_pool['node_source_details']['boot_volume_size_in_gbs'] = 50
                # Get OS Details
                image = OCIImages(config=self.config, configfile=self.configfile, profile=self.profile, compartment_id=compartment_id).get(node_pool['node_source_details']['image_id'])
                node_pool['node_source_details']['os'] = image['operating_system']
                node_pool['node_source_details']['os_version'] = image['operating_system_version']
                self.node_pools_obj.append(OCINodePool(self.config, self.configfile, self.profile, node_pool))
        else:
            logger.warn('Compartment Id has not been specified.')
        logger.info(str(self.node_pools_json))
        return self.node_pools_json


class OCINodePool(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

