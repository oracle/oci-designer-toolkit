#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Ulrich Dustmann (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociInternetGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys
import json

from facades.ociConnection import OCILoadBalancerConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCILBHosts(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, lb_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.lb_id = lb_id
        self.lb_hosts_json = []
        self.lb_hosts_obj = []
        super(OCILBHosts, self).__init__(config=config, configfile=configfile)

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
            self.lb_hosts_obj.append(OCILBHost(self.config, self.configfile, lb_host))

        return self.lb_hosts_json


class OCILBHost(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data


# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
