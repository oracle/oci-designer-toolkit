#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociRegion"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitCommon import logJson
from common.okitLogging import getLogger
from facades.ociConnection import OCIIdentityConnection

# Configure logging
logger = getLogger()


class OCIRegions(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.regions_obj = []
        self.regions_json = []
        self.canonicalnames = []
        super(OCIRegions, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, region_id):
        region = self.client.get_region(region_id=region_id).data
        self.regions_json = [self.toJson(region)]
        self.regions_obj = [OCIRegion(self.config, self.configfile, self.regions_json[0])]
        return self.regions_json[0]

    def list(self, filter={}):
        regions = oci.pagination.list_call_get_all_results(self.client.list_regions).data
        # Convert to Json object
        regions_json = self.toJson(regions)
        logger.debug(str(regions_json))

        # Filter results
        self.regions_json = self.filterJsonObjectList(regions_json, filter)
        logger.debug(str(self.regions_json))
        logJson(self.regions_json)

        # Build List of Region Objects that have methods for getting VCN / Security Lists / Route Tables etc
        self.regions_obj = []
        for region in self.regions_json:
            name_parts = region['name'].split('-')
            region['display_name'] = '{0!s:s} {1!s:s}'.format(name_parts[0].upper(), name_parts[1].capitalize())
            region['id'] = region['name']
            self.regions_obj.append(OCIRegion(self.config, self.configfile, self.profile, region))
        return sorted(self.regions_json, key=lambda k: k['display_name'], reverse=True)


class OCIRegion(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

