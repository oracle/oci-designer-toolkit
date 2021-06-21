#!/usr/bin/python

# Copyright (c) 2020, 2021, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

"""Provide Module Description
"""

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
__author__ = ["Andrew Hopkinson (Oracle Cloud Solutions A-Team)"]
__version__ = "1.0.0"
__module__ = "ociConnection"
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

import oci
import os
import re

import json
from common.okitLogging import getLogger

# Configure logging
logger = getLogger()


class OCIConnection(object):
    PAGINATION_LIMIT = 1000;

    def __init__(self, config=None, configfile=None, profile=None, region=None):
        self.tenancy_ocid = ''
        self.config = config
        self.configfile = configfile
        self.client = None
        self.profile = profile
        self.region = region
        # Create Instance Security Signer
        if os.getenv('OCI_CLI_AUTH', 'config') == 'instance_principal':
            self.signerFromInstancePrincipal()
        else:
            self.signerFromConfig()

        self.connect()

    def signerFromInstancePrincipal(self):
        try:
            # Get region
            if self.region is None:
                if self.config is not None:
                    self.region = self.config.get('region', os.getenv('OCI_VM_REGION', 'uk-london-1'))
                else:
                    self.region = os.getenv('OCI_VM_REGION', 'uk-london-1')
           # Get Signer from Instance Principal
            self.signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
            self.config = {"region": self.region}
            self.instance_principal = True
        except Exception:
            logger.warn('Instance Principal is not available')
            self.signerFromConfig()

    def signerFromConfig(self):
        self.loadConfig()
        self.signer = oci.Signer(
            tenancy=self.config["tenancy"],
            user=self.config["user"],
            fingerprint=self.config["fingerprint"],
            private_key_file_location=self.config.get("key_file"),
            pass_phrase=oci.config.get_config_value_or_default(self.config, "pass_phrase")
        )
        self.instance_principal = False

    def loadConfig(self):
        # Copy pass config
        if self.config is not None:
            config = dict(self.config)
        else:
            config = {}
        if self.profile is None or len(self.profile.strip()) == 0:
            self.profile = 'DEFAULT'
        logger.debug('>>>>>>>>>>>>>>>> Config         : {0!s:s}'.format(self.config))
        logger.debug('>>>>>>>>>>>>>>>> Config File    : {0!s:s}'.format(self.configfile))
        logger.debug('>>>>>>>>>>>>>>>> Profile        : {0!s:s}'.format(self.profile))
        # Read Config
        if self.configfile is None:
            self.config = oci.config.from_file(profile_name=self.profile)
        else:
            self.config = oci.config.from_file(file_location=self.configfile, profile_name=self.profile)
        logger.debug('>>>>>>>>>>>>>>>> Profile Config : {0!s:s}'.format(self.config))
        if config is not None:
            self.config.update(config)
        logger.debug('>>>>>>>>>>>>>>>> Merged Config  : {0!s:s}'.format(self.config))

    def getTenancy(self):
        if self.tenancy_ocid is None or self.tenancy_ocid == '':
            if self.instance_principal:
                client = oci.identity.IdentityClient(config=self.config, signer=self.signer)
                compartment_id = os.getenv('OKIT_VM_COMPARTMENT', '')
                if compartment_id is not None and compartment_id != '':
                    while '.tenancy.' not in compartment_id:
                        compartment = self.toJson(client.get_compartment(compartment_id=compartment_id).data)
                        compartment_id = compartment['compartment_id']
                self.tenancy_ocid = compartment_id
            else:
                self.tenancy_ocid = self.config["tenancy"]
        return self.tenancy_ocid

    def toJson(self, data):
        return json.loads(str(data))

    def filterJsonObjectList(self, json_list=[], filter={}):
        if filter is not None and json_list is not None:
            for key, val in filter.items():
                logger.debug('{0!s:s} = {1!s:s}'.format(key, val))
                # Check if filter is a list of strings and join as or
                if isinstance(val, list):
                    val = '|'.join(val)
                    logger.debug('{0!s:s} = {1!s:s}'.format(key, val))
                json_list = [bs for bs in json_list if re.compile(val).search(bs[key])]
        return json_list


class OCIAutoScalingConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIAutoScalingConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.autoscaling.AutoScalingClient(config=self.config, signer=self.signer)
        return


class OCIBlockStorageVolumeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIBlockStorageVolumeConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.BlockstorageClient(config=self.config, signer=self.signer)
        return


class OCIComputeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIComputeConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.ComputeClient(config=self.config, signer=self.signer)
        return


class OCIComputeManagementConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIComputeManagementConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.ComputeManagementClient(config=self.config, signer=self.signer)
        return


class OCIContainerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIContainerConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.container_engine.ContainerEngineClient(config=self.config, signer=self.signer)
        return


class OCIDatabaseConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIDatabaseConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.database.DatabaseClient(config=self.config, signer=self.signer)
        return


class OCIFileStorageSystemConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIFileStorageSystemConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.file_storage.FileStorageClient(config=self.config, signer=self.signer)
        return


class OCIIdentityConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.compartment_ocid = None
        super(OCIIdentityConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.identity.IdentityClient(config=self.config, signer=self.signer)
        self.compartment_ocid = self.getTenancy()
        return


class OCILimitsConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        self.compartment_ocid = None
        super(OCILimitsConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.limits.LimitsClient(config=self.config, signer=self.signer)
        self.compartment_ocid = self.getTenancy()
        return


class OCILoadBalancerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCILoadBalancerConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.load_balancer.LoadBalancerClient(config=self.config, signer=self.signer)
        return


class OCIMySQLDatabaseConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIMySQLDatabaseConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.mysql.DbSystemClient(config=self.config, signer=self.signer)
        return


class OCIMySQLaaSConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIMySQLaaSConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.mysql.MysqlaasClient(config=self.config, signer=self.signer)
        return


class OCIObjectStorageBucketConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIObjectStorageBucketConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.object_storage.ObjectStorageClient(config=self.config, signer=self.signer)
        return


class OCIResourceManagerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIResourceManagerConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.resource_manager.ResourceManagerClient(config=self.config, signer=self.signer)
        return


class OCIResourceSearchConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIResourceSearchConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.resource_search.ResourceSearchClient(config=self.config, signer=self.signer)
        return


class OCIVirtualNetworkConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None):
        super(OCIVirtualNetworkConnection, self).__init__(config=config, configfile=configfile, profile=profile)

    def connect(self):
        self.client = oci.core.VirtualNetworkClient(config=self.config, signer=self.signer)
        return

