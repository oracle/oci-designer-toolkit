# Copyright © 2020, 2021, Oracle and/or its affiliates. All rights reserved.

import argparse
import copy
import json
import oci
import os
import pickle 
import re
import sys
from common.okitLogging import getLogger
from concurrent.futures import ThreadPoolExecutor

from .models import ExtendedAutoScalingPolicySummary, ExtendedBucketSummary, ExtendedNetworkSecurityGroupVnic, ExtendedPreauthenticatedRequestSummary, ExtendedSecurityRule, ExtendedSourceApplicationSummary

DEFAULT_MAX_WORKERS = 32
DEFAULT_TIMEOUT = 120

logger = getLogger()

class OciResourceDiscoveryClient(object):

    # map suppoted resources types to the OCI SDK client type and its "list"
    # method. Create a map of:
    #     { resource_name -> (Client, list_method) }
    list_resource_client_methods = {
        # oci.analytics.AnalyticsClient
        "AnalyticsInstance": (oci.analytics.AnalyticsClient, "list_analytics_instances"),
        # oci.apigateway.ApiGatewayClient
        "ApiGatewayApi": (oci.apigateway.ApiGatewayClient, "list_apis"),
        "ApiGatewayCertificate": (oci.apigateway.ApiGatewayClient, "list_certificates"),
        # oci.apigateway.DeploymentClient
        "ApiDeployment": (oci.apigateway.DeploymentClient, "list_deployments"),
        # oci.apigateway.GatewayClient
        "ApiGateway": (oci.apigateway.GatewayClient, "list_gateways"),
        # oci.application_migration.ApplicationMigrationClient
        "AmsMigration": (oci.application_migration.ApplicationMigrationClient ,"list_migrations"),
        "AmsSource": (oci.application_migration.ApplicationMigrationClient ,"list_sources"),
        "AmsSourceApplication": (oci.application_migration.ApplicationMigrationClient ,"list_source_applications"),
        # oci.autoscaling.AutoScalingClient
        "AutoScalingConfiguration": (oci.autoscaling.AutoScalingClient, "list_auto_scaling_configurations"),
        "AutoScalingPolicy": (oci.autoscaling.AutoScalingClient, "list_auto_scaling_policies"),
        # oci.bds.BdsClient
        "BigDataService": (oci.bds.BdsClient, "list_bds_instances"), # TODO not tested
        # oci.blockchain.BlockchainPlatformClient
        "BlockchainPlatform": (oci.blockchain.BlockchainPlatformClient, "list_blockchain_platforms"),  # TODO not tested
        "BlockchainOsn": (oci.blockchain.BlockchainPlatformClient, "list_osns"), # TODO by blockchain_platform - check resource name
        "BlockchainPeer": (oci.blockchain.BlockchainPlatformClient, "list_peers"), # TODO by blockchain_platform - check resource name
        # oci.core.BlockstorageClient
        "BootVolume": (oci.core.BlockstorageClient, "list_boot_volumes"),
        "BootVolumeBackup": (oci.core.BlockstorageClient, "list_boot_volume_backups"),
        "Volume": (oci.core.BlockstorageClient, "list_volumes"),
        "VolumeBackup": (oci.core.BlockstorageClient, "list_volume_backups"),
        "VolumeBackupPolicy": (oci.core.BlockstorageClient, "list_volume_backup_policies"),
        "VolumeGroup": (oci.core.BlockstorageClient, "list_volume_groups"),
        "VolumeGroupBackup": (oci.core.BlockstorageClient, "list_volume_group_backups"),
        # oci.budget.BudgetClient
        "Budget": (oci.budget.BudgetClient, "list_budgets"), 
        "AlertRule": (oci.budget.BudgetClient, "list_alert_rules"),
        # oci.cloud_guard.CloudGuardClient
        "CloudGuardDetectorRecipe": (oci.cloud_guard.CloudGuardClient, "list_detector_recipes"),
        "CloudGuardManagedList": (oci.cloud_guard.CloudGuardClient, "list_managed_lists"),
        "CloudGuardResponderRecipe": (oci.cloud_guard.CloudGuardClient, "list_responder_recipes"),
        "CloudGuardTarget": (oci.cloud_guard.CloudGuardClient, "list_targets"),
        # oci.container_engine.ContainerEngineClient
        "Cluster": (oci.container_engine.ContainerEngineClient, "list_clusters"),
        "NodePool": (oci.container_engine.ContainerEngineClient, "list_node_pools"),
        # oci.core.ComputeClient
        "BootVolumeAttachment": (oci.core.ComputeClient, "list_boot_volume_attachments"),
        "Image": (oci.core.ComputeClient, "list_images"),
        "Instance": (oci.core.ComputeClient, "list_instances"),
        "VnicAttachment": (oci.core.ComputeClient, "list_vnic_attachments"),
        "VolumeAttachment": (oci.core.ComputeClient, "list_volume_attachments"),
        # oci.core.ComputeManagementClient
        "ClusterNetwork": (oci.core.ComputeManagementClient, "list_cluster_networks"),
        "InstanceConfiguration": (oci.core.ComputeManagementClient, "list_instance_configurations"),
        "InstancePool": (oci.core.ComputeManagementClient, "list_instance_pools"),
        # oci.core.VirtualNetworkClient
        "CrossConnect": (oci.core.VirtualNetworkClient, "list_cross_connects"),
        "CrossConnectGroup": (oci.core.VirtualNetworkClient, "list_cross_connect_groups"),
        "Cpe": (oci.core.VirtualNetworkClient, "list_cpes"),
        "DHCPOptions": (oci.core.VirtualNetworkClient, "list_dhcp_options"),
        "Drg": (oci.core.VirtualNetworkClient, "list_drgs"),
        "DrgAttachment": (oci.core.VirtualNetworkClient, "list_drg_attachments"),
        "InternetGateway": (oci.core.VirtualNetworkClient, "list_internet_gateways"),
        "IPSecConnection": (oci.core.VirtualNetworkClient, "list_ip_sec_connections"),
        "IpSecConnectionTunnel": (oci.core.VirtualNetworkClient, "list_ip_sec_connection_tunnels"),
        "Ipv6": (oci.core.VirtualNetworkClient, "list_ipv6s"),
        "LocalPeeringGateway": (oci.core.VirtualNetworkClient, "list_local_peering_gateways"),
        "NatGateway": (oci.core.VirtualNetworkClient, "list_nat_gateways"),
        "NetworkSecurityGroup": (oci.core.VirtualNetworkClient, "list_network_security_groups"),
        "NetworkSecurityGroupSecurityRule": (oci.core.VirtualNetworkClient, "list_network_security_group_security_rules"),
        "NetworkSecurityGroupVnic": (oci.core.VirtualNetworkClient, "list_network_security_group_vnics"),
        "PrivateIp": (oci.core.VirtualNetworkClient, "list_private_ips"),
        "PublicIp": (oci.core.VirtualNetworkClient, "list_public_ips"),
        "RemotePeeringConnection": (oci.core.VirtualNetworkClient, "list_remote_peering_connections"),
        "RouteTable": (oci.core.VirtualNetworkClient, "list_route_tables"),
        "SecurityList": (oci.core.VirtualNetworkClient, "list_security_lists"),
        "ServiceGateway": (oci.core.VirtualNetworkClient, "list_service_gateways"),
        "Subnet": (oci.core.VirtualNetworkClient, "list_subnets"),
        "Vcn": (oci.core.VirtualNetworkClient, "list_vcns"),
        "VirtualCircuit": (oci.core.VirtualNetworkClient, "list_virtual_circuits"),
        "Vlan": (oci.core.VirtualNetworkClient, "list_vlans"),
        # oci.data_catalog.DataCatalogClient
        "DataCatalog": (oci.data_catalog.DataCatalogClient, "list_catalogs"),
        "DataCatalogPrivateEndpoint": (oci.data_catalog.DataCatalogClient, "list_catalog_private_endpoints"),
        # oci.data_flow.DataFlowClient
        "DataFlowApplication": (oci.data_flow.DataFlowClient, "list_applications"),
        "DataFlowRun": (oci.data_flow.DataFlowClient, "list_runs"),
        "DataFlowPrivateEndpoint": (oci.data_flow.DataFlowClient, "list_private_endpoints"),
        # oci.data_integration.DataIntegrationClient
        "DISWorkspace": (oci.data_integration.DataIntegrationClient, "list_workspaces"),
        # oci.data_safe.DataSafeClient
        "DataSafeOnPremConnector": (oci.data_safe.DataSafeClient, "list_on_prem_connectors"), 
        "DataSafePrivateEndpoint": (oci.data_safe.DataSafeClient, "list_data_safe_private_endpoints"),
        # oci.data_science.DataScienceClient
        "DataScienceModel": (oci.data_science.DataScienceClient, "list_models"),
        "DataScienceNotebookSession": (oci.data_science.DataScienceClient, "list_nodebook_sessions"),
        "DataScienceProject": (oci.data_science.DataScienceClient, "list_projects"),
        # oci.database.DatabaseClient
        "AutonomousContainerDatabase": (oci.database.DatabaseClient, "list_autonomous_container_databases"),
        "AutonomousContainerDatabaseDataguardAssociation": (oci.database.DatabaseClient, "list_autonomous_container_database_dataguard_associations"),
        "AutonomousDatabase": (oci.database.DatabaseClient, "list_autonomous_databases"),
        # - "AutonomousDatabase": (oci.database.DatabaseClient, "list_autonomous_database_clones),
        "AutonomousDatabaseBackup": (oci.database.DatabaseClient, "list_autonomous_database_backups"),
        "AutonomousDatabaseDataguardAssociation": (oci.database.DatabaseClient, "list_autonomous_database_dataguard_associations"),
        "AutonomousExadataInfrastructure": (oci.database.DatabaseClient, "list_autonomous_vm_clusters"),
        "AutonomousVmCluster": (oci.database.DatabaseClient, "list_autonomous_exadata_infrastructures"), # Cloud@Customer only
        "BackupDestination": (oci.database.DatabaseClient, "list_backup_destination"),
        "CloudExadataInfrastructure": (oci.database.DatabaseClient, "list_cloud_exadata_infrastructures"),
        "CloudVmCluster": (oci.database.DatabaseClient, "list_cloud_vm_clusters"),
        "Database": (oci.database.DatabaseClient, "list_databases"),
        "DataGuardAssociation": (oci.database.DatabaseClient, "list_data_guard_associations"),
        "DbHome": (oci.database.DatabaseClient, "list_db_homes"),
        "DbNode": (oci.database.DatabaseClient, "list_db_nodes"),
        "DbSystem": (oci.database.DatabaseClient, "list_db_systems"),
        "DedicatedVmHost": (oci.core.ComputeClient, "list_dedicated_vm_hosts"),
        "DedicatedVmHostInstance": (oci.core.ComputeClient, "list_dedicated_vm_host_instances"),
        "ExadataInfrastructure": (oci.database.DatabaseClient, "list_exadata_infrastructures"), # Cloud@Customer only
        "KeyStore": (oci.database.DatabaseClient, "list_key_stores"),
        # oci.dns.DnsClient
        "Resolver": (oci.dns.DnsClient, "list_resolvers"), 
        "ResolverEndpoint": (oci.dns.DnsClient, "list_resolver_endpoints"), # TODO by resolver
        "SteeringPolicy": (oci.dns.DnsClient, "list_steering_policies"), 
        "TSIGKey": (oci.dns.DnsClient, "list_tsig_keys"), 
        "View": (oci.dns.DnsClient, "list_views"),
        "Zone": (oci.dns.DnsClient, "list_zones"),
        # oci.dts.ApplianceExportJobClient
        "DataTransferApplianceExportJob": (oci.dts.ApplianceExportJobClient, "list_appliance_export_jobs"),
        # oci.dts.TransferDeviceClient
        "DataTransferDevice": (oci.dts.TransferDeviceClient, "list_transfer_devices"),
        # oci.dts.TransferJobClient
        "DataTransferJob": (oci.dts.TransferJobClient, "list_transfer_jobs"),
        # oci.dts.TransferPackageClient
        "DataTransferPackage": (oci.dts.TransferPackageClient, "list_transfer_packages"),
        # oci.email.EmailClient
        "EmailSender": (oci.email.EmailClient, "list_senders"),
        "EmailSuppression": (oci.email.EmailClient, "list_suppressions"),
        # oci.events.EventsClient
        "EventRule": (oci.events.EventsClient, "list_rules"),
        # oci.file_storage.FileStorageClient
        "Export": (oci.file_storage.FileStorageClient, "list_exports"),
        "ExportSet": (oci.file_storage.FileStorageClient, "list_export_sets"),
        "FileSystem": (oci.file_storage.FileStorageClient ,"list_file_systems"),
        "MountTarget": (oci.file_storage.FileStorageClient ,"list_mount_targets"),
        "Snapshot": (oci.file_storage.FileStorageClient, "list_snapshots"),
        # oci.functions.FunctionsManagementClient
        "FunctionsApplication": (oci.functions.FunctionsManagementClient, "list_applications"), 
        "FunctionsFunction": (oci.functions.FunctionsManagementClient, "list_functions"),
        # oci.healthchecks.HealthChecksClient
        "HttpMonitor": (oci.healthchecks.HealthChecksClient, "list_http_monitors"),
        "PingMonitor": (oci.healthchecks.HealthChecksClient, "list_ping_monitors"),
        # oci.identity.IdentityClient
        "AvailabilityDomain": (oci.identity.IdentityClient, "list_availability_domains"),
        "DynamicGroup": (oci.identity.IdentityClient, "list_dynamic_groups"),
        "Group": (oci.identity.IdentityClient, "list_groups"),
        "IdentityProvider": (oci.identity.IdentityClient, "list_identity_providers"),
        "IdentityProviderGroup": (oci.identity.IdentityClient, "list_identity_provider_groups"),
        "IdpGroupMapping": (oci.identity.IdentityClient, "list_idp_group_mappings"),
        "NetworkSource": (oci.identity.IdentityClient, "list_network_sources"),
        "Policy": (oci.identity.IdentityClient, "list_policies"),
        "TagDefault": (oci.identity.IdentityClient, "list_tag_defaults"),
        "TagNamespace":  (oci.identity.IdentityClient, "list_tag_namespaces"),
        "User": (oci.identity.IdentityClient, "list_users"),
        "UserGroupMembership": (oci.identity.IdentityClient, "list_user_group_memberships"),
        # oci.integration.IntegrationInstanceClient
        "IntegrationInstance": (oci.integration.IntegrationInstanceClient, "list_integration_instances"),
        # oci.key_management.KmsManagementClient
        "Key": (oci.key_management.KmsManagementClient, "list_keys"), # TODO list_keys by compartment return empty results!?
        # oci.key_management.KmsVaultClient
        "Vault": (oci.key_management.KmsVaultClient, "list_vaults"),
        # oci.load_balancer.LoadBalancerClient
        "Backend": (oci.load_balancer.LoadBalancerClient, "list_backends"), # NOT USED - backends are returned in the parent Load Balancer and Backend Set response
        "BackendSet": (oci.load_balancer.LoadBalancerClient, "list_backend_sets"),  # NOT USED - backend sets are returned in the parent Load Balancer response
        "Certificate": (oci.load_balancer.LoadBalancerClient, "list_certificates"), # NOT USED - certificated are returned in the parent Load Balancer response
        "Hostname": (oci.load_balancer.LoadBalancerClient, "list_hostnames"), # NOT USED - hostnames are returned in the parent Load Balancer response
        "ListenerRule": (oci.load_balancer.LoadBalancerClient, "list_listener_rules"), # NOT USED - listener rules are returned in the parent Load Balancer response
        "LoadBalancer": (oci.load_balancer.LoadBalancerClient, "list_load_balancers"),
        "PathRouteSet": (oci.load_balancer.LoadBalancerClient, "list_path_route_sets"),  # NOT USED - path route sets are returned in the parent Load Balancer response
        "RuleSet": (oci.load_balancer.LoadBalancerClient, "list_rule_sets"),  # NOT USED - rule sets are returned in the parent Load Balancer response
        "SSLCipherSuite": (oci.load_balancer.LoadBalancerClient, "list_ssl_cipher_suites"),  # NOT USED - ssl cipher suites are returned in the parent Load Balancer response
        # oci.logging.LoggingManagementClient
        "LogGroup": (oci.logging.LoggingManagementClient, "list_log_groups"),
        "LogSavedSearch":  (oci.logging.LoggingManagementClient, "list_log_saved_searches"),
        # oci.management_agent.ManagementAgentClient
        "ManagementAgent": (oci.management_agent.ManagementAgentClient, "list_management_agents"),
        "ManagementAgentInstallKey": (oci.management_agent.ManagementAgentClient, "list_management_agent_install_keys"),
        # oci.management_dashboard.DashxApisClient
        "ManagementDashboard": (oci.management_dashboard.DashxApisClient, "list_management_dashboards"),
        # oci.monitoring.MonitoringClient
        "Alarm": (oci.monitoring.MonitoringClient, "list_alarms"),
        "AlarmStatus": (oci.monitoring.MonitoringClient, "list_alarms_status"),
        # oci.mysql.ChannelsClient
        "MySQLChannel": (oci.mysql.ChannelsClient, "list_channels"),
        # oci.mysql.DbBackupsClient
        "MySQLBackup": (oci.mysql.DbBackupsClient, "list_backups"), 
        # oci.mysql.DbSystemClient
        "MySqlDbSystem": (oci.mysql.DbSystemClient, "list_db_systems"), 
        # oci.nosql.NosqlClient
        "NoSQLTable": (oci.nosql.NosqlClient, "list_tables"),
        # oci.object_storage.ObjectStorageClient
        "Bucket": (oci.object_storage.ObjectStorageClient, "list_buckets"),
        "PreauthenticatedRequest": (oci.object_storage.ObjectStorageClient, "list_preauthenticated_requests"),
        # oci.oce.OceInstanceClient
        "OceInstance": (oci.oce.OceInstanceClient ,"list_oce_instances"),
        # oci.ocvp.EsxiHostClient
        "VmwareEsxiHost": (oci.ocvp.EsxiHostClient, "list_esxi_hosts"),
        # oci.ocvp.SddcClient
        "VmwareSddc": (oci.ocvp.SddcClient, "list_sddcs"),
        # oci.oda.OdaClient
        "OdaInstance": (oci.oda.OdaClient, "list_oda_instances"),
        # oci.ons.NotificationControlPlaneClient
        "OnsTopic": (oci.ons.NotificationControlPlaneClient, "list_topics"),
        # oci.ons.NotificationDataPlaneClient
        "OnsSubscription": (oci.ons.NotificationDataPlaneClient, "list_subscriptions"),
        # oci.opsi.OperationsInsightsClient
        "DatabaseInsight": (oci.opsi.OperationsInsightsClient, "list_database_insights"),
        "SQLPlan": (oci.opsi.OperationsInsightsClient, "list_sql_plans"), # TODO TypeError("list_sql_plans() missing 3 required positional arguments: 'database_id', 'sql_identifier', and 'plan_hash'")
        "SQLSearch": (oci.opsi.OperationsInsightsClient, "list_sql_searches"), # TODO TypeError("list_sql_searches() missing 1 required positional argument: 'sql_identifier'")
        "SQLText": (oci.opsi.OperationsInsightsClient, "list_sql_texts"), # TODO TypeError("list_sql_texts() missing 1 required positional argument: 'sql_identifier'")
        # oci.os_management.OsManagementClient
        "OsmsManagedInstanceGroup": (oci.os_management.OsManagementClient, "list_managed_instance_groups"),
        "OsmsScheduledJob": (oci.os_management.OsManagementClient, "list_scheduled_jobs"),
        "OsmsSoftwareSource": (oci.os_management.OsManagementClient, "list_software_sources"),
        # oci.resource_manager.ResourceManagerClient
        "OrmStack": (oci.resource_manager.ResourceManagerClient, "list_stacks"),
        # oci.rover.RoverClusterClient
        "RoverCluster": (oci.rover.RoverClusterClient, "list_rover_clusters"),
        # oci.rover.RoverEntitlementClient
        "RoverEntitlement": (oci.rover.RoverEntitlementClient, "list_rover_entitlements"), 
        # oci.rover.RoverNodeClient
        "RoverNode": (oci.rover.RoverNodeClient, "list_rover_nodes"),
        # oci.sch.ServiceConnectorClient
        "ServiceConnector": (oci.sch.ServiceConnectorClient, "list_service_connectors"),
        # oci.streaming.StreamAdminClient
        "ConnectHarness": (oci.streaming.StreamAdminClient, "list_connect_harnesses"),
        "Stream": (oci.streaming.StreamAdminClient, "list_streams"), 
        "StreamPool": (oci.streaming.StreamAdminClient, "list_stream_pools"),
        # oci.vault.VaultsClient
        "VaultSecret": (oci.vault.VaultsClient, "list_secrets"),
        # oci.waas.RedirectClient
        "HttpRedirect": (oci.waas.RedirectClient, "list_http_redirects"),
        # oci.waas.WaasClient
        "WaasAddressList": (oci.waas.WaasClient, "list_address_lists"),
        "WaasCertificate": (oci.waas.WaasClient, "list_certificates"),
        "WaasCustomProtectionRule": (oci.waas.WaasClient, "list_custom_protection_rules"),
        "WaasPolicy": (oci.waas.WaasClient, "list_waas_policies"),
    }

    @classmethod
    def get_supported_resources(cls):
        return sorted({resource for resource, ignore in cls.list_resource_client_methods.items()})

    @classmethod
    def get_supported_clients(cls):
        return {client for client, method in cls.list_resource_client_methods.values()}

    @classmethod
    def get_supported_client_names(cls):
        return sorted({f"{client.__module__}.{client.__name__}" for client, method in cls.list_resource_client_methods.values()})

    @classmethod
    def get_supported_list_methods(cls):
        return {(client, method) for client, method in cls.list_resource_client_methods.values()}

    @classmethod
    def get_supported_list_methods_for_client(cls, klass):
        return {method for client, method in cls.list_resource_client_methods.values() if client == klass}

    @staticmethod
    def get_all_list_methods_for_client(klass):
        # return the "list_*" methods for a class
        return {method for method in dir(klass) if method.startswith('list_')}

    def __init__(self, config, regions=None, compartments=None, include_resource_types=None, exclude_resource_types=None, timeout=DEFAULT_TIMEOUT, max_workers=DEFAULT_MAX_WORKERS):
        self.config = config
        self.timeout = timeout
        self.max_workers = max_workers
        self.include_resource_types = set(include_resource_types) if include_resource_types else None
        self.exclude_resource_types = set(exclude_resource_types) if exclude_resource_types else None

        # get regions
        self.regions, self.home_region = self.get_regions(regions)

        # get availability_domains
        self.availability_domains = self.get_availability_domains(self.regions)

        # get all compartments
        self.all_compartments = self.get_compartments()
        self.compartments = compartments

        # object storage namespace
        object_storage = oci.object_storage.ObjectStorageClient(self.config)
        self.object_storage_namespace = object_storage.get_namespace().data


    # use search to find all resources in the region
    def search_resources_for_region(self, region_name, resource_types, compartments=None):
        if len(resource_types) == 0:
            return {}

        # copy the config and update the region
        region_config = self.config.copy()  
        region_config["region"] = region_name
        
        conditions = ""
        if compartments:
            conditions = "where compartmentId == '" +  "' || compartmentId == '".join(compartments) + "'"

        query=f"""
            query 
                {",".join(resource_types)} resources 
            {conditions}
        """
        logger.debug(query)

        search = oci.resource_search.ResourceSearchClient(region_config)
        search_details = oci.resource_search.models.StructuredSearchDetails(
            type="Structured",
            query=query,
            matching_context_type=oci.resource_search.models.SearchDetails.MATCHING_CONTEXT_TYPE_NONE,
        )
        logger.info(f"requesting {resource_types} resources for {region_name}")
        results = oci.pagination.list_call_get_all_results(search.search_resources, search_details).data
        return results

    def get_compartments(self):
        identity = oci.identity.IdentityClient(self.config)
        return oci.pagination.list_call_get_all_results(identity.list_compartments, self.config["tenancy"], compartment_id_in_subtree=True).data

    def get_availability_domains(self, regions):
        tasks = dict()
        for region in regions:
            tasks[region.region_name] = [("AvailabilityDomain", self.config["tenancy"], None)]
        results = self.get_resources(tasks)
        for region in results:
            results[region] = [ad.name for ad in results[region]["AvailabilityDomain"]]
        return results

    def get_regions(self, region_filter=None):
        identity = oci.identity.IdentityClient(self.config)
        all_regions = identity.list_region_subscriptions(self.config["tenancy"]).data
        active_regions = [region for region in all_regions if region.status == "READY" and (region_filter == None or region.region_name in region_filter)]
        home_region = [region for region in all_regions if region.is_home_region]
        return active_regions, home_region[0].region_name

    def list_seachable_resource_types_for_region(self, region):
        region_config = self.config.copy()
        region_config["region"] = region
        search = oci.resource_search.ResourceSearchClient(region_config)
        all_searchable_resource_types = [resource_type.name for resource_type in oci.pagination.list_call_get_all_results(search.list_resource_types).data]
        return all_searchable_resource_types

    # fetch supported resource type for each region
    def searchable_resource_types_by_region(self, regions):
        futures_list = dict()
        results = dict()

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            for region in regions:
                futures = executor.submit(self.list_seachable_resource_types_for_region, region.region_name)
                futures_list.update({region.region_name:futures})

            for region in futures_list:
                try:
                    result = futures_list[region].result(timeout=self.timeout)
                    results.update({region:result})
                except Exception as e:
                    logger.error(("searchable_resource_types_by_region()", region, e))

        return results

    def get_searchable_resource_types(self):
        # list of all supported resource types that can be queried through search
        searchable_resource_types = self.searchable_resource_types_by_region(self.regions)
        ignore_resource_types = [
            "Compartment", "ConsoleHistory", "OrmJob", "OsmsSoftwareSource"
        ]
        search_resource_types = dict()
        for region in searchable_resource_types:
            supported_searchable_resource_types = [resource for resource in self.list_resource_client_methods]
            search_resource_types[region] = set(supported_searchable_resource_types).intersection(set(searchable_resource_types[region]))
            if self.include_resource_types:
                search_resource_types[region] = search_resource_types[region].intersection(self.include_resource_types)
            if self.exclude_resource_types:
                # remove excluded resource types
                search_resource_types[region] = search_resource_types[region] - self.exclude_resource_types
            if region != self.home_region:
                # remove IAM resources
                search_resource_types[region] = search_resource_types[region] - {resource for resource in self.list_resource_client_methods if self.list_resource_client_methods[resource][0] == oci.identity.IdentityClient}
        return search_resource_types

    # fetch resources for all regions in parallel
    def search_resources_for_all_regions(self, regions, resource_types_by_region, compartments=None):
        futures_list = dict()
        results = dict()

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            for region in regions:
                futures = executor.submit(self.search_resources_for_region, region.region_name, resource_types_by_region[region.region_name], compartments)
                futures_list.update({region.region_name:futures})

            logger.info(f"submitted {len(futures_list)} search requests")
            processed_count = 0

            for region in futures_list:
                try:
                    result = futures_list[region].result(timeout=self.timeout)
                    results.update({region:result})
                    processed_count += 1
                except Exception as e:
                    logger.error(("search_resources_for_all_regions()", region, e))
                    
            logger.info(f"processed {processed_count} search responses")

        return results

    # generic list resouces methods
    # - `klass` the API Client Class for the resource type
    # - `method_name` - resource specific the "list" resources menthod name
    # - `region` - th eregion name to override in the config file
    # - `compartment_id` - the compartment ocid to list resource in
    # - `**kwargs` - any extra ags to pass to the list method  
    def list_resources(self, klass, method_name, region, back_off=0.1, **kwargs):
        try: 
            region_config = self.config.copy()
            region_config["region"] = region
            if klass == oci.key_management.KmsManagementClient:
                client = klass(region_config, f"https://iaas.{region}.oraclecloud.com")
            else:
                client = klass(region_config)
            client.base_client.timeout = (self.timeout, self.timeout)  # set connect timeout, read timeout
            result = getattr(client, method_name)(**kwargs)
            return(result.data)
        except oci.exceptions.ServiceError as e:
            if e.code == "TooManyRequests" and back_off < 5:
                # exponential back off and retry
                logger.warn(f"Too Many Requests for {method_name}, retry in {back_off} seconds")
                time.sleep(back_off)
                return self.list_resources(klass, method_name, region, back_off=back_off*2, **kwargs)

    def submit_list_resource_worker_requests(self, executor, regional_resources_compartments):

        futures_list = dict()  # {(region, resource_type, compartment, sub_query) -> future}

        for region in regional_resources_compartments:
            for item in regional_resources_compartments[region]:
                resource_type = item[0]
                compartment_id = item[1]
                if resource_type in self.list_resource_client_methods:
                    klass, method_name = self.list_resource_client_methods[resource_type]
                    # the majority of the list methods only need the compartment
                    # id, methods that have additional required attributes are 
                    # handled specifically below: 
                    if method_name == "list_alert_rules":
                        # list alert rules by budget
                        budget_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, budget_id=budget_id)
                        futures_list.update({(region, resource_type, compartment_id, budget_id):future})
                    elif method_name == "list_autonomous_container_database_dataguard_associations":
                        autonomous_container_database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, adb_id=autonomous_container_database_id)
                        futures_list.update({(region, resource_type, compartment_id, autonomous_container_database_id):future})
                    elif method_name in ["list_autonomous_database_backups", "list_autonomous_database_dataguard_associations"]:
                        # TODO ? list_autonomous_database_backups can also be queried by compartment id
                        # which might get backups of ADBs that have been terminated ? TBC
                        autonomous_database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, autonomous_database_id=autonomous_database_id)
                        futures_list.update({(region, resource_type, compartment_id, autonomous_database_id):future})
                    elif method_name == "list_auto_scaling_policies":
                        auto_scaling_configuration_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, auto_scaling_configuration_id=auto_scaling_configuration_id)
                        futures_list.update({(region, resource_type, compartment_id, auto_scaling_configuration_id):future})
                    elif method_name == "list_backends":
                        load_balancer_id, backend_set_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id, backend_set_name=backend_set_name)
                        futures_list.update({(region, resource_type, compartment_id, (load_balancer_id, backend_set_name)):future})
                    elif method_name == "list_backend_sets":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_buckets":
                        namespace_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, namespace_name=namespace_name)
                        futures_list.update({(region, resource_type, compartment_id, namespace_name):future})
                    elif resource_type == "Certificate" and method_name == "list_certificates":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_dedicated_vm_host_instances":
                        dedicated_vm_host_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, dedicated_vm_host_id=dedicated_vm_host_id)
                        futures_list.update({(region, resource_type, compartment_id, dedicated_vm_host_id):future})
                    elif method_name == "list_db_nodes":
                        db_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, db_system_id=db_system_id)
                        futures_list.update({(region, resource_type, compartment_id, db_system_id):future})
                    elif method_name == "list_exports":
                        export_set_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, export_set_id=export_set_id)
                        futures_list.update({(region, resource_type, compartment_id, export_set_id):future})
                    elif method_name == "list_functions":
                        application_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, application_id=application_id)
                        futures_list.update({(region, resource_type, compartment_id, application_id):future})
                    elif method_name == "list_hostnames":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_identity_providers":
                        protocol = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, protocol=protocol, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, protocol):future})
                    elif method_name == "list_identity_provider_groups":
                        identity_provider_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, identity_provider_id=identity_provider_id)
                        futures_list.update({(region, resource_type, compartment_id, identity_provider_id):future})
                    elif method_name == "list_idp_group_mappings":
                        identity_provider_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, identity_provider_id=identity_provider_id)
                        futures_list.update({(region, resource_type, compartment_id, identity_provider_id):future})
                    elif method_name == "list_ip_sec_connection_tunnels":
                        ipsec_connection_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, ipsc_id=ipsec_connection_id)
                        futures_list.update({(region, resource_type, compartment_id, ipsec_connection_id):future})
                    elif method_name == "list_listener_rules":
                        load_balancer_id, listener_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, load_balancer_id=load_balancer_id, listener_name=listener_name)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_network_security_group_security_rules":
                        network_security_group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_security_group_id=network_security_group_id)
                        futures_list.update({(region, resource_type, compartment_id, network_security_group_id):future})
                    elif method_name == "list_network_security_group_vnics":
                        network_security_group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_security_group_id=network_security_group_id)
                        futures_list.update({(region, resource_type, compartment_id, network_security_group_id):future})
                    elif method_name == "list_path_route_sets":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_preauthenticated_requests":
                        bucket_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, namespace_name=self.object_storage_namespace, bucket_name=bucket_name)
                        futures_list.update({(region, resource_type, compartment_id, bucket_name):future})
                    elif method_name == "list_private_ips":
                        subnet_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, subnet_id=subnet_id)
                        futures_list.update({(region, resource_type, compartment_id, subnet_id):future})
                    elif method_name == "list_public_ips":
                        # handle the varient cases to list regional and AD specific public ips
                        availability_domain = item[2]
                        for availability_domain in self.availability_domains[region]:
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, scope="AVAILABILITY_DOMAIN", availability_domain=availability_domain)
                            futures_list.update({(region, resource_type, availability_domain):future})
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, scope="REGION")
                        futures_list.update({(region, resource_type, compartment_id, "REGION"):future})
                    elif method_name == "list_rule_sets":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_snapshots":
                        file_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, file_system_id=file_system_id)
                        futures_list.update({(region, resource_type, compartment_id, file_system_id):future})
                    elif method_name == "list_source_applications":
                        source_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, source_id=source_id)
                        futures_list.update({(region, resource_type, compartment_id, source_id):future})
                    elif method_name == "list_ssl_cipher_suites":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif method_name == "list_user_group_memberships":
                        group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, group_id=group_id)
                        futures_list.update({(region, resource_type, compartment_id, group_id):future})
                    elif method_name in ["list_instances", "list_boot_volumes", "list_boot_volume_attachments", "list_file_systems", "list_mount_targets", "list_export_sets"]:
                        # need to provide the availability domain when listing instances,
                        # boot volumes, file systems, ... 
                        availability_domain = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, availability_domain=availability_domain)
                        futures_list.update({(region, resource_type, compartment_id, availability_domain):future})
                    else:
                        # all other resources
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, None):future})
                else:
                    logger.warn(f"unsupported resource type {resource_type}")

        logger.info(f"submitted {len(futures_list)} list resources requests")
        return futures_list

    def process_list_resource_worker_reponses(self, futures_list):

        results = dict()       # {region -> {resource_type -> [resource]}}

        failed_requests = []
        processed_count = 0

        for future in futures_list:
            try:
                result = futures_list[future].result(timeout=self.timeout)
                if result:
                    region = future[0]
                    resource_type = future[1]
                    if region not in results:
                        results[region] = {}
                    if resource_type not in results[region]:
                        results[region][resource_type] = []

                    if resource_type == "AmsSourceApplication":
                        # map Source Applications into extended verison a unique id
                        new_result = [ExtendedSourceApplicationSummary(f"{future[3]}/{application.type}/{application.name}", application) for application in result]
                        result = new_result
                    if resource_type == "AutoScalingPolicy":
                        # map Auto Scaling Policy into extended verison parent id
                        new_result =  [ExtendedAutoScalingPolicySummary(future[3],policy) for policy in result]
                        result = new_result
                    elif resource_type == "NetworkSecurityGroupSecurityRule":
                        # map Security Rules into extended verison with parent id
                        new_result = [ExtendedSecurityRule(future[3],rule) for rule in result]
                        result = new_result
                    elif resource_type == "NetworkSecurityGroupVnic":
                        # map NetworkSecurityGroupVnic into extended verison with parent id
                        new_result = [ExtendedNetworkSecurityGroupVnic(future[3],vnic) for vnic in result]
                        result = new_result
                    elif resource_type == "PreauthenticatedRequest":
                        compartment_id = future[2]
                        bucket_name = future[3]
                        new_result = [ExtendedPreauthenticatedRequestSummary(compartment_id, bucket_name, preauth) for preauth in result]
                        result = new_result
                    elif resource_type in [
                        "ApiDeployment", "ApiGateway",
                        "CloudGuardDetectorRecipe", "CloudGuardManagedList", "CloudGuardResponderRecipe", "CloudGuardTarget", 
                        "DatabaseInsight",
                        "DataFlowPrivateEndpoint", 
                        "LogSavedSearch",
                        "NoSQLTable",
                        "RoverCluster", "RoverNode",
                    ]:
                        # handle responses with collecion of items
                        result = result.items

                    results[region][resource_type].extend(result)

                processed_count += 1
                if processed_count % 100 == 0:
                    percent = int(processed_count / len(futures_list) * 100) 
                    logger.debug(f"processed {processed_count} list resource responses {percent}% complete")

            except AttributeError as ae:
                logger.error(("get_resources()", future, ae))
            except oci.exceptions.ConnectTimeout as ct:
                logger.warn(("get_resources()", future, ct))
                failed_requests.append(future)
                # TODO retry
            except oci.exceptions.RequestException as re:
                logger.warn(("get_resources()", future, re))
                failed_requests.append(future)
                # TODO retry
            except TimeoutError as te:
                logger.error(("get_resources()", future, te, self.timeout))
                failed_requests.append(future)
                # TODO retry
            except Exception as e:
                logger.error(("get_resources()", future, e))

        logger.info(f"processed {processed_count} list resources responses")

        return results, failed_requests

    def get_resources(self, regional_resources_compartments):

        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures_list = self.submit_list_resource_worker_requests(executor, regional_resources_compartments)
            results, failed_requests = self.process_list_resource_worker_reponses(futures_list)

        # TODO - expermimental retry, could cause infinate loop
        if len(failed_requests) > 0:
            retry_tasks = dict()  # region -> (resource_type, compartment_id, arg3)
            for fr in failed_requests:
                if fr[0] not in retry_tasks:
                    retry_tasks[fr[0]] = []
                retry_tasks[fr[0]].append((fr[1], fr[2], fr[3])) 

            logger.warn(f"Retrying {len(failed_requests)} failed requests")
            retry_results = self.get_resources(retry_tasks)
            for region in retry_results:
                for resource_type in region:
                    results[region][resource_type].extend(retry_results[region][resource_type])
        
        return results


    def get_all_resources(self):
        # parallel search query for resources across all regions
        search_resource_types = self.get_searchable_resource_types()
        resources = self.search_resources_for_all_regions(self.regions, search_resource_types, self.compartments)
        
        # resource details are fetched per compartment, to efficiently query the api
        # we'll generate a set of compartments that have the resources to be fetched 
        # i.e. for each region generate a set of (resource_type, compartment_id, 
        # availability_domain) tuples 
        resource_requests = dict()
        for region in resources:
            regional_resource_requests = set()

            if self.include_resource_types == None or "Image" in self.include_resource_types:
                # always add search for Image in the root compartment to ensure we get the default images that are
                # not inlcuded in the search results
                regional_resource_requests.add(("Image", self.config["tenancy"], None))

            for resource in resources[region]:
                # handle list resource query varient cases
                if resource.resource_type in ["BootVolume", "FileSystem", "Instance", "MountTarget"]:
                    # list by avaiability domain
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, resource.availability_domain))
                elif resource.resource_type == "Bucket":
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, self.object_storage_namespace))
                elif resource.resource_type == "IdentityProvider":
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, "SAML2"))
                elif resource.resource_type not in ["PrivateIp"]:
                    # skip private ips, fetch private ips per subnet instead (below)
                    # for all other resources
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, None))

                # handle parent/child resources
                if resource.resource_type == "AmsSource":
                    # get Applications for Ams Source
                    regional_resource_requests.add(("AmsSourceApplication", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "AutonomousContainerDatabase":
                    # get Dataguard Association for Autonomous Container Database
                    regional_resource_requests.add(("AutonomousContainerDatabaseDataguardAssociation", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "AutonomousDatabase":
                    # get Backup for Autonomous Database
                    regional_resource_requests.add(("AutonomousDatabaseBackup", resource.compartment_id, resource.identifier))
                    # get Dataguard Association by Autonomous Database
                    regional_resource_requests.add(("AutonomousDatabaseDataguardAssociation", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "AutoScalingConfiguration" and (self.include_resource_types == None or "AutoScalingPolicy" in self.include_resource_types):
                    # get Auto Scaling Policy by Auto Scaling Configuration
                    regional_resource_requests.add(("AutoScalingPolicy", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Bucket" and (self.include_resource_types == None or "PreauthenticatedRequest" in self.include_resource_types):
                    # get Preauthenticated Requests for Bucket
                    regional_resource_requests.add(("PreauthenticatedRequest", resource.compartment_id, resource.display_name))
                elif resource.resource_type == "Budget":
                    # get Alert Rules for Budget
                    regional_resource_requests.add(("AlertRule", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "DbSystem":
                    # get DB Nodes for DB Systems
                    if self.include_resource_types == None or "DbNode" in self.include_resource_types:
                        regional_resource_requests.add(("DbNode", resource.compartment_id, resource.identifier))
                    # get Key Stores
                    if self.include_resource_types == None or "KeyStore" in self.include_resource_types:
                        regional_resource_requests.add(("KeyStore", resource.compartment_id, None))
                elif resource.resource_type == "DedicatedVmHost" and (self.include_resource_types == None or "DedicatedVmHostInstance" in self.include_resource_types):
                    # get VM Instances for Dedicated Hosts
                    regional_resource_requests.add(("DedicatedVmHostInstance", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Drg" and (self.include_resource_types == None or "DrgAttachment" in self.include_resource_types):
                    # get Drg Attachments for Drgs
                    regional_resource_requests.add(("DrgAttachment", resource.compartment_id, None))
                elif resource.resource_type == "ExportSet" and (self.include_resource_types == None or "Export" in self.include_resource_types):
                    regional_resource_requests.add(("Export", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Group" and (self.include_resource_types == None or "UserGroupMembership" in self.include_resource_types):
                    # get Users for Groups
                    regional_resource_requests.add(("UserGroupMembership", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "IdentityProvider":
                    if self.include_resource_types == None or "IdentityProviderGroup" in self.include_resource_types:
                        # get Identity Provider Groups for Identity Provider
                        regional_resource_requests.add(("IdentityProviderGroup", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "IdpGroupMapping" in self.include_resource_types:
                        # get Identity Provider Group Mappings for Identity Provider
                        regional_resource_requests.add(("IdpGroupMapping", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Instance":
                    # get Volume Attachments and Vnic Attachments for Instances
                    if self.include_resource_types == None or "BootVolumeAttachment" in self.include_resource_types:
                        regional_resource_requests.add(("BootVolumeAttachment", resource.compartment_id, resource.availability_domain))
                    if self.include_resource_types == None or "VnicAttachment" in self.include_resource_types:
                        regional_resource_requests.add(("VnicAttachment", resource.compartment_id, None))
                    if self.include_resource_types == None or "VolumeAttachment" in self.include_resource_types:
                        regional_resource_requests.add(("VolumeAttachment", resource.compartment_id, None))
                elif resource.resource_type == "FunctionsApplication" and (self.include_resource_types == None or "FunctionsFunction" in self.include_resource_types):
                    # get functions for application
                    regional_resource_requests.add(("FunctionsFunction", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "IpSecConnection" and (self.include_resource_types == None or "IpSecConnectionTunnel" in self.include_resource_types):
                    # get tunnels for ipsec connection
                    regional_resource_requests.add(("IpSecConnectionTunnel", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "LoadBalancer":
                    pass
                    # No need to fetch child resource are they are included in the load balancer response
                    # if self.include_resource_types == None or "BackendSet" in self.include_resource_types:
                    #     regional_resource_requests.add(("BackendSet", resource.compartment_id, resource.identifier))
                    # if self.include_resource_types == None or "Certificate" in self.include_resource_types:
                    #     regional_resource_requests.add(("Certificate", resource.compartment_id, resource.identifier))
                    # if self.include_resource_types == None or "Hostname" in self.include_resource_types:
                    #     regional_resource_requests.add(("Hostname", resource.compartment_id, resource.identifier))
                    # if self.include_resource_types == None or "PathRouteSet" in self.include_resource_types:
                    #     regional_resource_requests.add(("PathRouteSet", resource.compartment_id, resource.identifier))
                    # if self.include_resource_types == None or "RuleSet" in self.include_resource_types:
                    #     regional_resource_requests.add(("RuleSet", resource.compartment_id, resource.identifier))
                    # if self.include_resource_types == None or "SSLCipherSuite" in self.include_resource_types:
                    #     regional_resource_requests.add(("SSLCipherSuite", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "NetworkSecurityGroup" and (self.include_resource_types == None or "NetworkSecurityGroupSecurityRule" in self.include_resource_types):
                    # get security rules for network secuity group 
                    regional_resource_requests.add(("NetworkSecurityGroupSecurityRule", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "NetworkSecurityGroup" and (self.include_resource_types == None or "NetworkSecurityGroupVnic" in self.include_resource_types):
                    # get vnics for network secuity group 
                    regional_resource_requests.add(("NetworkSecurityGroupVnic", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Subnet" and (self.include_resource_types == None or "PrivateIp" in self.include_resource_types):
                    # get private IPs for each Subnet
                    regional_resource_requests.add(("PrivateIp", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Vcn" and (self.include_resource_types == None or "DrgAttachment" in self.include_resource_types):
                    # get Drg Attachments for Vcns
                    regional_resource_requests.add(("DrgAttachment", resource.compartment_id, None))

            resource_requests.update({region:regional_resource_requests})

        # for each resource not supported by search, perform a brute force iteration
        # over all compartments in all regions - this can take a long time for 
        # tenancies with lots of compartments so we limit to only fetch resources
        # types that are specifically requested
        for region in self.regions:
            brute_force_requests = set()

            resource_types = {
                "AlarmStatus",
                "Cluster", "NodePool", # OKE
                "DataFlowPrivateEndpoint", # Data Flow 
                "DataSafeOnPremConnector", # Data Safe
                "Resolver", "SteeringPolicy", "TSIGKey", "View", "Zone", # DNS
                "EmailSuppression", # Email
                "ExportSet", # File Service
                "LogGroup", "LogSavedSearch", # Loging
                "ManagementDashboard", # TODO test
                "MySqlDbSystem", "MySQLChannel", "MySQLBackup", # MySQL
                "DatabaseInsight", "SQLPlan", "SQLSearch", "SQLText", # OperationalInsight
                "RoverCluster", "RoverEntitlement", "RoverNode", # Roving Edge
                "StreamPool", # Streams
            }

            if region.region_name == self.home_region:
                resource_types.update({
                 "DynamicGroup", # IAM
                })

            # only fetch resource type if explictly included
            resource_types = resource_types.intersection(set(self.include_resource_types)) if self.include_resource_types else []

            logger.info(f"Compartments: {self.compartments}")
            for compartment in self.compartments if self.compartments else self.all_compartments:
                for resource_type in resource_types:
                    brute_force_requests.add((resource_type, compartment.compartment_id, None))
                    #brute_force_requests.add((resource_type, compartment.compartment_id if isinstance(compartment, dict) else compartment, None))

            # TODO temp fix for region missing 
            if region.region_name not in resource_requests:
                resource_requests[region.region_name] = {}

            resource_requests[region.region_name].update(brute_force_requests)

        resources_by_region = self.get_resources(resource_requests)
        return resources_by_region