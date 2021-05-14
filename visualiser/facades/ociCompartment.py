#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociCompartment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIIdentityConnection
# from facades.ociInstance import OCIInstanceVnics
from facades.ociInstance import OCIInstances
from facades.ociLoadBalancer import OCILoadBalancers
from facades.ociVirtualCloudNetwork import OCIVirtualCloudNetworks

# Configure logging
logger = getLogger()


class OCICompartments(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.compartments_obj = []
        self.compartments_json = []
        self.names = {}
        self.parents = {}
        self.canonicalnames = []
        super(OCICompartments, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, compartment_id):
        compartment = self.client.get_compartment(compartment_id=compartment_id).data
        self.compartments_json = [self.toJson(compartment)]
        # self.compartments_obj = [OCICompartment(self.config, self.configfile, self.compartments_json[0])]
        return self.compartments_json[0]

    def list(self, compartment_id=None, filter={}, recursive=False):
        if compartment_id is None:
            compartment_id = self.compartment_id
        # Recursive only valid if we are querying the root / tenancy
        recursive = (recursive and (compartment_id == self.getTenancy()))

        # Add filter to only return ACTIVE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'ACTIVE'

        compartments = oci.pagination.list_call_get_all_results(self.client.list_compartments, compartment_id=compartment_id, compartment_id_in_subtree=recursive).data

        # Convert to Json object
        compartments_json = self.toJson(compartments)
        logger.debug(str(compartments_json))

        # Filter results
        self.compartments_json = self.filterJsonObjectList(compartments_json, filter)
        logger.debug(str(self.compartments_json))

        # Generate Name / Id mappings
        for compartment in self.compartments_json:
            self.names[compartment['id']] = compartment['name']
            self.parents[compartment['id']] = compartment['compartment_id']

        # Build List of Compartment Objects that have methods for getting VCN / Security Lists / Route Tables etc
        self.compartments_obj = []
        for compartment in self.compartments_json:
            compartment['canonical_name'] = self.getCanonicalName(compartment['id'])
            compartment['display_name'] = compartment['name']
            # self.compartments_obj.append(OCICompartment(self.config, self.configfile, self.profile, compartment))
        return self.compartments_json

    def listTenancy(self, filter={}):
        return self.list(compartment_id=self.getTenancy(), filter=filter, recursive=True)

    def listHierarchicalNames(self, filter={}):
        compartments = self.listTenancy(filter=filter)
        for compartment in sorted(compartments, key=lambda k: k['time_created']):
            self.canonicalnames.append(self.getCanonicalName(compartment['id']))
        return sorted(self.canonicalnames)

    def getCanonicalName(self, compartment_id):
        parentsname = ''
        if self.parents[compartment_id] in self.names:
            parentsname = self.getCanonicalName(self.parents[compartment_id])
        return '{0!s:s}/{1!s:s}'.format(parentsname, self.names[compartment_id])


# class OCICompartment(object):
#     def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
#         self.config = config
#         self.configfile = configfile
#         self.profile = profile
#         self.data = data

#     def getVirtualCloudNetworkClients(self):
#         return OCIVirtualCloudNetworks(self.config, self.configfile, self.data['id'])

#     def getInstanceClients(self):
#         return OCIInstances(self.config, self.configfile, self.data['id'])

#     def getInstanceVnicClients(self):
#         return OCIInstanceVnics(self.config, self.configfile, self.data['id'])

#     def getLoadBalancerClients(self):
#         return OCILoadBalancers(self.config, self.configfile, self.data['id'])

