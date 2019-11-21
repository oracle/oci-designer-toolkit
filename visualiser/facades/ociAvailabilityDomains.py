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
__module__ = "ociAvailabilityDomains"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from facades.ociConnection import OCIIdentityConnection

# Configure logging
logger = getLogger()


class OCIAvailabilityDomains(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.availability_domains_json = []
        self.availability_domains_obj = []
        super(OCIAvailabilityDomains, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        availability_domains = oci.pagination.list_call_get_all_results(self.client.list_availability_domains, compartment_id=compartment_id).data

        # Convert to Json object
        availability_domains_json = self.toJson(availability_domains)
        logger.debug(str(availability_domains_json))

        # Filter results
        self.availability_domains_json = self.filterJsonObjectList(availability_domains_json, filter)
        logger.info(str(self.availability_domains_json))

        return self.availability_domains_json


class OCIAvailabilityDomain(object):
    def __init__(self, config=None, configfile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.data = data

