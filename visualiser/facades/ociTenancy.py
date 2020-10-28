#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociTenancy"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


from common.okitLogging import getLogger
from facades.ociCompartment import OCICompartments

# Configure logging
logger = getLogger()


class OCITenancies(OCICompartments):
    def __init__(self, config=None, configfile=None, profile=None):
        self.tenancies_json = []
        self.home_region_key = ''
        super(OCITenancies, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, tenancy_id):
        tenancy = self.client.get_tenancy(tenancy_id=tenancy_id).data
        self.tenancies_json = [self.toJson(tenancy)]
        return self.tenancies_json[0]

    def list(self, id=None, filter={}, recursive=False):
        self.tenancies_json = [self.get(id)]
        return self.tenancies_json

    def listCompartments(self, filter={}):
        tenancy_json = self.get(self.getTenancy())
        tenancy_json['compartments'] = super(OCITenancies, self).list(compartment_id=self.getTenancy(), filter=filter, recursive=True)
        return tenancy_json

    def getTenancyForCompartment(self, compartment_id):
        if compartment_id is not None and compartment_id != '':
            while '.tenancy.' not in compartment_id:
                compartment = super(OCITenancies, self).get(compartment_id)
                compartment_id = compartment['compartment_id']
        return compartment_id

