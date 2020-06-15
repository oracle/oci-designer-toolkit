#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Ulrich Dustmann (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociBackends"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCILoadBalancerConnection

# Configure logging
logger = getLogger()


class OCIBackends(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, profile=None, load_balancer_id=None, backend_set_name=None):
        self.load_balancer_id = load_balancer_id
        self.backend_set_name = backend_set_name
        self.backends_json = []
        self.backends_obj = []
        super(OCIBackends, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, load_balancer_id=None, filter=None):
        if load_balancer_id is None:
            load_balancer_id = self.load_balancer_id

        backends = oci.pagination.list_call_get_all_results(self.client.list_backends, load_balancer_id=self.load_balancer_id, backend_set_name=self.backend_set_name).data
        # Convert to Json object
        backends_json = self.toJson(backends)
        logger.debug(str(backends_json))

        # Filter results
        self.backends_json = self.filterJsonObjectList(backends_json, filter)
        logger.debug(str(self.backends_json))

        # Build List of Backend Objects
        self.backends_obj = []
        for backend in self.backends_json:
            self.backends_obj.append(OCIBackend(self.config, self.configfile, self.profile, backend))

        return self.backends_json


class OCIBackend(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

