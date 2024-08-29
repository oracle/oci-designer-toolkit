#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociOracleDigitalAssistant"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIOracleDigitalAssistantConnection

# Configure logging
logger = getLogger()


class OCIOracleDigitalAssistants(OCIOracleDigitalAssistantConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.oracle_digital_assistants_json = []
        super(OCIOracleDigitalAssistants, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        oracle_digital_assistants = oci.pagination.list_call_get_all_results(self.client.list_oracle_digital_assistants, compartment_id=compartment_id).data

        # Convert to Json object
        oracle_digital_assistants_json = self.toJson(oracle_digital_assistants)
        logger.debug(str(oracle_digital_assistants_json))

        # Filter results
        self.oracle_digital_assistants_json = self.filterJsonObjectList(oracle_digital_assistants_json, filter)
        logger.debug(str(self.oracle_digital_assistants_json))

        return self.oracle_digital_assistants_json
