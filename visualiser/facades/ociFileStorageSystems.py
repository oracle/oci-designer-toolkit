#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociFileStorageSystems"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from facades.ociAvailabilityDomains import OCIAvailabilityDomains
from facades.ociConnection import OCIFileStorageSystemConnection

# Configure logging
logger = getLogger()


class OCIFileStorageSystems(OCIFileStorageSystemConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None):
        self.compartment_id = compartment_id
        self.file_storage_systems_json = []
        self.file_storage_systems_obj = []
        super(OCIFileStorageSystems, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'ACTIVE'

        oci_availability_domains = OCIAvailabilityDomains(config=self.config, compartment_id=compartment_id)
        file_storage_systems_json = []
        for oci_availability_domain in oci_availability_domains.list():
            logger.debug('Availability Domain {0!s:s}'.format(oci_availability_domain))
            file_storage_systems = oci.pagination.list_call_get_all_results(self.client.list_file_systems,
                                                                            compartment_id=compartment_id,
                                                                            availability_domain=oci_availability_domain['name']).data
            ad_file_storage_system_json = self.toJson(file_storage_systems)
            for file_storage_system in ad_file_storage_system_json:
                file_storage_system['availability_domain'] = list(oci_availability_domain['name'])[-1];
                exports = self.listExports(compartment_id, file_storage_system['id'])
                file_storage_system['exports'] = exports
                mount_targets = self.listMountTargets(compartment_id, oci_availability_domain['name'], None)
                file_storage_system['mount_targets'] = mount_targets
            # Convert to Json object
            file_storage_systems_json.extend(ad_file_storage_system_json)

        logger.debug('File Storage Systems {0!s:s}'.format(str(file_storage_systems_json)))

        # Filter results
        self.file_storage_systems_json = self.filterJsonObjectList(file_storage_systems_json, filter)
        logger.debug(str(self.file_storage_systems_json))

        return self.file_storage_systems_json

    def listExports(self, compartment_id, file_system_id):
        exports = oci.pagination.list_call_get_all_results(self.client.list_exports,
                                                            compartment_id=compartment_id,
                                                            file_system_id=file_system_id).data
        exports_json = self.toJson(exports)
        for export in exports_json:
            export_details = self.getExport(export['id'])
            logger.debug('Export Details {0!s:s}'.format(export_details))
            # This release we only deal with a single export option
            export['export_options'] = export_details['export_options'][0]
        return exports_json

    def getExport(self, export_id):
        export = self.client.get_export(export_id=export_id).data
        return self.toJson(export)

    def listMountTargets(self, compartment_id, availability_domain, export_set_id):
        mount_targets = oci.pagination.list_call_get_all_results(self.client.list_mount_targets,
                                                                 compartment_id=compartment_id,
                                                                 availability_domain=availability_domain,
                                                                 export_set_id=export_set_id).data
        mount_targets_json = self.toJson(mount_targets)
        for mount_target in mount_targets_json:
            mount_target.pop('availability_domain', None)
            export_set = self.getExportSet(mount_target['export_set_id'])
            mount_target['export_set'] = {'id': export_set['id'], 'max_fs_stat_bytes': export_set['max_fs_stat_bytes'], 'max_fs_stat_files': export_set['max_fs_stat_files']}
        return mount_targets_json

    def getExportSet(self, export_set_id):
        export_set = self.client.get_export_set(export_set_id=export_set_id).data
        return self.toJson(export_set)

class OCIFileStorageSystem(object):
    def __init__(self, config=None, configfile=None, profile=None, data=None):
        self.config = config
        self.configfile = configfile
        self.profile = profile
        self.data = data

