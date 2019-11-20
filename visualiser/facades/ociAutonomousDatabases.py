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
__module__ = "ociAutonomousDatabases"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci
import re
import sys

from facades.ociConnection import OCIAutonomousDatabaseConnection
from common.ociLogging import getLogger

# Configure logging
logger = getLogger()


class OCIAutonomousDatabases(OCIAutonomousDatabaseConnection):
    def __init__(self, config=None, configfile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.autonomous_databases_json = []
        self.autonomous_databases_obj = []
        super(OCIAutonomousDatabases, self).__init__(config=config, configfile=configfile)

    def list(self, compartment_id=None, filter=None):
        if compartment_id is None:
            compartment_id = self.compartment_id

        # Add filter to only return AVAILABLE Compartments
        if filter is None:
            filter = {}

        if 'lifecycle_state' not in filter:
            filter['lifecycle_state'] = 'AVAILABLE'

        autonomous_databases = oci.pagination.list_call_get_all_results(self.client.list_autonomous_databases, compartment_id=compartment_id).data

        # Convert to Json object
        autonomous_databases_json = self.toJson(autonomous_databases)
        logger.debug(str(autonomous_databases_json))

        # Filter results
        self.autonomous_databases_json = self.filterJsonObjectList(autonomous_databases_json, filter)
        logger.debug(str(self.autonomous_databases_json))

        return self.autonomous_databases_json


class OCIAutonomousDatabase(object):
    def __init__(self, config=None, configfile=None, data=None, **kwargs):
        self.config = config
        self.configfile = configfile
        self.data = data


# Main processing function
def main(argv):

    return


# Main function to kick off processing
if __name__ == "__main__":
    main(sys.argv[1:])
