#!/usr/bin/python

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociImage"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIComputeConnection

# Configure logging
logger = getLogger()

class OCIImages(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.images_json = []
        self.images_obj = []
        super(OCIImages, self).__init__(config=config, configfile=configfile, profile=profile)

    def get(self, image_id):
        image = self.client.get_image(image_id).data
        logger.debug('Images : ' + str(image))
        image_json = self.toJson(image)
        logger.debug(str(image_json))
        return image_json

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None and self.compartment_id is None:
            compartment_id = self.getTenancy()
        elif compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter
        if filter is None:
            filter = {}

        images = oci.pagination.list_call_get_all_results(self.client.list_images, compartment_id=compartment_id).data
        logger.debug('============================== Images Raw ==============================')
        logger.debug(str(images))
        # Convert to Json object
        images_json = self.toJson(images)
        logJson(images_json)
        # De-Duplicate
        seen = []
        deduplicated = []
        for image in images_json:
            image['sort_key'] = "{0:s} {1:s}".format(image['operating_system'], image['operating_system_version'])
            image['shapes'] = []
            if image['sort_key'] not in seen:
                deduplicated.append(image)
                seen.append(image['sort_key'])
        logger.debug('============================== Images De-Duplicate ==============================')
        logJson(deduplicated)
        #images_json = deduplicated
        # Add Shape Compatibility
        # TODO: Upgade oci sdk
        shape_capabilities = OCIImageShapeCompatibility()
        for image in images_json:
            image['shapes'] = []
        try:
            for image in images_json:
                image['shapes'] = [s['shape'] for s in shape_capabilities.list(image['id'])]
        except oci.exceptions.ServiceError as e:
            logger.exception(e)

        # Filter results
        self.images_json = self.filterJsonObjectList(images_json, filter)
        logger.debug('============================== Images ==============================')
        logger.debug(str(self.images_json))

        return self.images_json

class OCIImageShapeCompatibility(OCIComputeConnection):
    def __init__(self, config=None, configfile=None, profile=None, image_id=None, **kwargs):
        self.image_id = image_id
        self.compatibilities_json = []
        super(OCIImageShapeCompatibility, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, image_id=None, filter=None):
        # Add filter
        if filter is None:
            filter = {}

        compatibilities = oci.pagination.list_call_get_all_results(self.client.list_image_shape_compatibility_entries, image_id=image_id).data
        logger.debug('============================== Compatibilities Raw ==============================')
        logger.debug(str(compatibilities))
        # Convert to Json object
        compatibilities_json = self.toJson(compatibilities)
        logJson(compatibilities_json)

        # Filter results
        self.compatibilities_json = self.filterJsonObjectList(compatibilities_json, filter)
        logger.debug('============================== Compatibilities ==============================')
        logger.debug(str(self.compatibilities_json))

        return self.compatibilities_json

