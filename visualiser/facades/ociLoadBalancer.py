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
__module__ = "ociNetwork"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCILoadBalancerConnection
from facades.ociLBHost import OCILBHosts
from facades.ociBackendSet import OCIBackendSets
from facades.ociBackend import OCIBackends
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCILoadBalancers(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.load_balancers_json = []
        self.load_balancers_obj = []
        super(OCILoadBalancers, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        load_balancers = oci.pagination.list_call_get_all_results(self.client.list_load_balancers, compartment_id=compartment_id).data

        # Convert to Json object
        load_balancers_json = self.toJson(load_balancers)
        logger.debug(str(load_balancers_json))

        # Check if the results should be filtered
        if filter is None:
            self.load_balancers_json = load_balancers_json
        else:
            filtered = self.load_balancers_json[:]
            for key, val in filter.items():
                filtered = [vcn for vcn in filtered if re.compile(val).search(vcn[key])]
            self.load_balancers_json = filtered
        logger.debug(str(self.load_balancers_json))

        # Build List of Loadbalancer Objects
        self.load_balancers_obj = []
        for load_balancer in self.load_balancers_json:
            self.load_balancers_obj.append(OCILoadBalancer(self.config, self.configfile, load_balancer))

        return self.load_balancers_json


class OCILoadBalancer(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

    def getLBHostClients(self):
        return OCILBHosts(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getBackendSetClients(self):
        return OCIBackendSets(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

<<<<<<< HEAD
    def getBackendClients(self, backend_set_name=None):
=======
    def getBackendClients(self, load_balancer_id=None, backend_set_name=None):
>>>>>>> dab904351cf355323342383b28feedfd1c5ffe7f
        return OCIBackends(self.config, self.configfile, self.data['id'], backend_set_name)



# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
