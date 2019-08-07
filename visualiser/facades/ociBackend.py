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
__module__ = "ociBackends"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys
import json

from facades.ociConnection import OCILoadBalancerConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIBackends(OCILoadBalancerConnection):
    def __init__(self, config=None, configfile=None, load_balancer_id=None, backend_set_name=None, **kwargs):
        self.load_balancer_id = load_balancer_id
        self.backend_set_name = backend_set_name
        self.backends_json = []
        self.backends_obj = []
        super(OCIBackends, self).__init__(config=config, configfile=configfile)

    def list(self, load_balancer_id=None, filter=None):
        if load_balancer_id is None:
            load_balancer_id = self.load_balancer_id

        backends = oci.pagination.list_call_get_all_results(self.client.list_backends, load_balancer_id=self.load_balancer_id, backend_set_name=self.backend_set_name).data
        # Convert to Json object
        self.backends_json = self.toJson(backends)

        with open("backends.json", "a") as data_file:
            json.dump(self.backends_json, data_file, indent=2)

        logger.debug(str(self.backends_json))
        # Build List of Backend Objects
        self.backends_obj = []
        for backend in self.backends_json:
            self.backends_obj.append(OCIBackend(self.config, self.configfile, backend))
        # Check if the results should be filtered
        if filter is None:
            return self.backends_json
        else:
            filtered = self.backends_json[:]
            for key, val in filter.items():
                filtered = [vcn for vcn in filtered if re.compile(val).search(vcn[key])]
            return filtered


class OCIBackend(object):
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
