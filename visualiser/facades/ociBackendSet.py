#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Ulrich Dustmann (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBackendSet"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCILoadBalancerConnection

# Configure logging
logger = getLogger()


class OCIBackendSets(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, lb_id=None):
        self.compartment_id = compartment_id
        self.lb_id = lb_id
        self.backendsets_json = []
        self.backendsets_obj = []
        super(OCIBackendSets, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        backendsets = oci.pagination.list_call_get_all_results(self.client.list_backend_sets, load_balancer_id=self.lb_id).data
        # Convert to Json object
        backendsets_json = self.toJson(backendsets)
        logger.debug(str(backendsets_json))

        # Filter results
        self.backendsets_json = self.filterJsonObjectList(backendsets_json, filter)
        logger.debug(str(self.backendsets_json))

        # Build List of Backendset Objects
        self.backendsets_obj = []
        for backendset in self.backendsets_json:
            self.backendsets_obj.append(OCIBackendSet(self.config, self.configfile, self.profile, backendset))

        return self.backendsets_json


class OCIBackendSet(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

