#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Stefan Hinker (Oracle Cloud Solutions A-Team)"]
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

from facades.ociConnection import OCIComputeConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIInstances(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.instances_json = []
        self.instances_obj = []
        super(OCIInstances, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        instances = oci.pagination.list_call_get_all_results(self.client.list_instances, compartment_id=compartment_id).data
        # Convert to Json object
        instances_json = self.toJson(instances)
        logger.debug(str(instances_json))

        # Check if the results should be filtered
        # Stefan: No filtering here so far...
        #if filter is None:
            #self.instances_json = virtual_cloud_networks_json
        #else:
            #filtered = instances_json[:]
            #for key, val in filter.items():
                #filtered = [vcn for vcn in filtered if re.compile(val).search(vcn[key])]
            #self.virtual_cloud_networks_json = filtered
        #logger.debug(str(self.virtual_cloud_networks_json))

        return self.instances_json


class OCIInstance(object):
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
