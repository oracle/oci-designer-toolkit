#!/usr/bin/python

# Copyright (c) 2020, 2022, Oracle and/or its affiliates.
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
    PAGINATION_LIMIT = 1000
    OKIT_VERSION = 'v0.55.0'

    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        self.tenancy_ocid = ''
        self.config = config
        self.configfile = configfile
        self.client = None
        self.profile = profile
        self.region = region
        self.instance_principal = (os.getenv('OCI_CLI_AUTH', 'config') == 'instance_principal')
        if (self.config is not None and self.region is not None):
            self.config['region'] = region
        # Create Instance Security Signer
        logger.info('OCI_CLI_AUTH = ' + os.getenv('OCI_CLI_AUTH', 'Undefined'))
        if signer is None:
            if os.getenv('OCI_CLI_AUTH', 'config') == 'instance_principal':
                self.signerFromInstancePrincipal()
            elif os.getenv('OCI_CLI_AUTH', 'config') == 'instance_obo_user':
                self.signerFromDelegationToken()
            elif os.getenv('OCI_CLI_AUTH', 'config') == 'x509_cert':
                self.signerFromX509Cert()
            else:
                self.signerFromConfig()
        else:
            self.signer = signer
        # Set OKIT User Agent
        self.config['additional_user_agent'] = f'OKIT {self.OKIT_VERSION}'
        # Check Cert Bundle
        if 'cert-bundle' in self.config:
            self.config['cert-bundle'] = os.path.expanduser(self.config['cert-bundle'])
            self.cert_bundle = os.path.expanduser(self.config['cert-bundle'])
        else:
            self.cert_bundle = None
        self.tenancy_override = self.config.get('tenancy_override', None)
        # Connect
        self.connect()

    def signerFromInstancePrincipal(self):
        try:
            # Get region
            if self.region is None:
                if self.config is not None:
                    self.region = self.config.get('region', os.getenv('OKIT_VM_REGION', 'uk-london-1'))
                else:
                    self.region = os.getenv('OKIT_VM_REGION', 'uk-london-1')
           # Get Signer from Instance Principal
            self.signer = oci.auth.signers.InstancePrincipalsSecurityTokenSigner()
            self.config = {"region": self.region}
            self.instance_principal = True
        except Exception:
            logger.warn('Instance Principal is not available')
            self.signerFromConfig()

    def signerFromDelegationToken(self):
        self.loadConfig()
        try:
            # Get region
            if self.region is None:
                if self.config is not None:
                    self.region = self.config.get('region', os.getenv('OKIT_VM_REGION', 'uk-london-1'))
                else:
                    self.region = os.getenv('OKIT_VM_REGION', 'uk-london-1')
           # Get Signer from Instance Principal
            delegation_token_location = self.config["delegation_token_file"]
            with open(delegation_token_location, 'r') as delegation_token_file:
                delegation_token = delegation_token_file.read().strip()
                # get signer from delegation token
                self.signer = oci.auth.signers.InstancePrincipalsDelegationTokenSigner(delegation_token=delegation_token)
        except Exception:
            logger.warn('Delegation Token is not available')
            self.signerFromConfig()

    def signerFromX509Cert(self):
        self.loadConfig()
        try:
            # Get region
            if self.region is None:
                if self.config is not None:
                    self.region = self.config.get('region', os.getenv('OKIT_VM_REGION', 'uk-london-1'))
                else:
                    self.region = os.getenv('OKIT_VM_REGION', 'uk-london-1')
            # Get Signer from From Cert
            cert_path = oci.config.get_config_value_or_default(self.config, "cert-bundle")
            logger.info(f'Cert Path {cert_path}')
            self.signerFromConfig()
            self.instance_principal = False
        except Exception as e:
            logger.warn('X509 Cert is not available')
            logger.exception(e)
            self.signerFromConfig()

    def signerFromConfig(self):
        self.loadConfig()
        if self.config.get("key_content") is not None:
            self.signer = oci.Signer(
                tenancy=self.config["tenancy"],
                # tenancy=self.config.get('boat_tenancy', self.config["tenancy"]),
                user=self.config["user"],
                fingerprint=self.config["fingerprint"],
                private_key_file_location=None,
                pass_phrase=oci.config.get_config_value_or_default(self.config, "pass_phrase"),
                private_key_content=self.config.get("key_content")
            )
        else:
            self.signer = oci.Signer(
                tenancy=self.config["tenancy"],
                # tenancy=self.config.get('boat_tenancy', self.config["tenancy"]),
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
        # logger.debug('>>>>>>>>>>>>>>>> Config         : {0!s:s}'.format(self.config))
        logger.debug('>>>>>>>>>>>>>>>> Config File    : {0!s:s}'.format(self.configfile))
        logger.debug('>>>>>>>>>>>>>>>> Profile        : {0!s:s}'.format(self.profile))
        # Read Config
        try:
            if self.configfile is None:
                self.config = oci.config.from_file(profile_name=self.profile)
            else:
                self.config = oci.config.from_file(file_location=self.configfile, profile_name=self.profile)
        except oci.exceptions.ConfigFileNotFound as e:
            self.config = {}
        except oci.exceptions.ProfileNotFound as e:
            self.config = {}
        # logger.debug('>>>>>>>>>>>>>>>> Profile Config : {0!s:s}'.format(self.config))
        if config is not None:
            self.config.update(config)
        # logger.debug('>>>>>>>>>>>>>>>> Merged Config  : {0!s:s}'.format(self.config))

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
    
    def getClient(self, oci_class):
        if self.tenancy_override is not None:
                logger.info('Overriding Tenancy in Config for BOAT')
                self.config['tenancy'] = self.tenancy_override
        client = oci_class(config=self.config, signer=self.signer)
        if self.cert_bundle is not None:
            client.base_client.session.verify = self.cert_bundle
        return client

class OCIAutoScalingConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIAutoScalingConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.autoscaling.AutoScalingClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.autoscaling.AutoScalingClient)
        return


class OCIBlockStorageVolumeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIBlockStorageVolumeConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.core.BlockstorageClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.core.BlockstorageClient)
        return


class OCIComputeConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIComputeConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.core.ComputeClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.core.ComputeClient)
        return


class OCIComputeManagementConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIComputeManagementConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.core.ComputeManagementClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.core.ComputeManagementClient)
        return


class OCIContainerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIContainerConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.container_engine.ContainerEngineClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.container_engine.ContainerEngineClient)
        return


class OCIDatabaseConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIDatabaseConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.database.DatabaseClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.database.DatabaseClient)
        return


class OCIFileStorageSystemConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIFileStorageSystemConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.file_storage.FileStorageClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.file_storage.FileStorageClient)
        return


class OCIIdentityConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        self.compartment_ocid = None
        super(OCIIdentityConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.identity.IdentityClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.identity.IdentityClient)
        self.compartment_ocid = self.getTenancy()
        return


class OCILimitsConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        self.compartment_ocid = None
        super(OCILimitsConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.limits.LimitsClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.limits.LimitsClient)
        self.compartment_ocid = self.getTenancy()
        return


class OCILoadBalancerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCILoadBalancerConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.load_balancer.LoadBalancerClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.load_balancer.LoadBalancerClient)
        return


class OCIMySQLDatabaseConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIMySQLDatabaseConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.mysql.DbSystemClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.mysql.DbSystemClient)
        return


class OCIMySQLaaSConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIMySQLaaSConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.mysql.MysqlaasClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.mysql.MysqlaasClient)
        return


class OCIObjectStorageBucketConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIObjectStorageBucketConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.object_storage.ObjectStorageClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.object_storage.ObjectStorageClient)
        return


class OCIResourceManagerConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIResourceManagerConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.resource_manager.ResourceManagerClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.resource_manager.ResourceManagerClient)
        return


class OCIResourceSearchConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIResourceSearchConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.resource_search.ResourceSearchClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.resource_search.ResourceSearchClient)
        return


class OCIVirtualNetworkConnection(OCIConnection):
    def __init__(self, config=None, configfile=None, profile=None, region=None, signer=None):
        super(OCIVirtualNetworkConnection, self).__init__(config=config, configfile=configfile, profile=profile, region=region, signer=signer)

    def connect(self):
        # self.client = oci.core.VirtualNetworkClient(config=self.config, signer=self.signer)
        self.client = self.getClient(oci.core.VirtualNetworkClient)
        return

