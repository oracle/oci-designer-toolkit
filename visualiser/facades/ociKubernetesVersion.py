#!/usr/bin/python

# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociKubernetesVersion"

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


import oci

from common.okitLogging import getLogger
from common.okitCommon import logJson
from facades.ociConnection import OCIContainerConnection

# Configure logging
logger = getLogger()

class OCIKubernetesVersions(OCIContainerConnection):
    def __init__(self, config=None, configfile=None, profile=None, compartment_id=None, **kwargs):
        self.compartment_id = compartment_id
        self.kubernetes_versions_json = []
        super(OCIKubernetesVersions, self).__init__(config=config, configfile=configfile, profile=profile)

    def list(self, cluster_option_id='all', filter=None):
        kubernetes_versions = self.client.get_cluster_options(cluster_option_id).data.kubernetes_versions
        logger.debug('============================== Kubernetes Versions Raw ==============================')
        logger.debug(str(kubernetes_versions))
        # Convert to Json object
        self.kubernetes_versions_json = []
        for version in kubernetes_versions:
            self.kubernetes_versions_json.append({"name": version, "version": version})
        logJson(self.kubernetes_versions_json)

        return self.kubernetes_versions_json

