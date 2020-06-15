#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Ulrich Dustmann (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociInternetGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCILoadBalancerConnection

# Configure logging
logger = getLogger()


class OCILoadBalancerHosts(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, lb_id=None):
        self.compartment_id = compartment_id
        self.lb_id = lb_id
        self.lb_hosts_json = []
        self.lb_hosts_obj = []
        super(OCILoadBalancerHosts, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        lb_hosts = oci.pagination.list_call_get_all_results(self.client.list_hostnames, load_balancer_id=self.lb_id).data
        # Convert to Json object
        lb_hosts_json = self.toJson(lb_hosts)
        logger.debug(str(lb_hosts_json))

        # Filter results
        self.lb_hosts_json = self.filterJsonObjectList(lb_hosts_json, filter)
        logger.debug(str(self.lb_hosts_json))

        # Build List of LoadBalancer Host Objects
        self.lb_hosts_obj = []
        for lb_host in self.lb_hosts_json:
            self.lb_hosts_obj.append(OCILoadBalancerHost(self.config, self.configfile, self.profile, lb_host))

        return self.lb_hosts_json


class OCILoadBalancerHost(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

