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
import re
import sys

from facades.ociConnection import OCIVirtualNetworkConnection
from facades.ociInternetGateway import OCIInternetGateways
from facades.ociRouteTable import OCIRouteTables
from facades.ociSecurityList import OCISecurityLists
from facades.ociSubnet import OCISubnets
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIVirtualCloudNetworks(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.virtual_cloud_networks_json = []
        self.virtual_cloud_networks_obj = []
        super(OCIVirtualCloudNetworks, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        virtual_cloud_networks = oci.pagination.list_call_get_all_results(self.client.list_vcns, compartment_id=compartment_id).data
        # Convert to Json object
        virtual_cloud_networks_json = self.toJson(virtual_cloud_networks)
        logger.debug(str(virtual_cloud_networks_json))

        # Filter results
        self.virtual_cloud_networks_json = self.filterJsonObjectList(virtual_cloud_networks_json, filter)
        logger.debug(str(self.virtual_cloud_networks_json))

        # Build List of Subnet Objects
        self.virtual_cloud_networks_obj = []
        for virtual_cloud_network in self.virtual_cloud_networks_json:
            self.virtual_cloud_networks_obj.append(OCIVirtualCloudNetwork(self.config, self.configfile, virtual_cloud_network))

        return self.virtual_cloud_networks_json


class OCIVirtualCloudNetwork(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

    def getInternetGatewayClients(self):
        return OCIInternetGateways(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getServiceGatewayClients(self):
        return OCIServiceGateways(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getRouteTableClients(self):
        return OCIRouteTables(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getSecurityListClients(self):
        return OCISecurityLists(self.config, self.configfile, self.data['compartment_id'], self.data['id'])

    def getSubnetClients(self):
        return OCISubnets(self.config, self.configfile, self.data['compartment_id'], self.data['id'])



# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
