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
__module__ = "ociNetwork"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import sys

from facades.ociConnection import OCIVirtualNetworkConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIVirtualCloudNetwork(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.virtual_cloud_networks = []
        self.names = {}
        self.parents = {}
        self.canonicalnames = []
        super(OCIVirtualCloudNetwork, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        virtual_cloud_networks = self.client.list_vcns(compartment_id=compartment_id, limit=self.PAGINATION_LIMIT).data
        # Convert to Json object
        self.virtual_cloud_networks = self.toJson(virtual_cloud_networks)
        logger.debug(str(self.virtual_cloud_networks))
        return self.virtual_cloud_networks


# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
