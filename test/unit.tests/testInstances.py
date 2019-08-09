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
__module__ = "ociCompartment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIIdentityConnection
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks
from facades.ociCompartment import OCICompartments
from facades.ociInstance import OCIInstances
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()

# Main processing function
def main(argv):
    oci_compartments = OCICompartments()
    for name in oci_compartments.listHierarchicalNames(filter={'name': 'Stefan'}):
        logger.info('Compartmentname: {0!s:s}'.format(name))
    for oci_compartment in oci_compartments.compartments_obj:
       
        logger.info('Instances in Compartment: {0!s:s}'.format(oci_compartment.data['display_name']))
        oci_instances = oci_compartment.getInstanceClients()
        oci_instances.list()
        
        for instance in oci_instances.instances_obj:
            logger.info('\tInstance : {0!s:s}'.format(instance.data['display_name']))

    return

# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
