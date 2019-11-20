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
__module__ = "ociSecurityList"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import sys

from facades.ociConnection import OCIVirtualNetworkConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCISecurityLists(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, vcn_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.security_lists_json = []
        self.security_lists_obj = []
        super(OCISecurityLists, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        if self.vcn_id is not None:
            security_lists = oci.pagination.list_call_get_all_results(self.client.list_security_lists, compartment_id=compartment_id, vcn_id=self.vcn_id).data
            # Convert to Json object
            security_lists_json = self.toJson(security_lists)
            logger.debug(str(security_lists_json))

            # Filter results
            self.security_lists_json = self.filterJsonObjectList(security_lists_json, filter)
            logger.debug(str(self.security_lists_json))

            # Build List of SecurityList Objects
            self.security_lists_obj = []
            for security_list in self.security_lists_json:
                self.security_lists_obj.append(OCISecurityList(self.config, self.configfile, security_list))
        else:
            logger.warn('Virtual Cloud Network Id has not been specified.')

        return self.security_lists_json


class OCISecurityList(object):
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
