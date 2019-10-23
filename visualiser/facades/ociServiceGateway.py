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
__module__ = "ociServiceGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIVirtualNetworkConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIServiceGateways(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, vcn_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.service_gateways_json = []
        self.service_gateways_obj = []
        super(OCIServiceGateways, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        logger.info('Compartment Id : {0!s:s}'.format(compartment_id))
        logger.info('VCN Id         : {0!s:s}'.format(self.vcn_id))

        if self.vcn_id is not None:
            service_gateways = oci.pagination.list_call_get_all_results(self.client.list_service_gateways, compartment_id=compartment_id, vcn_id=self.vcn_id).data
            # Convert to Json object
            service_gateways_json = self.toJson(service_gateways)
            logger.debug(str(service_gateways_json))

            # Filter results
            self.service_gateways_json = self.filterJsonObjectList(service_gateways_json, filter)
            logger.debug(str(self.service_gateways_json))

            # Build List of ServiceGateway Objects
            self.service_gateways_obj = []
            for service_gateway in self.service_gateways_json:
                self.service_gateways_obj.append(OCIServiceGateway(self.config, self.configfile, service_gateway))
        else:
            logger.warn('Virtual Cloud Network Id has not been specified.')

        return self.service_gateways_json


class OCIServiceGateway(object):
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
