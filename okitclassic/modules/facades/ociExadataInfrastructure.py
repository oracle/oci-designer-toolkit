#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociExadataInfrastructure"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIDatabaseConnection

# Configure logging
logger = getLogger()

class OCIExadataInfrastructures(OCIDatabaseConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.exadata_infrastructures_json = []
        super(OCIExadataInfrastructures, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.getTenancy()
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        # if 'lifecycle_state' not in filter:
        #     filter['lifecycle_state'] = ["CREATING", "REQUIRES_ACTIVATION", "ACTIVATING", "ACTIVE", "UPDATING", "DISCONNECTED", "MAINTENANCE_IN_PROGRESS"]

        exadata_infrastructures = oci.pagination.list_call_get_all_results(self.client.list_exadata_infrastructures, compartment_id=compartment_id).data
        logger.debug('============================== ExadataInfrastructures Raw ==============================')
        logger.debug(str(exadata_infrastructures))
        # Convert to Json object
        exadata_infrastructures_json = self.toJson(exadata_infrastructures)
        logJson(exadata_infrastructures_json)
        # Retrieve Full data
        for exadata_infrastructure in exadata_infrastructures_json:
            exadata_infrastructure.update(self.get(exadata_infrastructure["id"]))

        # Filter results
        self.exadata_infrastructures_json = self.filterJsonObjectList(exadata_infrastructures_json, filter)
        logger.debug('============================== ExadataInfrastructures ==============================')
        logger.debug(str(self.exadata_infrastructures_json))

        return self.exadata_infrastructures_json

    def get(self, id=None,):
        exadata_infrastructure = self.client.get_exadata_infrastructure(exadata_infrastructure_id=id).data
        logger.debug('============================== ExadataInfrastructures Raw ==============================')
        logger.debug(str(exadata_infrastructure))
        # Convert to Json object
        exadata_infrastructure_json = self.toJson(exadata_infrastructure)
        logJson(exadata_infrastructure_json)
        return exadata_infrastructure_json



