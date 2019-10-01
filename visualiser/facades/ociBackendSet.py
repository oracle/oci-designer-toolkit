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
__module__ = "ociBackendSet"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys
import json

from facades.ociConnection import OCILoadBalancerConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIBackendSets(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, lb_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.lb_id = lb_id
        self.backendsets_json = []
        self.backendsets_obj = []
        super(OCIBackendSets, self).__init__(config=config, configfile=configfile)

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
            self.backendsets_obj.append(OCIBackendSet(self.config, self.configfile, backendset))

        # Check if the results should be filtered
        #if filter is None:
        #    return self.backendsets_json
        #else:
        #    filtered = self.backendsets_json[:]
        #    for key, val in filter.items():
        #        filtered = [vcn for vcn in filtered if re.compile(val).search(vcn[key])]
        #    return filtered

        return self.backendsets_json


class OCIBackendSet(object):
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
