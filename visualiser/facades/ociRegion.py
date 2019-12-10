#!/usr/bin/python
# Copyright (c) 2013, 2014-2019 Oracle and/or its affiliates. All rights reserved.


"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__copyright__ = "Copyright (c) 2013, 2014-2019  Oracle and/or its affiliates. All rights reserved."
__ekitversion__ = "@VERSION@"
__ekitrelease__ = "@RELEASE@"
__version__ = "1.0.0.0"
__date__ = "@BUILDDATE@"
__status__ = "@RELEASE@"
__module__ = "ociRegion"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.ociLogging import getLogger
from facades.ociConnection import OCIIdentityConnection

# Configure logging
logger = getLogger()


class OCIRegions(OCIIdentityConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.regions_obj = []
        self.regions_json = []
        self.names = {}
        self.parents = {}
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

        # Generate Name / Id mappings
        for region in self.regions_json:
            self.names[region['key']] = region['name']
            self.parents[region['id']] = region['region_id']
        # Build List of Region Objects that have methods for getting VCN / Security Lists / Route Tables etc
        self.regions_obj = []
        for region in self.regions_json:
            region['display_name'] = self.getCanonicalName(region['id'])
            self.regions_obj.append(OCIRegion(self.config, self.configfile, self.profile, region))
        return self.regions_json


class OCIRegion(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

