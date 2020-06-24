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
        self.tenancies_obj = []
        self.tenancies_json = []
        self.home_region_key = ''
        super(OCITenancies, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, tenancy_id):
        tenancy = self.client.get_tenancy(tenancy_id=tenancy_id).data
        self.tenancies_json = [self.toJson(tenancy)]
        self.tenancies_obj = [OCITenancy(self.config, self.configfile, self.tenancies_json[0])]
        return self.tenancies_json[0]

    def list(self, id=None, filter={}, recursive=False):
        self.tenancies_json = [self.get(id)]
        return self.tenancies_json

    def listCompartments(self, filter={}):
        tenancy_json = self.get(self.config['tenancy'])
        tenancy_json['compartments'] = super(OCITenancies, self).list(compartment_id=self.config['tenancy'], filter=filter, recursive=True)
        return tenancy_json


class OCITenancy(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

