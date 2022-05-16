#!/usr/bin/python

# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociRegionSubscription"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitCommon import logJson
from common.okitLogging import getLogger
from facades.ociConnection import OCIIdentityConnection

# Configure logging
logger = getLogger()


class OCIRegionSubscriptions(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.regions_json = []
        super(OCIRegionSubscriptions, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, region_id):
        region = self.client.get_region(region_id=region_id).data
        self.regions_json = [self.toJson(region)]
        return self.regions_json[0]

    def list(self, filter={}):
        tenancy_id = self.getTenancy()
        # logger.info(f'Getting Region Subscriptions for {tenancy_id}')
        regions = oci.pagination.list_call_get_all_results(self.client.list_region_subscriptions, tenancy_id=tenancy_id).data
        # logger.info(regions)
        # Convert to Json object
        self.regions_json = self.toJson(regions)
        # logger.info(str(self.regions_json))

        return sorted(self.regions_json, key=lambda k: k['region_name'], reverse=True)
        # return self.regions_json
