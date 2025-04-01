#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "PCACompartmentQuery"
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

class PCACompartmentQuery(OCIConnection):
    LIFECYCLE_STATES = ["RUNNING", "STARTING", "STOPPING", "STOPPED", "CREATING_IMAGE"]
    SUPPORTED_RESOURCES = [
        "Compartment"
    ]

    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(PCACompartmentQuery, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)
        self.dropdown_json = {}
        self.resource_map = {
            "Compartment": {
                "method": self.compartments, 
                "client": "identity", 
                "array": "compartments"
                }
        }
        # Load Tenancy OCID
        self.getTenancy()
        # Set Single Compartment
        self.sub_compartments = False
        self.names = {}
        self.parents = {}

    def connect(self):
        logger.info(f'<<< Connecting PCA Clients >>> ')
        self.clients = {
            "identity": oci.identity.IdentityClient(config=self.config, signer=self.signer)
        }
        if self.cert_bundle is not None:
            for client in self.clients.values():
                client.base_client.session.verify = self.cert_bundle

    def executeQuery(self, regions=None, compartments=[], include_sub_compartments=False, **kwargs):
        logger.info(f'PCA Querying - Region: {regions}')
        logger.info(f'PCA Querying - Compartment: {compartments} {include_sub_compartments}')
        if self.instance_principal:
            self.config['tenancy'] = self.getTenancy()
        if regions is None:
            regions = [self.config['region']]
            logger.info(f'No Region Specified using - Region: {regions}')
        if "cert-bundle" in self.config:
            cert_bundle = self.config["cert-bundle"]
        else:
            cert_bundle = None
        self.sub_compartments = include_sub_compartments
        self.query_compartments = compartments
        response_json = {}
        # Query Compartments
        logger.info(f'>>>>>>>>>>>> Querying All Compartments')
        compartments = self.tenancy_compartments()
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

    def getCanonicalName(self, compartment_id):
        parentsname = ''
        if self.parents[compartment_id] in self.names:
            parentsname = self.getCanonicalName(self.parents[compartment_id])
        return f'{parentsname}/{self.names[compartment_id]}'

    # Supported Resources
    def tenancy_compartments(self):
        resource_map = self.resource_map["Compartment"]
        client = self.clients[resource_map["client"]]
        # All Compartments
        results = oci.pagination.list_call_get_all_results(client.list_compartments, compartment_id=self.tenancy_ocid, compartment_id_in_subtree=True).data
        # Convert to Json object
        self.all_compartments = self.toJson(results)
        self.all_compartment_ids = [c['id'] for c in self.all_compartments]
        return self.all_compartments
    
    def child_compartments(self, compartments):
        query_compartment_ids = [id for id in compartments]
        for id in compartments:
            children = [c['id'] for c in self.all_compartments if c['compartment_id'] == id]
            query_compartment_ids.extend(self.child_compartments(children))
        return query_compartment_ids

    def compartments(self):
        resource_map = self.resource_map["Compartment"]
        client = self.clients[resource_map["client"]]
        array = resource_map["array"]
        resources = []
        self.dropdown_json[array] = []
        if self.sub_compartments:
            self.tenancy_compartments()
            query_compartment_ids = self.child_compartments(self.query_compartments)
            self.query_compartments = query_compartment_ids
            self.dropdown_json[array] = [c for c in self.all_compartments if c['id'] in query_compartment_ids]
        else:
            for compartment_id in self.query_compartments:
                results = oci.pagination.list_call_get_all_results(client.list_compartments, compartment_id=compartment_id).data
                # Convert to Json object
                resources = self.toJson(results)
                self.dropdown_json[array].extend(resources)
        return self.dropdown_json[array]

    def deduplicate(self, resources, key):
        seen = []
        deduped = []
        for r in resources:
            if r[key] not in seen:
                deduped.append(r)
                seen.append(r[key])
        return deduped
