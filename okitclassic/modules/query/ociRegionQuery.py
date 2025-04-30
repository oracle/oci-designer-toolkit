#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociRegionQuery"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import json
import oci
import re

from discovery import OciResourceDiscoveryClient

from common.okitCommon import logJson
from common.okitLogging import getLogger
from facades.ociConnection import OCIConnection
from modules.common.okitCommon import jsonToFormattedString

# Configure logging
logger = getLogger()

class OCIRegionQuery(OCIConnection):
    SUPPORTED_RESOURCES = [
        "Compartment"
    ]
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIRegionQuery, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        pass

    def executeQuery(self, **kwargs):
        logger.info('>>>>> Querying Regions' + str(self.config))
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()

        discovery_client = OciResourceDiscoveryClient(self.config, signer=self.signer, cert_bundle=self.cert_bundle, include_resource_types=self.SUPPORTED_RESOURCES)
        regions = self.response_to_json(discovery_client.regions)
        logger.info(f'>>>>> Queried Regions {regions}')
        for region in regions:
            # logger.info(jsonToFormattedString(region))
            region["id"] = region["region_name"]
            region["name"] = region["region_name"]
            region["key"] = region["region_key"]
            if region["name"] == region["key"]:
                # PCA-X9
                region['display_name'] = region["name"]
            else:
                name_parts = region['name'].split('-')
                region['display_name'] = '{0!s:s} {1!s:s}'.format(name_parts[0].upper(), name_parts[1].capitalize())
        if len([r for r in regions if r['id'] == self.config['region']]) > 0:
            logger.info(f'>>>>> Queried Regions Found Config Region {self.config}')
        return regions

    def response_to_json(self, data):
        # # simple hack to convert to json
        # return str(results).replace("'",'"')
        # more robust hack to convert to json
        json_str = re.sub("'([0-9a-zA-Z-\.]*)':", '"\g<1>":', str(data))
        json_str = re.sub("'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", '"\g<1>": "\g<2>"', json_str)
        #return json.dumps(json.loads(json_str), indent=2)
        return json.loads(json_str)
