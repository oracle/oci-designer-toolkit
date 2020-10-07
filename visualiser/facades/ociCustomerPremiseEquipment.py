#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociCustomerPremiseEquipment"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCICustomerPremiseEquipments(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.customer_premise_equipments_json = []
        super(OCICustomerPremiseEquipments, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        customer_premise_equipments = oci.pagination.list_call_get_all_results(self.client.list_cpes, compartment_id=compartment_id).data
        # Convert to Json object
        customer_premise_equipments_json = self.toJson(customer_premise_equipments)
        logger.debug(str(customer_premise_equipments_json))

        # Filter results
        self.customer_premise_equipments_json = self.filterJsonObjectList(customer_premise_equipments_json, filter)
        logger.debug(str(self.customer_premise_equipments_json))

        return self.customer_premise_equipments_json

