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
import sys

from facades.ociConnection import OCIIdentityConnection
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetwork
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCICompartment(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, **kwargs):
        self.compartments = []
        self.names = {}
        self.parents = {}
        self.canonicalnames = []
        super(OCICompartment, self).__init__(config=config, configfile=configfile)

    def list(self, id=None, recursive=False):
        if id is None:
            id = self.compartment_ocid
        # Recursive only valid if we are querying the root / tenancy
        recursive = (recursive and (id == self.config['tenancy']))

        compartments = self.client.list_compartments(compartment_id=id, compartment_id_in_subtree=recursive, limit=self.PAGINATION_LIMIT).data
        # Convert to Json object
        self.compartments = self.toJson(compartments)
        logger.debug(str(self.compartments))
        return self.compartments

    def listTenancy(self):
        return self.list(self.config['tenancy'], True)

    def listHierarchicalNames(self):
        compartments = self.listTenancy()
        for compartment in compartments:
            self.names[compartment['id']] = compartment['name']
            self.parents[compartment['id']] = compartment['compartment_id']
        #for compartment in sorted(compartments, key=lambda k: k.time_created):
        for compartment in sorted(compartments, key=lambda k: k['time_created']):
                self.canonicalnames.append(self.getCanonicalName(compartment['id']))
        return sorted(self.canonicalnames)

    def getCanonicalName(self, id):
        parentsname = ''
        if self.parents[id] in self.names:
            parentsname = self.getCanonicalName(self.parents[id])
        return '{0!s:s}/{1!s:s}'.format(parentsname, self.names[id])

    def getVirtualCloudNetworkClient(self, compartment_id):
        return OCIVirtualCloudNetwork(self.config, self.configfile, compartment_id)

# Main processing function
def main(argv):
    ociCompartment = OCICompartment()
    compartments = ociCompartment.listTenancy()
    names = {}
    for compartment in compartments:
        #logger.info("Compartment: {0!s:s}".format(compartment))
        names[compartment['id']] = compartment['name']
    for name in ociCompartment.listHierarchicalNames():
        logger.info('Name: {0!s:s}'.format(name))
    for compartment in compartments:
        vcnclient = ociCompartment.getVirtualCloudNetworkClient(compartment['id'])
        for vcn in vcnclient.list():
            logger.info('Virtual Cloud Network : {0!s:s}'.format(vcn['display_name']))
    return

# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
