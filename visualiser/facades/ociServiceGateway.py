#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociServiceGateway"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociConnection import OCIVirtualNetworkConnection

# Configure logging
logger = getLogger()


class OCIServiceGateways(OCIVirtualNetworkConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, vcn_id=None):
        self.compartment_id = compartment_id
        self.vcn_id = vcn_id
        self.service_gateways_json = []
        self.service_gateways_obj = []
        super(OCIServiceGateways, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        logger.info('Compartment Id : {0!s:s}'.format(compartment_id))
        logger.info('VCN Id         : {0!s:s}'.format(self.vcn_id))

        if self.vcn_id is not None:
            service_gateways = oci.pagination.list_call_get_all_results(self.client.list_service_gateways, compartment_id=compartment_id, vcn_id=self.vcn_id).data
            # Convert to Json object
            service_gateways_json = self.toJson(service_gateways)
            logger.debug(str(service_gateways_json))

            # Filter results
            self.service_gateways_json = self.filterJsonObjectList(service_gateways_json, filter)
            logger.debug(str(self.service_gateways_json))

            # Replace null route table with ""
            for service_gateway in self.service_gateways_json:
                if service_gateway['route_table_id'] is None:
                    service_gateway['route_table_id'] = ''
                for service in service_gateway['services']:
                    service_elements = service['service_name'].split()
                    del service_elements[1]
                    service_gateway['service_name'] = " ".join(service_elements)
                    # At the moment we only have 2 optiona All or OCI Object Storage hence we just need the first 3 characters
                    service_gateway['service_name'] = service_elements[0]

            # Build List of ServiceGateway Objects
            #self.service_gateways_obj = []
            #for service_gateway in self.service_gateways_json:
            #    self.service_gateways_obj.append(OCIServiceGateway(self.config, self.configfile, self.profile, service_gateway))
        else:
            logger.warn('Virtual Cloud Network Id has not been specified.')

        return self.service_gateways_json


#class OCIServiceGateway(object):
#    def __init__(self, config=None, configfile=None, profile=None, data=None):
#        self.config = config
#        self.configfile = configfile
#        self.profile = profile
#        self.data = data

