#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociCompartmentQuery"
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

class OCICompartmentQuery(OCIConnection):
    SUPPORTED_RESOURCES = [
        "Compartment"
    ]
    def __init__(self, config=None, configfile=None, profile=None):
        self.names = {}
        self.parents = {}
        super(OCICompartmentQuery, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        pass

    def executeQuery(self, **kwargs):
        logger.info('Querying Compartments' + str(self.config))
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        # if "cert-bundle" in self.config:
        #     cert_bundle = self.config["cert-bundle"]
        # else:
        #     cert_bundle = None

        discovery_client = OciResourceDiscoveryClient(self.config, signer=self.signer, cert_bundle=self.cert_bundle, include_resource_types=self.SUPPORTED_RESOURCES)
        compartments = self.response_to_json(discovery_client.all_compartments)
        # Generate Name / Id mappings
        for compartment in compartments:
            self.names[compartment['id']] = compartment['name']
            self.parents[compartment['id']] = compartment['compartment_id']
        # Generate Canonical Name
        for compartment in compartments:
            compartment['canonical_name'] = self.getCanonicalName(compartment['id'])
            compartment['display_name'] = compartment['name']
        # Add Root
        compartments.append({'display_name': '/', 'canonical_name': '/', 'id': self.getTenancy(), 'home_region_key': ''})
        # logger.info(jsonToFormattedString(compartments))
        compartments.sort(key=lambda x: x['canonical_name'].lower())
        return compartments

    def response_to_json(self, data):
        # # simple hack to convert to json
        # return str(results).replace("'",'"')
        # more robust hack to convert to json
        json_str = re.sub(r"'([0-9a-zA-Z-\.]*)':", r'"\g<1>":', str(data))
        json_str = re.sub(r"'([0-9a-zA-Z-_\.]*)': '([0-9a-zA-Z-_\.]*)'", r'"\g<1>": "\g<2>"', json_str)
        #return json.dumps(json.loads(json_str), indent=2)
        return json.loads(json_str)

    def getCanonicalName(self, compartment_id):
        parentsname = ''
        if self.parents[compartment_id] in self.names:
            parentsname = self.getCanonicalName(self.parents[compartment_id])
        return f'{parentsname}/{self.names[compartment_id]}'
