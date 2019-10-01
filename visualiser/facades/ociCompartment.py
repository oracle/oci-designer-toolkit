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
__module__ = "ociCompartment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys
import json

from facades.ociConnection import OCIIdentityConnection
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from facades.ociInstance import OCIInstances
from facades.ociInstance import OCIInstanceVnics
from facades.ociLoadBalancer import OCILoadBalancers
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCICompartments(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        self.compartments_obj = []
        self.compartments_json = []
        self.names = {}
        self.parents = {}
        self.canonicalnames = []
        super(OCICompartments, self).__init__(config=config, configfile=configfile)

    def get(self, compartment_id):      
        compartment = self.client.get_compartment(compartment_id=compartment_id).data
        self.compartments_json = [self.toJson(compartment)]
        self.compartments_obj = [OCICompartment(self.config, self.configfile, self.compartments_json[0])]
        return self.compartments_json[0]

    def list(self, id=None, filter={}, recursive=False, **kwargs):
        if id is None:
            id = self.compartment_ocid
        # Recursive only valid if we are querying the root / tenancy
        recursive = (recursive and (id == self.config['tenancy']))

        # Add filter to only return ACTIVE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'ACTIVE'

        compartments = oci.pagination.list_call_get_all_results(self.client.list_compartments, compartment_id=id, compartment_id_in_subtree=recursive).data

        # Convert to Json object
        compartments_json = self.toJson(compartments)
        logger.debug(str(compartments_json))

        # Check if the results should be filtered
        #if filter is None:
        #    self.compartments_json = compartments_json
        #else:
            #filtered = compartments_json[:]
            #for key, val in filter.items():
            #    filtered = [comp for comp in filtered if re.compile(val).search(comp[key])]
            #self.compartments_json = filtered

        # Filter results
        self.compartments_json = self.filterJsonObjectList(compartments_json, filter)
        logger.debug(str(self.compartments_json))

        # Generate Name / Id mappings
        for compartment in self.compartments_json:
            self.names[compartment['id']] = compartment['name']
            self.parents[compartment['id']] = compartment['compartment_id']

        # Build List of Compartment Objects that have methods for getting VCN / Security Lists / Route Tables etc
        self.compartments_obj = []
        for compartment in self.compartments_json:
            compartment['display_name'] = self.getCanonicalName(compartment['id'])
            self.compartments_obj.append(OCICompartment(self.config, self.configfile, compartment))
        return self.compartments_json

    def listTenancy(self, filter={}, **kwargs):
        return self.list(id=self.config['tenancy'], filter=filter, recursive=True)

    def listHierarchicalNames(self, filter={}, **kwargs):
        compartments = self.listTenancy(filter=filter)
        for compartment in sorted(compartments, key=lambda k: k['time_created']):
                self.canonicalnames.append(self.getCanonicalName(compartment['id']))
        return sorted(self.canonicalnames)

    def getCanonicalName(self, compartment_id):
        parentsname = ''
        if self.parents[compartment_id] in self.names:
            parentsname = self.getCanonicalName(self.parents[compartment_id])
        return '{0!s:s}/{1!s:s}'.format(parentsname, self.names[compartment_id])


class OCICompartment(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data

    def getVirtualCloudNetworkClients(self):
        return OCIVirtualCloudNetworks(self.config, self.configfile, self.data['id'])

    def getInstanceClients(self):
        return OCIInstances(self.config, self.configfile, self.data['id'])

    def getInstanceVnicClients(self):
        return OCIInstanceVnics(self.config, self.configfile, self.data['id'])

    def getLoadBalancerClients(self):
        return OCILoadBalancers(self.config, self.configfile, self.data['id'])


# Main processing function
def main(argv):

    return

# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
