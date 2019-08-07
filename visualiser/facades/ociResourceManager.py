#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociResourceManager"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIResourceManagerConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIResourceManagers(OCIResourceManagerConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, vcn_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.resource_managers_json = []
        self.resource_managers_obj = []
        super(OCIResourceManagers, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        resource_managers = oci.pagination.list_call_get_all_results(self.client.list_resource_managers, compartment_id=compartment_id, vcn_id=self.vcn_id).data
        # Convert to Json object
        resource_managers_json = self.toJson(resource_managers)
        logger.debug(str(resource_managers_json))

        # Check if the results should be filtered
        if filter is None:
            self.resource_managers_json = resource_managers_json
        else:
            filtered = self.resource_managers_json[:]
            for key, val in filter.items():
                filtered = [vcn for vcn in filtered if re.compile(val).search(vcn[key])]
            self.resource_managers_json = filtered
        logger.debug(str(self.resource_managers_json))

        # Build List of ResourceManager Objects
        self.resource_managers_obj = []
        for resource_manager in self.resource_managers_json:
            self.resource_managers_obj.append(OCIResourceManager(self.config, self.configfile, resource_manager))
        return self.resource_managers_json

    def createStack(self, stack):
        return


class OCIResourceManager(object):
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
