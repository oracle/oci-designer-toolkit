#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
___version__ = "1.0.0"
__module__ = "ociAvailabilityDomains"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIIdentityConnection

# Configure logging
logger = getLogger()


class OCIAvailabilityDomains(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.availability_domains_json = []
        self.availability_domains_obj = []
        super(OCIAvailabilityDomains, self).__init__(config=config, configfile=configfile, profile=profile)

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
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

