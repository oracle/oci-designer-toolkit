#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociService"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitCommon import logJson
from common.okitLogging import getLogger
from facades.ociConnection import OCILimitsConnection

# Configure logging
logger = getLogger()


class OCIServices(OCILimitsConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.services_json = []
        super(OCIServices, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, service_id):
        service = self.client.get_service(service_id=service_id).data
        self.services_json = [self.toJson(service)]
        return self.services_json[0]

    def list(self, filter={}):
        services = oci.pagination.list_call_get_all_results(self.client.list_services, compartment_id=self.compartment_ocid).data
        # Convert to Json object
        services_json = self.toJson(services)
        logger.debug(str(services_json))

        # Filter results
        self.services_json = self.filterJsonObjectList(services_json, filter)
        logger.debug(str(self.services_json))
        logJson(self.services_json)

        # Build List of Service Objects that have methods for getting VCN / Security Lists / Route Tables etc
        for service in self.services_json:
            service['display_name'] = service['name']
        return sorted(self.services_json, key=lambda k: k['display_name'])

