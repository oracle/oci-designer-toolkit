#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "PCARegionQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import oci
import re

from discovery import OciResourceDiscoveryClient

from common.okitCommon import jsonToFormattedString
from common.okitCommon import logJson
from common.okitCommon import standardiseIds
from common.okitCommon import jsonToFormattedString
from common.okitCommon import userDataDecode
from common.okitLogging import getLogger
from common.okitCommon import userDataDecode
from facades.ociConnection import OCIConnection

# Configure logging
logger = getLogger()

class PCARegionQuery(OCIConnection):
    LIFECYCLE_STATES = ["RUNNING", "STARTING", "STOPPING", "STOPPED", "CREATING_IMAGE"]
    SUPPORTED_RESOURCES = [
        "Region"
    ]

    def __init__(self, config=None, configfile=None, profile=None):
        super(PCARegionQuery, self).__init__(config=config, configfile=configfile, profile=profile)
        self.dropdown_json = {}
        self.resource_map = {
            "Region": {
                "method": self.regions, 
                "client": "identity", 
                "array": "regions"
                }
        }
        # Load Tenancy OCID
        self.getTenancy()
        # Set Single Region
        self.sub_compartments = False
        self.names = {}
        self.parents = {}

    def connect(self):
        self.clients = {
            "identity": oci.identity.IdentityClient(config=self.config, signer=self.signer)
        }
        if self.cert_bundle is not None:
            for client in self.clients.values():
                client.base_client.session.verify = self.cert_bundle

    def executeQuery(self, **kwargs):
        logger.info(f'>>>>>>>>> PCARegionQuery PCA Querying - Regions')
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        regions = [self.config['region']]
        logger.info(f'No Region Specified using - Region: {regions}')
        if "cert-bundle" in self.config:
            cert_bundle = self.config["cert-bundle"]
        else:
            cert_bundle = None
        response_json = {}
        regions = self.regions()
        logger.info('>>>>> PCA Regions ' + jsonToFormattedString(regions))
        for region in regions:
            # region['display_name'] = region["name"]
            region['display_name'] = self.config['region']
            region['is_home_region'] = True
            # region["id"] = region["name"]
            region["id"] = self.config['region']
            region["name"] = self.config['region']
            # region["name"] = region["region_name"]
            # region["key"] = region["region_key"]
        logger.info('>>>>> PCA Regions ' + jsonToFormattedString(regions))
        if len([r for r in regions if r['id'] == self.config['region']]) > 0:
            logger.info(f'>>>>> PCA Regions Found Config Region {self.config}')
        return regions

    def regions(self):
        resource_map = self.resource_map["Region"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        results = oci.pagination.list_call_get_all_results(client.list_regions).data
        # Convert to Json object
        resources = self.toJson(results)
        self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

