# Copyright (c) 2020, 2023, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import oci
import time

from common.okitLogging import getLogger
from concurrent.futures import ThreadPoolExecutor

from .models import ExtendedTagSummary, ExtendedDrgRouteDistributionStatement, ExtendedDrgRouteRule, ExtendedAutoScalingPolicySummary
from .models import ExtendedDbNodeSummary, ExtendedNetworkSecurityGroupVnic, ExtendedPreauthenticatedRequestSummary, ExtendedSecurityRule
from .models import ExtendedExportSummary, ExtendedMySQLBackup, ExtendedMySQLBackupSummary
from .models import ExtendedVirtualCircuitBandwidthShape, ExtendedNoSQLIndexSummary
from .models import ExtendedRRSet
from .models import ExtendedAvailablePluginSummary, ExtendedInstanceAgentPluginSummary

DEFAULT_MAX_WORKERS = 32
DEFAULT_TIMEOUT = 120

logger = getLogger()

dns_record_types = ["A", "AAAA", "CNAME", "MX", "NS", "PTR", "SOA", "SRV", "TXT", "CAA"]
agent_plugin_os_versions = [
    ("Canonical Ubuntu", "18.04"), ("Canonical Ubuntu", "20.04"), ("Canonical Ubuntu", "22.04"),
    ("CentOS", "7"), ("CentOS", "8 Stream"),
    ("Oracle Autonomous Linux", "7.9"),
    ("Oracle Linux", "6.10"), ("Oracle Linux", "7.9"), ("Oracle Linux", "8"), ("Oracle Linux", "9"),
    ("Oracle Linux Cloud Developer", "8"),
    ("Windows", "2012ServerR2"),  ("Windows", "2016Server"), ("Windows", "2019Server"), ("Windows", "2022Server"),
]

class OciResourceDiscoveryClient(object):

    # map suppoted resources types to the OCI SDK client type and its "get"
    # methods. Creates a map of:
    #     { resource_name -> (Client, list_method) }
    get_resource_client_methods = {
        # oci.apigateway.UsagePlansClient
        "ApiGatewayUsagePlanDetails": (oci.apigateway.UsagePlansClient, "get_usage_plan"), # used to get full details
        # oci.autoscaling.AutoScalingClient
        "AutoScalingConfigurationDetails": (oci.autoscaling.AutoScalingClient, "get_auto_scaling_configuration"),
        # oci.bastion.BastionClient
        "BastionDetails": (oci.bastion.BastionClient, "get_bastion"), # used to get full details
        # oci.container_engine.ContainerEngineClient
        "ClusterDetails": (oci.container_engine.ContainerEngineClient, "get_cluster"), # used to get full details
        "NodePoolDetails": (oci.container_engine.ContainerEngineClient, "get_node_pool"), # used to get full details
        "NodePoolOptions": (oci.container_engine.ContainerEngineClient, "get_node_pool_options"), # used special case to get the supported images
        # oci.core.BlockstorageClient
        "VolumeBackupPolicyAssignment": (oci.core.BlockstorageClient, "get_volume_backup_policy_asset_assignment"),
        # oci.core.ComputeClient
        "Image": (oci.core.ComputeClient, "get_image"),  # used to get details of removed (hidden) images that the not returned from list_images
        # oci.core.ComputeManagementClient
        "InstanceConfigurationDetails": (oci.core.ComputeManagementClient, "get_instance_configuration"), # used to get full details
        "InstancePoolDetails": (oci.core.ComputeManagementClient, "get_instance_pool"), # used to get full details
        # oci.core.VirtualNetworkClient
        "Vnic": (oci.core.VirtualNetworkClient, "get_vnic"), # special case as there is no list_vnics method
        # oci.data_flow.DataFlowClient
        "DataFlowApplicationDetails": (oci.data_flow.DataFlowClient, "get_application"), # get full deatils
        "DataFlowRunDetails": (oci.data_flow.DataFlowClient, "get_run"), # get full details
        # oci.database.DatabaseClient
        "ExadataIormConfig": (oci.database.DatabaseClient, "get_cloud_vm_cluster_iorm_config"),
        # oci.file_storage.FileStorageClient
        "ExportSetDetails": (oci.file_storage.FileStorageClient, "get_export_set"),
        # oci.mysql.DbSystemClient
        "MySQLDbSystemDetails": (oci.mysql.DbSystemClient, "get_db_system"), # used to get full details of the result as list_db_systems does not include all attributes
        "MySQLHeatwaveCluster": (oci.mysql.DbSystemClient, "get_heat_wave_cluster"), # get heavewave cluster details for a MySQLDbSystem
        # oci.mysql.MysqlaasClient
        "MySQLConfiguration": (oci.mysql.MysqlaasClient, "get_configuration"), # used to get details of the Default configurations
        # oci.network_firewall.NetworkFirewallClient
        "NetworkFirewallDetails": (oci.network_firewall.NetworkFirewallClient, "get_network_firewall"), # get full details
        "NetworkFirewallPolicyDetails": (oci.network_firewall.NetworkFirewallClient, "get_network_firewall_policy"), # get full details
        # oci.nosql.NosqlClient
        "NoSQLTableDetails": (oci.nosql.NosqlClient, "get_table"), # get full details
        "NoSQLIndexDetails": (oci.nosql.NosqlClient, "get_index"), # get full details
        # oci.os_management.OsManagementClient
        "OsmsManagedInstance": (oci.os_management.OsManagementClient, "get_managed_instance"),
        # oci.vault.VaultsClient
        "VaultSecretDetails": (oci.vault.VaultsClient, "get_secret"), # get full details as list_secrets does not include all attributes
    }

    # map suppoted resources types to the OCI SDK client type and its "list"
    # method. Creates a map of:
    #     { resource_name -> (Client, list_method) }
    list_resource_client_methods = {
        # oci.adm.ApplicationDependencyManagementClient
        "AdmKnowledgeBase": (oci.adm.ApplicationDependencyManagementClient, "list_knowledge_bases"),
        "AdmVulnerabilityAudit": (oci.adm.ApplicationDependencyManagementClient, "list_vulnerability_audits"),
        # oci.ai_anomaly_detection.AnomalyDetectionClient
        "AiAnomalyDetectionPvtEndpoint": (oci.ai_anomaly_detection.AnomalyDetectionClient, "list_ai_private_endpoints"),
        "AiAnomalyDetectionDataAsset": (oci.ai_anomaly_detection.AnomalyDetectionClient, "list_data_assets"),
        "AiAnomalyDetectionModel": (oci.ai_anomaly_detection.AnomalyDetectionClient, "list_models"),
        "AiAnomalyDetectionProject": (oci.ai_anomaly_detection.AnomalyDetectionClient, "list_projects"),
        # oci.ai_document.AIServiceDocumentClient
        # "AiDocumentModel": (oci.ai_document.AIServiceDocumentClient, ""), # TODO not documented
        # "AiDocumentProject": (oci.ai_document.AIServiceDocumentClient, ""), # TODO not documented
        # oci.ai_language.AIServiceLanguageClient
        "AiLanguageEndpoint": (oci.ai_language.AIServiceLanguageClient, "list_endpoints"),
        "AiLanguageModel": (oci.ai_language.AIServiceLanguageClient, "list_models"),
        "AiLanguageProject": (oci.ai_language.AIServiceLanguageClient, "list_projects"),
        # oci.ai_vision.AIServiceVisionClient
        "AiVisionModel": (oci.ai_vision.AIServiceVisionClient, "list_models"),
        "AiVisionProject": (oci.ai_vision.AIServiceVisionClient, "list_projects"),
        # oci.analytics.AnalyticsClient
        "AnalyticsInstance": (oci.analytics.AnalyticsClient, "list_analytics_instances"),
        # oci.apigateway.ApiGatewayClient
        "ApiGatewayApi": (oci.apigateway.ApiGatewayClient, "list_apis"),
        "ApiGatewayCertificate": (oci.apigateway.ApiGatewayClient, "list_certificates"),
        "ApiGatewaySdk": (oci.apigateway.ApiGatewayClient, "list_sdks"),
        # oci.apigateway.DeploymentClient
        "ApiDeployment": (oci.apigateway.DeploymentClient, "list_deployments"),
        # oci.apigateway.GatewayClient
        "ApiGateway": (oci.apigateway.GatewayClient, "list_gateways"),
        # oci.apigateway.SubscribersClient
        "ApiGatewaySubscriber": (oci.apigateway.SubscribersClient, "list_subscribers"),
        #  oci.apigateway.UsagePlansClient
        "ApiGatewayUsagePlan": ( oci.apigateway.UsagePlansClient, "list_usage_plans"),
        # oci.apm_control_plane.ApmDomainClient
        "ApmDomain": ( oci.apm_control_plane.ApmDomainClient, "list_apm_domains"),
        # oci.artifacts.ArtifactsClient
        "ContainerImage": (oci.artifacts.ArtifactsClient, "list_container_images"),
        "ContainerRepo": (oci.artifacts.ArtifactsClient, "list_container_repositories"),
        # - "?": (oci.artifacts.ArtifactsClient, "list_generic_artifacts"), # TODO
        # - "?": (oci.artifacts.ArtifactsClient, "list_repositories"), # TODO
        # oci.autoscaling.AutoScalingClient
        "AutoScalingConfiguration": (oci.autoscaling.AutoScalingClient, "list_auto_scaling_configurations"),
        "AutoScalingPolicy": (oci.autoscaling.AutoScalingClient, "list_auto_scaling_policies"),
        # oci.bastion.BastionClient
        "Bastion": (oci.bastion.BastionClient, "list_bastions"),
        "BastionSession": (oci.bastion.BastionClient, "list_sessions"),
        # oci.bds.BdsClient
        "BigDataAutoScalingConfiguration": (oci.bds.BdsClient, "list_auto_scaling_configurations"),
        "BigDataService": (oci.bds.BdsClient, "list_bds_instances"),
        "BigDataServiceApiKey": (oci.bds.BdsClient, "list_bds_api_keys"),
        "BigDataServiceMetastoreConfig": (oci.bds.BdsClient, "list_bds_metastore_configurations"),
        # oci.blockchain.BlockchainPlatformClient
        "BlockchainPlatform": (oci.blockchain.BlockchainPlatformClient, "list_blockchain_platforms"),  # TODO not tested
        "BlockchainOsn": (oci.blockchain.BlockchainPlatformClient, "list_osns"), # TODO by blockchain_platform - check resource name
        "BlockchainPeer": (oci.blockchain.BlockchainPlatformClient, "list_peers"), # TODO by blockchain_platform - check resource name
        # oci.budget.BudgetClient
        "Budget": (oci.budget.BudgetClient, "list_budgets"),
        "AlertRule": (oci.budget.BudgetClient, "list_alert_rules"),
        # - oci.certificates.CertificatesClient # TODO
        # - "?": (oci.certificates.CertificatesClient, "list_certificate_authority_bundle_versions"),
        # - "?": (oci.certificates.CertificatesClient, "list_certificate_bundle_versions"),
        # oci.certificates_management.CertificatesManagementClient
        "CaBundle": (oci.certificates_management.CertificatesManagementClient, "list_ca_bundles"),
        "CaBundleAssociation": (oci.certificates_management.CertificatesManagementClient, "list_associations"), #TODO all associations use the same method?
        "Certificate": (oci.certificates_management.CertificatesManagementClient, "list_certificates"),
        "CertificateAssociation": (oci.certificates_management.CertificatesManagementClient, "list_associations"), # TODO
        "CertificateVersion": (oci.certificates_management.CertificatesManagementClient, "list_certificate_versions"),
        "CertificateAuthority": (oci.certificates_management.CertificatesManagementClient, "list_certificate_authorities"),
        "CertificateAuthorityVersion": (oci.certificates_management.CertificatesManagementClient, "list_certificate_authority_versions"),
        "CertificateAuthorityAssociation": (oci.certificates_management.CertificatesManagementClient, "list_associations"), # TODO
        # oci.cloud_bridge.DiscoveryClient
        "OcbAssetSourceConnection": (oci.cloud_bridge.DiscoveryClient, "list_asset_source_connections"),
        "OcbAssetSource": (oci.cloud_bridge.DiscoveryClient, "list_asset_sources"),
        "OcbDiscoverySchedule": (oci.cloud_bridge.DiscoveryClient, "list_discovery_schedules"),
        # oci.cloud_bridge.InventoryClient
        "OcbInventoryAsset": (oci.cloud_bridge.InventoryClient, "list_assets"),
        # "OcbInventoryRelation": (oci.cloud_bridge.InventoryClient, "list_relationships"), # TODO new
        # "OcbOracleDbAsset": (oci.cloud_bridge.InventoryClient, "list_assets"), # TODO remove? subset of OcbInventoryAsset
        # "OcbVmAsset": (oci.cloud_bridge.InventoryClient, "list_assets"), # TODO remove? subset of OcbInventoryAsset
        # "OcbVmwareVmAsset": (oci.cloud_bridge.InventoryClient, "list_assets"), # TODO remove? subset of OcbInventoryAsset
        # "": (oci.cloud_bridge.InventoryClient, "list_historical_metrics"), # TODO
        "OcbInventory": (oci.cloud_bridge.InventoryClient, "list_inventories"),
        # oci.cloud_bridge.OcbAgentSvcClient
        "OcbAgentDependency": (oci.cloud_bridge.OcbAgentSvcClient, "list_agent_dependencies"),
        "OcbAgent": (oci.cloud_bridge.OcbAgentSvcClient, "list_agents"),
        # "OcbApplianceImage": (oci.cloud_bridge.OcbAgentSvcClient, "list_appliance_images"), # TODO
        "OcbEnvironment": (oci.cloud_bridge.OcbAgentSvcClient, "list_environments"),
        # oci.cloud_guard.CloudGuardClient
        "CloudGuardDetectorRecipe": (oci.cloud_guard.CloudGuardClient, "list_detector_recipes"),
        "CloudGuardManagedList": (oci.cloud_guard.CloudGuardClient, "list_managed_lists"),
        "CloudGuardResponderRecipe": (oci.cloud_guard.CloudGuardClient, "list_responder_recipes"),
        "CloudGuardTarget": (oci.cloud_guard.CloudGuardClient, "list_targets"),
        "SecurityZonesSecurityPolicy": (oci.cloud_guard.CloudGuardClient, "list_security_policies"),
        "SecurityZonesSecurityRecipe": (oci.cloud_guard.CloudGuardClient, "list_security_recipes"),
        "SecurityZonesSecurityZone": (oci.cloud_guard.CloudGuardClient, "list_security_zones"),
        # oci.cloud_migrations.MigrationClient
        "Migration": (oci.cloud_migrations.MigrationClient, "list_migrations"),
        "MigrationAsset": (oci.cloud_migrations.MigrationClient, "list_migration_assets"),
        "MigrationPlan": (oci.cloud_migrations.MigrationClient, "list_migration_plans"),
        "ReplicationSchedule": (oci.cloud_migrations.MigrationClient, "list_replication_schedules"),
        "TargetAsset": (oci.cloud_migrations.MigrationClient, "list_target_assets"),
        # oci.compute_instance_agent.PluginClient
        "InstanceAgentPlugin": (oci.compute_instance_agent.PluginClient, "list_instance_agent_plugins"),
        # oci.compute_instance_agent.PluginconfigClient
        "InstanceAgentAvailablePlugin": (oci.compute_instance_agent.PluginconfigClient, "list_instanceagent_available_plugins"),
        # oci.container_engine.ContainerEngineClient
        "Cluster": (oci.container_engine.ContainerEngineClient, "list_clusters"),
        "NodePool": (oci.container_engine.ContainerEngineClient, "list_node_pools"),
        #  oci.container_instances.ContainerInstanceClient
        "ContainerInstance": (oci.container_instances.ContainerInstanceClient, "list_container_instances"),
        "Container": (oci.container_instances.ContainerInstanceClient, "list_containers"),
        # oci.core.BlockstorageClient
        "VolumeReplica": (oci.core.BlockstorageClient, "list_block_volume_replicas"), # TODO need to query replicas in destination region
        "BootVolume": (oci.core.BlockstorageClient, "list_boot_volumes"),
        "BootVolumeBackup": (oci.core.BlockstorageClient, "list_boot_volume_backups"),
        "BootVolumeReplica": (oci.core.BlockstorageClient, "list_boot_volume_replicas"), # TODO need to query replicas in destination region
        "Volume": (oci.core.BlockstorageClient, "list_volumes"),
        "VolumeBackup": (oci.core.BlockstorageClient, "list_volume_backups"),
        "VolumeBackupPolicy": (oci.core.BlockstorageClient, "list_volume_backup_policies"),
        "VolumeGroup": (oci.core.BlockstorageClient, "list_volume_groups"),
        "VolumeGroupBackup": (oci.core.BlockstorageClient, "list_volume_group_backups"),
        "VolumeGroupReplica": (oci.core.BlockstorageClient, "list_volume_group_replicas"),
        # oci.core.ComputeClient
        "BootVolumeAttachment": (oci.core.ComputeClient, "list_boot_volume_attachments"),
        "ComputeCapacityReservation": (oci.core.ComputeClient, "list_compute_capacity_reservations"),
        "ComputeCapacityReservationInstance": (oci.core.ComputeClient, "list_compute_capacity_reservation_instances"),
        "Image": (oci.core.ComputeClient, "list_images"),
        "Instance": (oci.core.ComputeClient, "list_instances"),
        "VnicAttachment": (oci.core.ComputeClient, "list_vnic_attachments"),
        "VolumeAttachment": (oci.core.ComputeClient, "list_volume_attachments"),
        # oci.core.ComputeManagementClient
        "ClusterNetwork": (oci.core.ComputeManagementClient, "list_cluster_networks"),
        "InstanceConfiguration": (oci.core.ComputeManagementClient, "list_instance_configurations"),
        "InstancePool": (oci.core.ComputeManagementClient, "list_instance_pools"),
        # oci.core.VirtualNetworkClient
        "ByoipRange": (oci.core.VirtualNetworkClient, "list_byoip_ranges"),
        "CaptureFilter": (oci.core.VirtualNetworkClient, "list_capture_filters"),
        "CrossConnect": (oci.core.VirtualNetworkClient, "list_cross_connects"),
        "CrossConnectGroup": (oci.core.VirtualNetworkClient, "list_cross_connect_groups"),
        "CrossConnectMapping": (oci.core.VirtualNetworkClient, "list_cross_connect_mappings"),
        "Cpe": (oci.core.VirtualNetworkClient, "list_cpes"),
        "DHCPOptions": (oci.core.VirtualNetworkClient, "list_dhcp_options"),
        "Drg": (oci.core.VirtualNetworkClient, "list_drgs"),
        "DrgAttachment": (oci.core.VirtualNetworkClient, "list_drg_attachments"),
        "DrgRouteDistribution": (oci.core.VirtualNetworkClient, "list_drg_route_distributions"),
        "DrgRouteDistributionStatement": (oci.core.VirtualNetworkClient, "list_drg_route_distribution_statements"),
        "DrgRouteRule": (oci.core.VirtualNetworkClient, "list_drg_route_rules"),
        "DrgRouteTable": (oci.core.VirtualNetworkClient, "list_drg_route_tables"),
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
        "PublicIpPool": (oci.core.VirtualNetworkClient, "list_public_ip_pools"),
        "RemotePeeringConnection": (oci.core.VirtualNetworkClient, "list_remote_peering_connections"),
        "RouteTable": (oci.core.VirtualNetworkClient, "list_route_tables"),
        "SecurityList": (oci.core.VirtualNetworkClient, "list_security_lists"),
        "ServiceGateway": (oci.core.VirtualNetworkClient, "list_service_gateways"),
        "Subnet": (oci.core.VirtualNetworkClient, "list_subnets"),
        "Vcn": (oci.core.VirtualNetworkClient, "list_vcns"),
        "VirtualCircuit": (oci.core.VirtualNetworkClient, "list_virtual_circuits"),
        "Vlan": (oci.core.VirtualNetworkClient, "list_vlans"),
        "Vtap": (oci.core.VirtualNetworkClient, "list_vtaps"),
        # oci.dashboard_service.DashboardClient
        "ConsoleDashboard": (oci.dashboard_service.DashboardClient, "list_dashboards"),
        # oci.dashboard_service.DashboardGroupClient
        "ConsoleDashboardGroup": (oci.dashboard_service.DashboardGroupClient, "list_dashboard_groups"),
        # oci.data_catalog.DataCatalogClient
        "DataCatalog": (oci.data_catalog.DataCatalogClient, "list_catalogs"),
        "DataCatalogMetastore": (oci.data_catalog.DataCatalogClient, "list_metastores"),
        "DataCatalogPrivateEndpoint": (oci.data_catalog.DataCatalogClient, "list_catalog_private_endpoints"),
        # oci.data_flow.DataFlowClient
        "DataFlowApplication": (oci.data_flow.DataFlowClient, "list_applications"),
        "DataFlowRun": (oci.data_flow.DataFlowClient, "list_runs"),
        "DataFlowPrivateEndpoint": (oci.data_flow.DataFlowClient, "list_private_endpoints"),
        # oci.data_integration.DataIntegrationClient
        "DISWorkspace": (oci.data_integration.DataIntegrationClient, "list_workspaces"),
        # oci.data_labeling_service.DataLabelingManagementClient
        "DataLabelingDataset": (oci.data_labeling_service.DataLabelingManagementClient, "list_datasets"),
        # oci.data_safe.DataSafeClient
        "DataSafeAlertPolicy": (oci.data_safe.DataSafeClient, "list_alert_policies"),
        "DataSafeArchiveRetrieval": (oci.data_safe.DataSafeClient, "list_audit_archive_retrievals"),
        "DataSafeAuditPolicy": (oci.data_safe.DataSafeClient, "list_audit_policies"),
        "DataSafeAuditProfile": (oci.data_safe.DataSafeClient, "list_audit_profiles"),
        "DataSafeAuditTrail": (oci.data_safe.DataSafeClient, "list_audit_trails"),
        "DataSafeDiscoveryJob": (oci.data_safe.DataSafeClient, "list_discovery_jobs"),
        "DataSafeLibraryMaskingFormat": (oci.data_safe.DataSafeClient, "list_library_masking_formats"),
        "DataSafeMaskingPolicy": (oci.data_safe.DataSafeClient, "list_masking_policies"),
        "DataSafeMaskingReport": (oci.data_safe.DataSafeClient, "list_masking_reports"),
        "DataSafeOnpremConnector": (oci.data_safe.DataSafeClient, "list_on_prem_connectors"),
        "DataSafePrivateEndpoint": (oci.data_safe.DataSafeClient, "list_data_safe_private_endpoints"),
        "DataSafeReport": (oci.data_safe.DataSafeClient, "list_reports"),
        "DataSafeReportDefinition": (oci.data_safe.DataSafeClient, "list_report_definitions"),
        "DataSafeSecurityAssessment": (oci.data_safe.DataSafeClient, "list_security_assessments"),
        "DataSafeSensitiveDataModel": (oci.data_safe.DataSafeClient, "list_sensitive_data_models"),
        "DataSafeSensitiveType": (oci.data_safe.DataSafeClient, "list_sensitive_types"),
        "DataSafeTargetAlertPolicyAssociation": (oci.data_safe.DataSafeClient, "list_target_alert_policy_associations"),
        "DataSafeTargetDatabase": (oci.data_safe.DataSafeClient, "list_target_databases"),
        "DataSafeUserAssessment": (oci.data_safe.DataSafeClient, "list_user_assessments"),
        # oci.data_connectivity.DataConnectivityManagementClient
        #"DCMSEndpoint": (oci.data_connectivity.DataConnectivityManagementClient, "list_endpoints"),
        #"DCMSRegistry": (oci.data_connectivity.DataConnectivityManagementClient, "list_registries"),
        # oci.data_science.DataScienceClient
        "DataScienceJob": (oci.data_science.DataScienceClient, "list_jobs"),
        "DataScienceJobRun": (oci.data_science.DataScienceClient, "list_job_runs"),
        "DataScienceModel": (oci.data_science.DataScienceClient, "list_models"),
        "DataScienceModelDeployment": (oci.data_science.DataScienceClient, "list_model_deployments"),
        "DataScienceModelVersionSet": (oci.data_science.DataScienceClient, "list_model_version_sets"),
        "DataScienceNotebookSession": (oci.data_science.DataScienceClient, "list_notebook_sessions"),
        "DataSciencePipeline": (oci.data_science.DataScienceClient, "list_pipelines"),
        "DataSciencePipelineRun": (oci.data_science.DataScienceClient, "list_pipeline_runs"),
        "DataScienceProject": (oci.data_science.DataScienceClient, "list_projects"),
        # oci.database.DatabaseClient
        "AutonomousContainerDatabase": (oci.database.DatabaseClient, "list_autonomous_container_databases"),
        "AutonomousContainerDatabaseDataguardAssociation": (oci.database.DatabaseClient, "list_autonomous_container_database_dataguard_associations"),
        "AutonomousDatabase": (oci.database.DatabaseClient, "list_autonomous_databases"),
        # - "AutonomousDatabase": (oci.database.DatabaseClient, "list_autonomous_database_clones), # TODO
        "AutonomousDatabaseBackup": (oci.database.DatabaseClient, "list_autonomous_database_backups"),
        "AutonomousDatabaseDataguardAssociation": (oci.database.DatabaseClient, "list_autonomous_database_dataguard_associations"),
        "AutonomousExadataInfrastructure": (oci.database.DatabaseClient, "list_autonomous_vm_clusters"),
        "AutonomousVmCluster": (oci.database.DatabaseClient, "list_autonomous_exadata_infrastructures"), # Exadata Cloud@Customer only
        "Backup": (oci.database.DatabaseClient, "list_backups"),
        "BackupDestination": (oci.database.DatabaseClient, "list_backup_destination"),
        "CloudAutonomousVmCluster": (oci.database.DatabaseClient, "list_cloud_autonomous_vm_clusters"),
        "CloudExadataInfrastructure": (oci.database.DatabaseClient, "list_cloud_exadata_infrastructures"),
        "CloudVmCluster": (oci.database.DatabaseClient, "list_cloud_vm_clusters"),
        "Database": (oci.database.DatabaseClient, "list_databases"),
        "DatabaseConsoleConnection": (oci.database.DatabaseClient, "list_console_connections"),
        "DatabaseSoftwareImage": (oci.database.DatabaseClient, "list_database_software_images"),
        "DataGuardAssociation": (oci.database.DatabaseClient, "list_data_guard_associations"),
        "DbHome": (oci.database.DatabaseClient, "list_db_homes"),
        "DbKeyStore": (oci.database.DatabaseClient, "list_key_stores"),
        "DbNode": (oci.database.DatabaseClient, "list_db_nodes"),
        "DbServer": (oci.database.DatabaseClient, "list_db_servers"),
        "DbSystem": (oci.database.DatabaseClient, "list_db_systems"),
        "DedicatedVmHost": (oci.core.ComputeClient, "list_dedicated_vm_hosts"),
        "DedicatedVmHostInstance": (oci.core.ComputeClient, "list_dedicated_vm_host_instances"),
        "ExadataInfrastructure": (oci.database.DatabaseClient, "list_exadata_infrastructures"), # Exadata Cloud@Customer only
        "ExternalContainerDatabase": (oci.database.DatabaseClient, "list_external_container_databases"),
        "ExternalDatabaseConnector": (oci.database.DatabaseClient, "list_external_database_connectors"),
        "ExternalNonContainerDatabase": (oci.database.DatabaseClient, "list_external_non_container_databases"),
        "ExternalPluggableDatabase": (oci.database.DatabaseClient, "list_external_pluggable_databases"),
        "PluggableDatabase": (oci.database.DatabaseClient, "list_pluggable_databases"),
        "VmCluster": (oci.database.DatabaseClient, "list_vm_clusters"), # Exadata Cloud@Customer only
        "VmClusterNetwork": (oci.database.DatabaseClient, "list_vm_cluster_networks"), # Exadata Cloud@Customer only
        # oci.database_migration.DatabaseMigrationClient
        "OdmsAgent": (oci.database_migration.DatabaseMigrationClient, "list_agents"),
        "OdmsConnection": (oci.database_migration.DatabaseMigrationClient, "list_connections"),
        "OdmsJob": (oci.database_migration.DatabaseMigrationClient, "list_jobs"),
        "OdmsMigration": (oci.database_migration.DatabaseMigrationClient, "list_migrations"),
        # oci.database_tools.DatabaseToolsClient
        "DatabaseToolsConnection": (oci.database_tools.DatabaseToolsClient, "list_database_tools_connections"),
        "DatabaseToolsPrivateEndpoint": (oci.database_tools.DatabaseToolsClient, "list_database_tools_private_endpoints"),
        # oci.devops.DevopsClient
        "DevOpsBuildPipeline": (oci.devops.DevopsClient, "list_build_pipelines"),
        "DevOpsBuildPipelineStage": (oci.devops.DevopsClient, "list_build_pipeline_stages"),
        "DevOpsBuildRun": (oci.devops.DevopsClient, "list_build_runs"),
        "DevOpsConnection": (oci.devops.DevopsClient, "list_connections"),
        "DevOpsDeployArtifact": (oci.devops.DevopsClient, "list_deploy_artifacts"),
        "DevOpsDeployEnvironment": (oci.devops.DevopsClient, "list_deploy_environments"),
        "DevOpsDeployPipeline": (oci.devops.DevopsClient, "list_deploy_pipelines"),
        "DevOpsDeployStage": (oci.devops.DevopsClient, "list_deploy_stages"),
        "DevOpsDeployment": (oci.devops.DevopsClient, "list_deployments"),
        "DevOpsProject": (oci.devops.DevopsClient, "list_projects"),
        # - "DevOpsProjectPipeline": : (oci.devops.DevopsClient, ""), # TODO
        "DevOpsRepository": (oci.devops.DevopsClient, "list_repositories"),
        "DevOpsTrigger": (oci.devops.DevopsClient, "list_trigger"),
        # oci.dns.DnsClient
        "CustomerDnsZone": (oci.dns.DnsClient, "list_zones"),
        "DnsResolver": (oci.dns.DnsClient, "list_resolvers"),
        "DnsResolverEndpoint": (oci.dns.DnsClient, "list_resolver_endpoints"),
        "DnsPolicy": (oci.dns.DnsClient, "list_steering_policies"),
        "DnsPolicyAttachment": (oci.dns.DnsClient, "list_steering_policy_attachments"),
        "DnsTsigKey": (oci.dns.DnsClient, "list_tsig_keys"),
        "DnsView": (oci.dns.DnsClient, "list_views"),
        "RRSet": (oci.dns.DnsClient, "get_rr_set"),
        "ZoneTransferServer": (oci.dns.DnsClient, "list_zone_transfer_servers"),
        # oci.dts.ApplianceExportJobClient
        "DataTransferApplianceExportJob": (oci.dts.ApplianceExportJobClient, "list_appliance_export_jobs"),
        # oci.dts.TransferApplianceClient
        "DataTransferAppliance": (oci.dts.TransferDeviceClient, "list_transfer_appliances"),
        # oci.dts.TransferDeviceClient
        "DataTransferDevice": (oci.dts.TransferDeviceClient, "list_transfer_devices"),
        # oci.dts.TransferJobClient
        "DataTransferJob": (oci.dts.TransferJobClient, "list_transfer_jobs"),
        # oci.dts.TransferPackageClient
        "DataTransferPackage": (oci.dts.TransferPackageClient, "list_transfer_packages"),
        # oci.email.EmailClient
        "EmailDomain": (oci.email.EmailClient, "list_email_domains"),
        "EmailSender": (oci.email.EmailClient, "list_senders"),
        "EmailSuppression": (oci.email.EmailClient, "list_suppressions"),
        "EmailDkim": (oci.email.EmailClient, "list_dkims"),
        # oci.events.EventsClient
        "EventRule": (oci.events.EventsClient, "list_rules"),
        # oci.file_storage.FileStorageClient
        "Export": (oci.file_storage.FileStorageClient, "list_exports"),
        "ExportSet": (oci.file_storage.FileStorageClient, "list_export_sets"),
        "FileSystem": (oci.file_storage.FileStorageClient ,"list_file_systems"),
        "MountTarget": (oci.file_storage.FileStorageClient ,"list_mount_targets"),
        "Snapshot": (oci.file_storage.FileStorageClient, "list_snapshots"),
        "FssReplication": (oci.file_storage.FileStorageClient, "list_replications"),
        "FssReplicationTarget": (oci.file_storage.FileStorageClient, "list_replication_targets"),
        # oci.functions.FunctionsManagementClient
        "FunctionsApplication": (oci.functions.FunctionsManagementClient, "list_applications"),
        "FunctionsFunction": (oci.functions.FunctionsManagementClient, "list_functions"),
        # oci.fusion_apps.FusionApplicationsClient
        "FusionEnvironment": (oci.fusion_apps.FusionApplicationsClient, "list_fusion_environments"),
        "FusionEnvironmentFamily": (oci.fusion_apps.FusionApplicationsClient, "list_fusion_environment_families"),
        # oci.golden_gate.GoldenGateClient
        "GoldenGateConnection": (oci.golden_gate.GoldenGateClient, "list_connections"),
        "GoldenGateDatabaseRegistration": (oci.golden_gate.GoldenGateClient, "list_database_registrations"),
        "GoldenGateDeployment": (oci.golden_gate.GoldenGateClient, "list_deployments"),
        "GoldenGateDeploymentBackup": (oci.golden_gate.GoldenGateClient, "list_deployment_backups"),
        # oci.healthchecks.HealthChecksClient
        "HttpMonitor": (oci.healthchecks.HealthChecksClient, "list_http_monitors"),
        "PingMonitor": (oci.healthchecks.HealthChecksClient, "list_ping_monitors"),
        # oci.identity.IdentityClient
        "AvailabilityDomain": (oci.identity.IdentityClient, "list_availability_domains"),
        "DynamicResourceGroup": (oci.identity.IdentityClient, "list_dynamic_groups"),
        "DbCredential": (oci.identity.IdentityClient, "list_db_credentials"),
        "Group": (oci.identity.IdentityClient, "list_groups"),
        "IdentityProvider": (oci.identity.IdentityClient, "list_identity_providers"),
        "IdentityProviderGroup": (oci.identity.IdentityClient, "list_identity_provider_groups"),
        "IdpGroupMapping": (oci.identity.IdentityClient, "list_idp_group_mappings"),
        "Domain": (oci.identity.IdentityClient, "list_domains"),
        "MfaTotpDevice": (oci.identity.IdentityClient, "list_mfa_totp_devices"),
        "NetworkSource": (oci.identity.IdentityClient, "list_network_sources"),
        "Policy": (oci.identity.IdentityClient, "list_policies"),
        "Tag": (oci.identity.IdentityClient, "list_tags"),
        "TagDefault": (oci.identity.IdentityClient, "list_tag_defaults"),
        "TagNamespace":  (oci.identity.IdentityClient, "list_tag_namespaces"),
        "User": (oci.identity.IdentityClient, "list_users"),
        "UserGroupMembership": (oci.identity.IdentityClient, "list_user_group_memberships"),
        # oci.integration.IntegrationInstanceClient
        "IntegrationInstance": (oci.integration.IntegrationInstanceClient, "list_integration_instances"),
        # oci.jms.JavaManagementServiceClient
        "JmsFleet": (oci.jms.JavaManagementServiceClient, "list_fleets"),
        # "": (oci.jms.JavaManagementServiceClient, "list_installation_sites"), # TODO
        # "": (oci.jms.JavaManagementServiceClient, "list_blocklists"), # TODO
        # oci.key_management.KmsManagementClient
        "Key": (oci.key_management.KmsManagementClient, "list_keys"),
        # oci.key_management.KmsVaultClient
        "Vault": (oci.key_management.KmsVaultClient, "list_vaults"),
        "VaultReplica": (oci.key_management.KmsVaultClient, "list_vault_replicas"),
        # oci.license_manager.LicenseManagerClient
        "LicenseManagerLicenseRecord": (oci.license_manager.LicenseManagerClient, "list_license_records"),
        "LicenseManagerProductLicense": (oci.license_manager.LicenseManagerClient, "list_product_licenses"),
        # oci.limits.QuotasClient
        "Quota": (oci.limits.QuotasClient, "list_quotas"),
        # oci.load_balancer.LoadBalancerClient
        "Backend": (oci.load_balancer.LoadBalancerClient, "list_backends"), # NOT USED - backends are returned in the parent Load Balancer and Backend Set response
        "BackendSet": (oci.load_balancer.LoadBalancerClient, "list_backend_sets"),  # NOT USED - backend sets are returned in the parent Load Balancer response
        "Certificate": (oci.load_balancer.LoadBalancerClient, "list_certificates"), # NOT USED - certificated are returned in the parent Load Balancer response
        "Hostname": (oci.load_balancer.LoadBalancerClient, "list_hostnames"), # NOT USED - hostnames are returned in the parent Load Balancer response
        "ListenerRule": (oci.load_balancer.LoadBalancerClient, "list_listener_rules"), # NOT USED - listener rules are returned in the parent Load Balancer response
        "LoadBalancer": (oci.load_balancer.LoadBalancerClient, "list_load_balancers"),
        "PathRouteSet": (oci.load_balancer.LoadBalancerClient, "list_path_route_sets"),  # NOT USED - path route sets are returned in the parent Load Balancer response
        "RoutingPolicy": (oci.load_balancer.LoadBalancerClient, "list_routing_policies"),  # NOT USED - routing policies are returned in the parent Load Balancer response
        "RuleSet": (oci.load_balancer.LoadBalancerClient, "list_rule_sets"),  # NOT USED - rule sets are returned in the parent Load Balancer response
        "SSLCipherSuite": (oci.load_balancer.LoadBalancerClient, "list_ssl_cipher_suites"),  # NOT USED - ssl cipher suites are returned in the parent Load Balancer response
        # oci.log_analytics.LogAnalyticsClient
        "LogAnalyticsEntity": (oci.log_analytics.LogAnalyticsClient, "list_log_analytics_entities"),
        # oci.logging.LoggingManagementClient
        # "Log": (oci.logging.LoggingManagementClient, "list_logs"), # NOT USED - to much detial
        "LogGroup": (oci.logging.LoggingManagementClient, "list_log_groups"),
        "LogSavedSearch":  (oci.logging.LoggingManagementClient, "list_log_saved_searches"),
        "UnifiedAgentConfiguration": (oci.logging.LoggingManagementClient, "list_unified_agent_configurations"),
        # oci.management_agent.ManagementAgentClient
        "ManagementAgent": (oci.management_agent.ManagementAgentClient, "list_management_agents"),
        "ManagementAgentInstallKey": (oci.management_agent.ManagementAgentClient, "list_management_agent_install_keys"),
        # oci.management_dashboard.DashxApisClient
        "ManagementDashboard": (oci.management_dashboard.DashxApisClient, "list_management_dashboards"),
        "ManagementSavedSearch": (oci.management_dashboard.DashxApisClient, "list_management_saved_searches"),
        # oci.media_services.MediaServicesClient
        "MediaWorkflow": (oci.media_services.MediaServicesClient, "list_media_workflows"),
        "MediaWorkflowConfiguration": (oci.media_services.MediaServicesClient, "list_media_workflow_configurations"),
        # oci.media_services.MediaStreamClient # TODO
        # "StreamCdnConfig": (oci.media_services.MediaStreamClient, ""),
        # "StreamDistributionChannel": (oci.media_services.MediaStreamClient, ""),
        # "StreamPackagingConfig": (oci.media_services.MediaStreamClient, ""),
        # oci.monitoring.MonitoringClient
        "Alarm": (oci.monitoring.MonitoringClient, "list_alarms"),
        "AlarmStatus": (oci.monitoring.MonitoringClient, "list_alarms_status"),
        # oci.mysql.ChannelsClient
        "MySQLChannel": (oci.mysql.ChannelsClient, "list_channels"),
        # oci.mysql.DbBackupsClient
        "MySQLBackup": (oci.mysql.DbBackupsClient, "list_backups"),
        # oci.mysql.DbSystemClient
        "MySQLDbSystem": (oci.mysql.DbSystemClient, "list_db_systems"), # note: use get_db_system to get additional resource details
        # oci.mysql.MysqlaasClient
        "MySQLConfiguration": (oci.mysql.MysqlaasClient, "list_configurations"),
        # oci.network_firewall.NetworkFirewallClient
        "NetworkFirewall": (oci.network_firewall.NetworkFirewallClient, "list_network_firewalls"),
        "NetworkFirewallPolicy": (oci.network_firewall.NetworkFirewallClient, "list_network_firewall_policies"),
        # oci.network_load_balancer.NetworkLoadBalancerClient
        "NetworkLoadBalancer": (oci.network_load_balancer.NetworkLoadBalancerClient, "list_network_load_balancers"),
        # "NetworkLoadBalancerBackendSet": (oci.network_load_balancer.NetworkLoadBalancerClient, "list_backend_sets"), # NOT USED - backend sets are returned in the parent Load Balancer response
        # "NetworkLoadBalancerBackend": (oci.network_load_balancer.NetworkLoadBalancerClient, "list_backends"), # NOT USED - backends are returned in the parent Load Balancer response
        # "NetworkLoadBalancerListener": (oci.network_load_balancer.NetworkLoadBalancerClient, "list_listeners"), # NOT USED - listners are returned in the parent Load Balancer response
        # oci.nosql.NosqlClient
        "NoSQLTable": (oci.nosql.NosqlClient, "list_tables"),
        "NoSQLIndex": (oci.nosql.NosqlClient, "list_indexes"),
        # oci.object_storage.ObjectStorageClient
        "Bucket": (oci.object_storage.ObjectStorageClient, "list_buckets"),
        "PreauthenticatedRequest": (oci.object_storage.ObjectStorageClient, "list_preauthenticated_requests"),
        # oci.oce.OceInstanceClient
        "OceInstance": (oci.oce.OceInstanceClient ,"list_oce_instances"),
        # oci.operator_access_control.OperatorControlAssignmentClient
        "OpctlOperatorControlAssignment": ( oci.operator_access_control.OperatorControlAssignmentClient, "list_operator_control_assignments"),
        # oci.operator_access_control.OperatorControlClient
        "OpctlOperatorControl": (oci.operator_access_control.OperatorControlClient, "list_operator_controls"),
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
        "OpsiDatabaseInsight": (oci.opsi.OperationsInsightsClient, "list_database_insights"),
        # "SQLPlan": (oci.opsi.OperationsInsightsClient, "list_sql_plans"), # TODO TypeError("list_sql_plans() missing 3 required positional arguments: 'database_id', 'sql_identifier', and 'plan_hash'")
        # "SQLSearch": (oci.opsi.OperationsInsightsClient, "list_sql_searches"), # TODO TypeError("list_sql_searches() missing 1 required positional argument: 'sql_identifier'")
        # "SQLText": (oci.opsi.OperationsInsightsClient, "list_sql_texts"), # TODO TypeError("list_sql_texts() missing 1 required positional argument: 'sql_identifier'")
        # oci.os_management.OsManagementClient
        # "OsmsManagedInstance": (oci.os_management.OsManagementClient, "list_managed_instances"),  # use get by instance id instead of list by compartment id
        "OsmsManagedInstanceGroup": (oci.os_management.OsManagementClient, "list_managed_instance_groups"),
        "OsmsScheduledJob": (oci.os_management.OsManagementClient, "list_scheduled_jobs"),
        "OsmsSoftwareSource": (oci.os_management.OsManagementClient, "list_software_sources"),
        # oci.queue.QueueAdminClient
        "Queue": (oci.queue.QueueAdminClient, "list_queues"),
        # oci.recovery.DatabaseRecoveryClient # TODO
        # "RecoveryServiceSubnet": (oci.recovery.DatabaseRecoveryClient, "list_recovery_service_subnets"),
        # "RecoverySystem": (oci.recovery.DatabaseRecoveryClient, ""),
        # "RecoverySystemNetworkInterface": (oci.recovery.DatabaseRecoveryClient, ""),
        # "RecoverySystemPolicy": (oci.recovery.DatabaseRecoveryClient, ""),
        # oci.resource_manager.ResourceManagerClient
        "OrmConfigSourceProvider": (oci.resource_manager.ResourceManagerClient, "list_configuration_source_providers"),
        "OrmJob":  (oci.resource_manager.ResourceManagerClient, "list_jobs"),
        "OrmStack": (oci.resource_manager.ResourceManagerClient, "list_stacks"),
        "OrmPrivateEndpoint": (oci.resource_manager.ResourceManagerClient, "list_private_endpoints"),
        # "OrmPrivateEndpoint": (oci.resource_manager.ResourceManagerClient, "list_private_endpoints"),
        "OrmTemplate": (oci.resource_manager.ResourceManagerClient, "list_templates"),
        # oci.rover.RoverClusterClient
        "RoverCluster": (oci.rover.RoverClusterClient, "list_rover_clusters"),
        # oci.rover.RoverEntitlementClient
        "RoverEntitlement": (oci.rover.RoverEntitlementClient, "list_rover_entitlements"),
        # oci.rover.RoverNodeClient
        "RoverNode": (oci.rover.RoverNodeClient, "list_rover_nodes"),
        # oci.sch.ServiceConnectorClient
        "ServiceConnector": (oci.sch.ServiceConnectorClient, "list_service_connectors"),
        # oci.service_mesh.ServiceMeshClient
        "AccessPolicy": (oci.service_mesh.ServiceMeshClient, "list_access_policies"),
        "IngressGateway": (oci.service_mesh.ServiceMeshClient, "list_ingress_gateways"),
        "IngressGatewayRouteTable": (oci.service_mesh.ServiceMeshClient, "list_ingress_gateway_route_tables"),
        "Mesh": (oci.service_mesh.ServiceMeshClient, "list_meshes"),
        "VirtualDeployment": (oci.service_mesh.ServiceMeshClient, "list_virtual_deployments"),
        "VirtualServiceRouteTable": (oci.service_mesh.ServiceMeshClient, "list_virtual_service_route_tables"),
        "VirtualService": (oci.service_mesh.ServiceMeshClient, "list_virtual_services"),
        # oci.streaming.StreamAdminClient
        "ConnectHarness": (oci.streaming.StreamAdminClient, "list_connect_harnesses"),
        "Stream": (oci.streaming.StreamAdminClient, "list_streams"),
        "StreamPool": (oci.streaming.StreamAdminClient, "list_stream_pools"),
        # oci.vault.VaultsClient
        "VaultSecret": (oci.vault.VaultsClient, "list_secrets"),
        # oci.vbs_inst.VbsInstanceClient
        "VbsInstance": (oci.vbs_inst.VbsInstanceClient, "list_vbs_instances"),
        # oci.visual_builder.VbInstanceClient
        "VisualBuilderInstance": (oci.visual_builder.VbInstanceClient, "list_vb_instances"),
        # oci.vn_monitoring.VnMonitoringClient
        "PathAnalyzerTest": (oci.vn_monitoring.VnMonitoringClient, "list_path_analyzer_tests"),
        # oci.vulnerability_scanning.VulnerabilityScanningClient
        "VssContainerScanRecipe": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_container_scan_recipes"),
        "VssContainerScanTarget": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_container_scan_targets"),
        "VssHostScanRecipe": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_host_scan_recipes"),
        "VssHostScanTarget": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_host_scan_targets"),
        "VssContainerScanResult": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_container_scan_results"),
        "VssHostAgentScanScanResult": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_host_agent_scan_results"),
        "VssHostCisBenchmarkScanResult": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_host_cis_benchmark_scan_results"),
        "VssHostEndpointProtectionScanResult": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_host_endpoint_protection_scan_results"),
        "VssHostPortScanResult": ( oci.vulnerability_scanning.VulnerabilityScanningClient, "list_host_port_scan_results"),
        # oci.waa.WaaClient
        "WebAppAcceleration": (oci.waa.WaaClient, "list_web_app_accelerations"),
        "WebAppAccelerationPolicy": (oci.waa.WaaClient, "list_web_app_acceleration_policies"),
        # oci.waas.RedirectClient
        "HttpRedirect": (oci.waas.RedirectClient, "list_http_redirects"),
        # oci.waas.WaasClient
        "WaasAddressList": (oci.waas.WaasClient, "list_address_lists"),
        "WaasCertificate": (oci.waas.WaasClient, "list_certificates"),
        "WaasCustomProtectionRule": (oci.waas.WaasClient, "list_custom_protection_rules"),
        "WaasPolicy": (oci.waas.WaasClient, "list_waas_policies"),
        # oci.waf.WafClient
        "WebAppFirewall": (oci.waf.WafClient, "list_web_app_firewalls"),
        "WebAppFirewallNetworkAddressList": (oci.waf.WafClient, "list_network_address_lists"),
        "WebAppFirewallPolicy": (oci.waf.WafClient, "list_web_app_firewall_policies"),
    }

    # static/read-only resource types - these are only fetched if explictly requested.
    #
    # map suppoted resources types to the OCI SDK client type and its "list"
    # method. Creates a map of:
    #     { resource_name -> (Client, list_method) }
    static_resource_client_methods = {
        # oci.container_engine.ContainerEngineClient
        "ClusterOptions": (oci.container_engine.ContainerEngineClient, "get_cluster_options"), # use cluster_option_id="all"
        # oci.container_engine.ContainerEngineClient
        "PodShape": (oci.container_engine.ContainerEngineClient, "list_pod_shapes"),
        #  oci.container_instances.ContainerInstanceClient
        "ContainerInstanceShape": (oci.container_instances.ContainerInstanceClient, "list_container_instance_shapes"),
        # oci.core.ComputeClient
        "ImageShapeCompatibility": (oci.core.ComputeClient, "list_image_shape_compatibility_entries"),
        "Shape": (oci.core.ComputeClient, "list_shapes"),
        # oci.core.VirtualNetworkClient
        "CpeDeviceShape": (oci.core.VirtualNetworkClient, "list_cpe_device_shapes"),
        "FastConnectProviderService": (oci.core.VirtualNetworkClient, "list_fast_connect_provider_services"),
        "VirtualCircuitBandwidthShape": (oci.core.VirtualNetworkClient, "list_fast_connect_provider_virtual_circuit_bandwidth_shapes"),
        # oci.database.DatabaseClient
        "DbSystemShape": (oci.database.DatabaseClient, "list_db_system_shapes"),
        "DbVersion": (oci.database.DatabaseClient, "list_db_versions"),
        # "GiVersion": (oci.database.DatabaseClient, "list_gi_versions"), # Handled as a special case to get all Gi Versons by shape, see list_gi_versions_by_shape
        # oci.data_science.DataScienceClient
        "DataScienceNotebookSessionShape": (oci.data_science.DataScienceClient, "list_notebook_session_shapes"),
        # oci.limits.LimitsClient
        "Service": (oci.limits.LimitsClient, "list_services"),
        # oci.load_balancer.LoadBalancerClient
        "LoadBalancerShape": (oci.load_balancer.LoadBalancerClient, "list_shapes"),
        # oci.mysql.MysqlaasClient
        "MySQLShape": (oci.mysql.MysqlaasClient, "list_shapes"),
        "MySQLVersion": (oci.mysql.MysqlaasClient, "list_versions"),
        "MySQLConfiguration": (oci.mysql.MysqlaasClient, "list_configurations"),  # use type="DEFAULT"
    }

    @classmethod
    def get_supported_resources(cls):
        resource_types = {resource for resource, ignore in cls.list_resource_client_methods.items()}
        resource_types.union({resource for resource, ignore in cls.get_resource_client_methods.items() if not resource.endswith("Details")})
        return sorted(resource_types)

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

    def __init__(self, config, signer=None, cert_bundle=None, regions=None, compartments=None, include_sub_compartments=False, include_resource_types=None, exclude_resource_types=None, timeout=DEFAULT_TIMEOUT, max_workers=DEFAULT_MAX_WORKERS, include_root_as_compartment=False, tenancy_override=None):
        self.config = config
        self.cert_bundle = cert_bundle
        if signer:
            logger.debug("Using provided OCI API signer")
            self.signer = signer
        elif "delegation_token_file" in self.config:
            logger.debug("Creating OCI API signer with delegation token")
            delegation_token = open(config["delegation_token_file"], 'r').read()
            self.signer = oci.auth.signers.InstancePrincipalsDelegationTokenSigner(
                delegation_token=delegation_token
            )
        elif "user" in self.config:
            logger.debug("Creating OCI API signer for config")
            self.signer = oci.Signer(
                tenancy=self.config["tenancy"],
                user=self.config["user"],
                fingerprint=self.config["fingerprint"],
                private_key_file_location=self.config.get("key_file"),
                pass_phrase=oci.config.get_config_value_or_default(self.config, "pass_phrase")
            )
        else:
            logger.error(f"Unable to configure OCI API signer using configuration {str(config)}")
            exit(1)
        self.timeout = timeout
        self.max_workers = max_workers

        if include_resource_types and "ALL" in include_resource_types:
            self.include_resource_types = self.get_supported_resources()
        else:
            self.include_resource_types = set(include_resource_types) if include_resource_types else None
        logger.debug(f'Including resource types {self.include_resource_types}')

        self.include_resource_types = set(include_resource_types) if include_resource_types else None
        self.exclude_resource_types = set(exclude_resource_types) if exclude_resource_types else None

        # get tenancy
        if not tenancy_override and "tenancy_override" in self.config:
            self.tenancy = self.get_tenancy(config["tenancy_override"])
        else:
            self.tenancy = self.get_tenancy(tenancy_override)
        self.config["tenancy"] = self.tenancy.id

        # get regions
        try:
            self.regions, self.home_region = self.get_regions(regions)
        except Exception as e:
            self.regions = [oci.identity.models.region_subscription.RegionSubscription(is_home_region=True, region_key=config['region'], region_name=config['region'], status="READY")]
            self.home_region = config['region']
            logger.warning(e)

        # get availability_domains
        self.availability_domains = self.get_availability_domains(self.regions)

        # get all compartments
        self.all_compartments = self.get_compartments()
        if include_root_as_compartment:
            self.all_compartments.append(oci.identity.models.Compartment(
                compartment_id=None,
                defined_tags=self.tenancy.defined_tags,
                description=self.tenancy.description,
                freeform_tags=self.tenancy.freeform_tags,
                id=self.tenancy.id,
                inactive_status=None,
                is_accessible=None,
                lifecycle_state="ACTIVE",
                name=self.tenancy.name,
                time_created=None
            ))
        self.compartments = set(compartments) if compartments else None
        self.include_sub_compartments = include_sub_compartments
        if include_sub_compartments:
            for compartment_id in compartments:
                self.compartments.update(self.get_subcompartment_ids(compartment_id))

        # object storage namespace
        object_storage = oci.object_storage.ObjectStorageClient(config=self.config, signer=self.signer)
        if self.cert_bundle:
            object_storage.base_client.session.verify = self.cert_bundle
        self.object_storage_namespace = object_storage.get_namespace().data

        # log analytics namespace
        log_analytics = oci.log_analytics.LogAnalyticsClient(config=self.config, signer=self.signer)
        if self.cert_bundle:
            log_analytics.base_client.session.verify = self.cert_bundle
        log_analytics_namespaces = log_analytics.list_namespaces(self.tenancy.id).data
        self.log_analytics_namespace = log_analytics_namespaces.items[0].namespace_name if len(log_analytics_namespaces.items) > 0 else None

    # use search to find all resources in the region
    def search_resources_for_region(self, region_name, resource_types, compartments=None):
        if len(resource_types) == 0:
            return {}

        # a large number of compartments can cause the query to exceed the maximum 50000 character
        # limit. Split into multiple queries and combine results
        max_compartments = 100
        results = list()
        if compartments and len(compartments) > max_compartments:
            chunks = [list(compartments)[i:i + max_compartments] for i in range(0, len(compartments), max_compartments)]
            for chunk in chunks:
                result = self.search_resources_for_region(region_name, resource_types, chunk)
                results.extend(result)
        else:
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

            search = oci.resource_search.ResourceSearchClient(config=region_config, signer=self.signer)
            if self.cert_bundle:
                search.base_client.session.verify = self.cert_bundle
            search_details = oci.resource_search.models.StructuredSearchDetails(
                type="Structured",
                query=query,
                matching_context_type=oci.resource_search.models.SearchDetails.MATCHING_CONTEXT_TYPE_NONE,
            )
            logger.info("requesting resources for " + region_name)
            results = oci.pagination.list_call_get_all_results(search.search_resources, search_details, tenant_id=self.tenancy.id).data
        return results

    def get_compartments(self):
        identity = oci.identity.IdentityClient(config=self.config, signer=self.signer)
        if self.cert_bundle:
            identity.base_client.session.verify = self.cert_bundle
        result = oci.pagination.list_call_get_all_results(identity.list_compartments, self.tenancy.id, compartment_id_in_subtree=True, lifecycle_state="ACTIVE").data
        logger.info(f'found {len(result)} active compartments')
        return result

    def get_subcompartment_ids(self, compartment_id):
        all_subcompartment_ids = set()
        subcompartment_ids = [compartment.id for compartment in self.all_compartments if compartment.compartment_id == compartment_id and compartment.lifecycle_state == "ACTIVE"]
        for subcompartment_id in subcompartment_ids:
            # add each subcompartment and all its children
            all_subcompartment_ids.add(subcompartment_id)
            all_subcompartment_ids.update(self.get_subcompartment_ids(subcompartment_id))
        return all_subcompartment_ids

    def get_availability_domains(self, regions):
        tasks = dict()
        for region in regions:
            tasks[region.region_name] = [("AvailabilityDomain", self.tenancy.id, None)]
        results = self.get_resources(tasks)
        for region in results:
            results[region] = [ad.name for ad in results[region]["AvailabilityDomain"]]
        return results

    def get_tenancy(self, tenancy_override=None):
        identity = oci.identity.IdentityClient(config=self.config, signer=self.signer)
        if self.cert_bundle:
            identity.base_client.session.verify = self.cert_bundle
        if tenancy_override:
            tenancy = identity.get_tenancy(tenancy_override).data
        else:
            tenancy = identity.get_tenancy(self.config["tenancy"]).data
        return tenancy

    def get_regions(self, region_filter=None):
        identity = oci.identity.IdentityClient(config=self.config, signer=self.signer)
        if self.cert_bundle:
            identity.base_client.session.verify = self.cert_bundle
        all_regions = identity.list_region_subscriptions(self.tenancy.id).data
        active_regions = [region for region in all_regions if region.status == "READY" and (region_filter == None or region.region_name in region_filter)]
        home_region = [region for region in all_regions if region.is_home_region]
        return active_regions, home_region[0].region_name

    def list_seachable_resource_types_for_region(self, region):
        region_config = self.config.copy()
        region_config["region"] = region
        search = oci.resource_search.ResourceSearchClient(config=region_config, signer=self.signer)
        if self.cert_bundle:
            search.base_client.session.verify = self.cert_bundle
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
            # don't search for resources that are fetched as children of a parent resource
            "ApiGatewaySdk",
            "BigDataServiceMetastoreConfig",
        ]
        search_resource_types = dict()
        for region in searchable_resource_types:
            supported_searchable_resource_types = [resource for resource in self.list_resource_client_methods if resource not in ignore_resource_types]
            supported_searchable_resource_types.extend(["Vnic"])
            # FIXME replace supported type InventoryAsset with OcbInventoryAsset
            if "InventoryAsset" in searchable_resource_types[region]:
                searchable_resource_types[region].remove("InventoryAsset")
                searchable_resource_types[region].append("OcbInventoryAsset")
            logger.debug("Skipping unsupported resources types " + ", ".join(sorted(list(set(searchable_resource_types[region]) - set(supported_searchable_resource_types) - set(ignore_resource_types)))))

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

    # generic list resources methods
    # - `klass` the API Client Class for the resource type
    # - `method_name` - resource specific the "list" resources method name
    # - `region` - the region name to override in the config file
    # - `compartment_id` - the compartment ocid to list resource in
    # - `**kwargs` - any extra ags to pass to the list method
    def list_resources(self, klass, method_name, region, back_off=0.1, service_endpoint=None, **kwargs):
        try:
            region_config = self.config.copy()
            region_config["region"] = region
            if not service_endpoint:
                service_endpoint = f"https://iaas.{region}.oraclecloud.com"
            if klass == oci.key_management.KmsManagementClient:
                client = klass(config=region_config, service_endpoint=service_endpoint, signer=self.signer)
            else:
                client = klass(config=region_config, signer=self.signer)
            client.base_client.timeout = (self.timeout, self.timeout)  # set connect timeout, read timeout
            if self.cert_bundle:
                client.base_client.session.verify = self.cert_bundle
            if method_name.startswith("list_"):
                result = oci.pagination.list_call_get_all_results(getattr(client, method_name), **kwargs)
            else:
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

                if resource_type not in (list(self.get_resource_client_methods.keys()) + list(self.list_resource_client_methods.keys()) + list(self.static_resource_client_methods.keys())):
                    # special case for OcbVmwareVmAsset (sub-type of OcbInventoryAsset)
                    if resource_type not in ["OcbVmwareVmAsset"]:
                        logger.warn(f"unsupported resource type {resource_type}")
                        continue

                # do a get for resources that need full details or don't have a list method
                if resource_type in self.get_resource_client_methods and item[2]:
                    klass, method_name = self.get_resource_client_methods[resource_type]
                    if resource_type == "ApiGatewayUsagePlanDetails" and method_name == "get_usage_plan":
                        usage_plan_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, usage_plan_id=usage_plan_id)
                        futures_list.update({(region, resource_type, compartment_id, usage_plan_id):future})
                    elif resource_type == "AutoScalingConfigurationDetails" and method_name == "get_auto_scaling_configuration":
                        auto_scaling_configuration_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, auto_scaling_configuration_id=auto_scaling_configuration_id)
                        futures_list.update({(region, resource_type, None, auto_scaling_configuration_id):future})
                    elif resource_type == "BastionDetails" and method_name == "get_bastion":
                        bastion_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, bastion_id=bastion_id)
                        futures_list.update({(region, resource_type, None, bastion_id):future})
                    elif resource_type == "CloudExadataInfrastrcture" and method_name == "get_cloud_vm_cluster_iorm_config":
                        cloud_vm_cluster_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, cloud_vm_cluster_id=cloud_vm_cluster_id)
                        futures_list.update({(region, resource_type, None, cloud_vm_cluster_id):future})
                    elif resource_type == "ClusterDetails" and method_name == "get_cluster":
                        cluster_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, cluster_id=cluster_id)
                        futures_list.update({(region, resource_type, None, cluster_id):future})
                    elif resource_type == "DataFlowApplicationDetails" and method_name == "get_application":
                        application_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, application_id=application_id)
                        futures_list.update({(region, resource_type, compartment_id, application_id):future})
                    elif resource_type == "DataFlowRunDetails" and method_name == "get_run": #
                        run_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, run_id=run_id)
                        futures_list.update({(region, resource_type, compartment_id, run_id):future})
                    elif resource_type == "ExportSetDetails" and method_name == "get_export_set":
                        export_set_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, export_set_id=export_set_id)
                        futures_list.update({(region, resource_type, compartment_id, export_set_id):future})
                    elif resource_type == "Image" and method_name == "get_image" and compartment_id == None:
                        if compartment_id == None and item[2]:
                            image_id = item[2]
                            future = executor.submit(self.list_resources, klass, method_name, region, image_id=image_id)
                            futures_list.update({(region, resource_type, None, image_id):future})
                    elif resource_type == "InstanceConfigurationDetails" and method_name == "get_instance_configuration":
                        instance_configuration_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, instance_configuration_id=instance_configuration_id)
                        futures_list.update({(region, resource_type, None, instance_configuration_id):future})
                    elif resource_type == "InstancePoolDetails" and method_name == "get_instance_pool":
                        instance_pool_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, instance_pool_id=instance_pool_id)
                        futures_list.update({(region, resource_type, None, instance_pool_id):future})
                    elif resource_type == "MySQLConfiguration" and method_name == "get_configuration":
                        configuration_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, configuration_id=configuration_id)
                        futures_list.update({(region, resource_type, None, configuration_id):future})
                    elif resource_type == "MySQLDbSystemDetails" and method_name == "get_db_system":
                        db_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, db_system_id=db_system_id)
                        futures_list.update({(region, resource_type, compartment_id, db_system_id):future})
                    elif resource_type == "MySQLHeatwaveCluster" and method_name == "get_heat_wave_cluster":
                        db_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, db_system_id=db_system_id)
                        futures_list.update({(region, resource_type, compartment_id, db_system_id):future})
                    elif resource_type == "NodePoolDetails" and method_name == "get_node_pool":
                        node_pool_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, node_pool_id=node_pool_id)
                        futures_list.update({(region, resource_type, None, node_pool_id):future})
                    elif resource_type == "NetworkFirewallDetails" and method_name == "get_network_firewall":
                        network_firewall_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_firewall_id=network_firewall_id)
                        futures_list.update({(region, resource_type, compartment_id, network_firewall_id):future})
                    elif resource_type == "NetworkFirewallPolicyDetails" and method_name == "get_network_firewall_policy":
                        network_firewall_policy_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_firewall_policy_id=network_firewall_policy_id)
                        futures_list.update({(region, resource_type, compartment_id, network_firewall_policy_id):future})
                    elif resource_type == "NodePoolOptions" and method_name == "get_node_pool_options":
                        node_pool_option_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, node_pool_option_id=node_pool_option_id)
                        futures_list.update({(region, resource_type, None, node_pool_option_id):future})
                    elif resource_type == "NoSQLIndexDetails" and method_name == "get_index":
                        table_id = item[2][0]
                        index_name = item[2][1]
                        future = executor.submit(self.list_resources, klass, method_name, region, table_name_or_id=table_id, index_name=index_name)
                        futures_list.update({(region, resource_type, compartment_id, (table_id, index_name)):future})
                    elif resource_type == "NoSQLTableDetails" and method_name == "get_table":
                        table_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, table_name_or_id=table_id)
                        futures_list.update({(region, resource_type, compartment_id, table_id):future})
                    elif resource_type == "OsmsManagedInstance" and method_name == "get_managed_instance":
                        managed_instance_id=item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, managed_instance_id=managed_instance_id)
                        futures_list.update({(region, resource_type, None, managed_instance_id):future})
                    elif resource_type == "VaultSecretDetails" and method_name == "get_secret":
                        secret_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, secret_id=secret_id)
                        futures_list.update({(region, resource_type, compartment_id, secret_id):future})
                    elif resource_type == "Vnic" and method_name == "get_vnic":
                        vnic_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, vnic_id=vnic_id)
                        futures_list.update({(region, resource_type, compartment_id, vnic_id):future})
                    elif resource_type == "VolumeBackupPolicyAssignment" and method_name == "get_volume_backup_policy_asset_assignment":
                        asset_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, asset_id=asset_id)
                        futures_list.update({(region, resource_type, compartment_id, asset_id):future})
                    else:
                        logger.error(f"unhandle get for resource {resource_type} in submit_list_resource_worker_requests()")

                # do a list for other resources, which is more efficient than separate get requests
                if resource_type in self.static_resource_client_methods:
                    klass, method_name = self.static_resource_client_methods[resource_type]
                    if resource_type == "ClusterOptions" and method_name == "get_cluster_options":
                        future = executor.submit(self.list_resources, klass, method_name, region, cluster_option_id="all")
                        futures_list.update({(region, resource_type, None, "all"):future})
                    elif resource_type == "CpeDeviceShape" and method_name == "list_cpe_device_shapes":
                        future = executor.submit(self.list_resources, klass, method_name, region)
                        futures_list.update({(region, resource_type, None, None):future})
                    elif resource_type == "ImageShapeCompatibility" and method_name == "list_image_shape_compatibility_entries":
                        image_id = item[2]
                        if image_id:
                            future = executor.submit(self.list_resources, klass, method_name, region, image_id=image_id)
                            futures_list.update({(region, resource_type, None, image_id):future})
                    elif resource_type == "MySQLConfiguration" and method_name == "list_configurations":
                        request_type = item[2]
                        if request_type == "DEFAULT":
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, type=["DEFAULT"])
                            futures_list.update({(region, resource_type, compartment_id, "DEFAULT"):future})
                    elif resource_type == "VirtualCircuitBandwidthShape" and method_name == "list_fast_connect_provider_virtual_circuit_bandwidth_shapes":
                        provider_service_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, provider_service_id=provider_service_id)
                        futures_list.update({(region, resource_type, None, provider_service_id):future})
                    else:
                        # all others static types
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, None):future})

                if resource_type in self.list_resource_client_methods:
                    klass, method_name = self.list_resource_client_methods[resource_type]
                    # the majority of the list methods only need the compartment
                    # id, methods that have additional required attributes are
                    # handled specifically below:
                    if resource_type == "AlertRule" and method_name == "list_alert_rules":
                        # list alert rules by budget
                        budget_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, budget_id=budget_id)
                        futures_list.update({(region, resource_type, compartment_id, budget_id):future})
                    elif resource_type == "AmsSourceApplication" and method_name == "list_source_applications":
                        source_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, source_id=source_id)
                        futures_list.update({(region, resource_type, compartment_id, source_id):future})
                    elif resource_type == "ApiGatewaySdk" and method_name == "list_sdks":
                        api_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, api_id=api_id)
                        futures_list.update({(region, resource_type, None, api_id):future})
                    elif resource_type == "AutonomousContainerDatabaseDataguardAssociation" and method_name == "list_autonomous_container_database_dataguard_associations":
                        autonomous_container_database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, adb_id=autonomous_container_database_id)
                        futures_list.update({(region, resource_type, compartment_id, autonomous_container_database_id):future})
                    elif resource_type == "AutonomousDatabaseBackup" and method_name == "list_autonomous_database_backups":
                        # TODO ? list_autonomous_database_backups can also be queried by compartment id
                        # which might get backups of ADBs that have been terminated ? TBC
                        autonomous_database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, autonomous_database_id=autonomous_database_id)
                        futures_list.update({(region, resource_type, compartment_id, autonomous_database_id):future})
                    elif resource_type == "AutonomousDatabaseDataguardAssociation" and method_name == "list_autonomous_database_dataguard_associations":
                        autonomous_database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, autonomous_database_id=autonomous_database_id)
                        futures_list.update({(region, resource_type, compartment_id, autonomous_database_id):future})
                    elif resource_type == "AutoScalingPolicy" and method_name == "list_auto_scaling_policies":
                        auto_scaling_configuration_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, auto_scaling_configuration_id=auto_scaling_configuration_id)
                        futures_list.update({(region, resource_type, compartment_id, auto_scaling_configuration_id):future})
                    elif resource_type == "Backup" and method_name == "list_backups": # Database Backup
                        database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, database_id=database_id)
                        futures_list.update({(region, resource_type, compartment_id, database_id):future})
                    elif resource_type == "BastionSession" and method_name == "list_sessions":
                        bastion_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, bastion_id=bastion_id)
                        futures_list.update({(region, resource_type, compartment_id, bastion_id):future})
                    elif resource_type == "BigDataAutoScalingConfiguration" and method_name == "list_auto_scaling_configurations":
                        bds_instance_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, bds_instance_id=bds_instance_id)
                        futures_list.update({(region, resource_type, compartment_id, bds_instance_id):future})
                    elif resource_type == "BigDataServiceApiKey" and method_name == "list_bds_api_keys":
                        bds_instance_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, bds_instance_id=bds_instance_id)
                        futures_list.update({(region, resource_type, compartment_id, bds_instance_id):future})
                    elif resource_type == "BigDataServiceMetastoreConfig" and method_name == "list_bds_metastore_configurations":
                        bds_instance_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, bds_instance_id=bds_instance_id)
                        futures_list.update({(region, resource_type, None, bds_instance_id):future})
                    elif resource_type == "Bucket" and method_name == "list_buckets":
                        namespace_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, namespace_name=namespace_name)
                        futures_list.update({(region, resource_type, compartment_id, namespace_name):future})
                    elif resource_type == "Certificate" and method_name == "list_certificates":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, None):future})
                    elif resource_type == "CertificateAuthorityVersion" and method_name == "list_certificate_authority_versions":
                        certificate_authority_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, certificate_authority_id=certificate_authority_id)
                        futures_list.update({(region, resource_type, compartment_id, certificate_authority_id):future})
                    elif resource_type == "CertificateVersion" and method_name == "list_certificate_versions":
                        certificate_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, certificate_id=certificate_id)
                        futures_list.update({(region, resource_type, compartment_id, certificate_id):future})
                    elif resource_type == "ComputeCapacityReservationInstance" and method_name == "list_compute_capacity_reservation_instances":
                        capacity_reservation_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, capacity_reservation_id=capacity_reservation_id)
                        futures_list.update({(region, resource_type, compartment_id, capacity_reservation_id):future})
                    elif resource_type == "ConsoleDashboard" and method_name == "list_dashboards":
                        dashboard_group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, dashboard_group_id=dashboard_group_id)
                        futures_list.update({(region, resource_type, compartment_id, dashboard_group_id):future})
                    elif resource_type == "CrossConnectMapping" and method_name == "list_cross_connect_mappings":
                        virtual_circuit_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, virtual_circuit_id=virtual_circuit_id)
                        futures_list.update({(region, resource_type, compartment_id, virtual_circuit_id):future})
                    elif resource_type == "CustomerDnsZone" and method_name == "list_zones":
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id) # GLOBAL
                        futures_list.update({(region, resource_type, compartment_id, "GLOBAL"):future})
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, scope="PRIVATE")
                        futures_list.update({(region, resource_type, compartment_id, "PRIVATE"):future})
                    elif resource_type == "Database" and method_name == "list_databases":
                        db_home_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, db_home_id=db_home_id)
                        futures_list.update({(region, resource_type, compartment_id, db_home_id):future})
                    elif resource_type == "DbHome" and method_name == "list_db_homes":
                        if item[2] is None:
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                            futures_list.update({(region, resource_type, compartment_id, None):future})
                        elif item[2][0] == "DbSystem":
                            db_system_id = item[2][1]
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, db_system_id=db_system_id)
                            futures_list.update({(region, resource_type, compartment_id, db_system_id):future})
                        elif item[2][0] == "VmCluster":
                            vm_cluster_id = item[2][1]
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, vm_cluster_id=vm_cluster_id)
                            futures_list.update({(region, resource_type, compartment_id, vm_cluster_id):future})
                    elif resource_type == "DbNode" and method_name == "list_db_nodes":
                        if item[2] is None:
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                            futures_list.update({(region, resource_type, compartment_id, None):future})
                        elif item[2][0] == "DbSystem":
                            db_system_id = item[2][1]
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, db_system_id=db_system_id)
                            futures_list.update({(region, resource_type, compartment_id, db_system_id):future})
                        elif item[2][0] == "VmCluster":
                            vm_cluster_id = item[2][1]
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, vm_cluster_id=vm_cluster_id)
                            futures_list.update({(region, resource_type, compartment_id, vm_cluster_id):future})
                    elif resource_type == "DedicatedVmHostInstance" and method_name == "list_dedicated_vm_host_instances":
                        dedicated_vm_host_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, dedicated_vm_host_id=dedicated_vm_host_id)
                        futures_list.update({(region, resource_type, compartment_id, dedicated_vm_host_id):future})
                    elif resource_type == "DnsPolicyAttachment" and method_name == "list_steering_policy_attachments":
                        steering_policy_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, steering_policy_id=steering_policy_id)
                        futures_list.update({(region, resource_type, compartment_id, steering_policy_id):future})
                    elif resource_type == "DnsResolverEndpoint" and method_name == "list_resolver_endpoints":
                        resolver_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, resolver_id=resolver_id)
                        futures_list.update({(region, resource_type, compartment_id, resolver_id):future})
                    elif resource_type == "DrgRouteDistribution" and method_name == "list_drg_route_distributions":
                        drg_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, drg_id=drg_id)
                        futures_list.update({(region, resource_type, compartment_id, drg_id):future})
                    elif resource_type == "DrgRouteDistributionStatement" and method_name == "list_drg_route_distribution_statements":
                        drg_route_distribution_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, drg_route_distribution_id=drg_route_distribution_id)
                        futures_list.update({(region, resource_type, compartment_id, drg_route_distribution_id):future})
                    elif resource_type == "DrgRouteRule" and method_name == "list_drg_route_rules":
                        drg_route_table_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, drg_route_table_id=drg_route_table_id)
                        futures_list.update({(region, resource_type, compartment_id, drg_route_table_id):future})
                    elif resource_type == "DrgRouteTable" and method_name == "list_drg_route_tables":
                        drg_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, drg_id=drg_id)
                        futures_list.update({(region, resource_type, compartment_id, drg_id):future})
                    elif resource_type == "EmailDkim" and method_name == "list_dkims":
                        email_domain_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, email_domain_id=email_domain_id)
                        futures_list.update({(region, resource_type, compartment_id, email_domain_id):future})
                    elif resource_type == "Export" and method_name == "list_exports":
                        file_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, file_system_id=file_system_id)
                        futures_list.update({(region, resource_type, compartment_id, file_system_id):future})
                    elif resource_type == "ExternalDatabaseConnector" and method_name == "list_external_database_connectors":
                        external_database_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, external_database_id=external_database_id)
                        futures_list.update({(region, resource_type, compartment_id, external_database_id):future})
                    elif resource_type == "FunctionsFunction" and method_name == "list_functions":
                        application_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, application_id=application_id)
                        futures_list.update({(region, resource_type, compartment_id, application_id):future})
                    elif resource_type == "Hostname" and method_name == "list_hostnames":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "IdentityProvider" and method_name == "list_identity_providers":
                        protocol = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, protocol=protocol, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, protocol):future})
                    elif resource_type == "IdentityProviderGroup" and method_name == "list_identity_provider_groups":
                        identity_provider_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, identity_provider_id=identity_provider_id)
                        futures_list.update({(region, resource_type, compartment_id, identity_provider_id):future})
                    elif resource_type == "IdpGroupMapping" and  method_name == "list_idp_group_mappings":
                        identity_provider_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, identity_provider_id=identity_provider_id)
                        futures_list.update({(region, resource_type, compartment_id, identity_provider_id):future})
                    elif resource_type == "Image" and method_name == "list_images":
                        if compartment_id:
                            # only if compartment is set, otherwise its handled above as a get request
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                            futures_list.update({(region, resource_type, compartment_id, None):future})
                    elif resource_type == "InstanceAgentAvailablePlugin" and method_name == "list_instanceagent_available_plugins":
                        if compartment_id == self.tenancy.id: # only fetch for root compartment
                            for os_version in agent_plugin_os_versions:
                                future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=self.tenancy.id, os_name=os_version[0], os_version=os_version[1])
                                futures_list.update({(region, resource_type, compartment_id, os_version):future})
                    elif resource_type == "InstanceAgentPlugin" and method_name == "list_instance_agent_plugins":
                        instanceagent_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, instanceagent_id=instanceagent_id)
                        futures_list.update({(region, resource_type, compartment_id, instanceagent_id):future})
                    elif resource_type == "IpSecConnectionTunnel" and method_name == "list_ip_sec_connection_tunnels":
                        ipsec_connection_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, ipsc_id=ipsec_connection_id)
                        futures_list.update({(region, resource_type, compartment_id, ipsec_connection_id):future})
                    elif resource_type == "Ipv6" and  method_name == "list_ipv6s":
                        subnet_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, subnet_id=subnet_id)
                        futures_list.update({(region, resource_type, compartment_id, subnet_id):future})
                    elif resource_type == "Key" and method_name == "list_keys":
                        service_endpoint = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, service_endpoint=service_endpoint, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, service_endpoint):future})
                    elif resource_type == "ListenerRule" and method_name == "list_listener_rules":
                        load_balancer_id, listener_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, load_balancer_id=load_balancer_id, listener_name=listener_name)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "LoadBalancer" and method_name == "list_backends":
                        load_balancer_id, backend_set_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id, backend_set_name=backend_set_name)
                        futures_list.update({(region, resource_type, compartment_id, (load_balancer_id, backend_set_name)):future})
                    elif resource_type == "LoadBalancer" and method_name == "list_backend_sets":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "LogAnalyticsEntity" and method_name == "list_log_analytics_entities":
                        namespace_name = self.log_analytics_namespace
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, namespace_name=namespace_name)
                        futures_list.update({(region, resource_type, compartment_id, namespace_name):future})
                    elif resource_type == "MfaTotpDevice" and method_name == "list_mfa_totp_devices":
                        user_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, user_id=user_id)
                        futures_list.update({(region, resource_type, compartment_id, user_id):future})
                    elif resource_type == "MigrationAsset" and method_name == "list_migration_assets":
                        migration_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, migration_id=migration_id)
                        futures_list.update({(region, resource_type, compartment_id, migration_id):future})
                    elif resource_type == "MySQLBackup" and method_name == "list_backups":
                        db_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, db_system_id=db_system_id)
                        futures_list.update({(region, resource_type, compartment_id, db_system_id):future})
                    elif resource_type == "MySQLConfiguration" and method_name == "list_configurations":
                        request_type = item[2]
                        if compartment_id and (request_type == None or request_type != "DEFAULT"):
                            # only fetch Custom configurations in compartments - ignores the default configuration that have no compartment
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, type=["CUSTOM"])
                            futures_list.update({(region, resource_type, compartment_id, None):future})
                    elif resource_type == "NetworkLoadBalancerBackend" and method_name == "list_backends":
                        network_load_balancer_id, backend_set_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_load_balancer_id=network_load_balancer_id, backend_set_name=backend_set_name)
                        futures_list.update({(region, resource_type, compartment_id, (load_balancer_id, backend_set_name)):future})
                    elif resource_type == "NetworkLoadBalancerBackendSet" and method_name == "list_backend_sets":
                        network_load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_load_balancer_id=network_load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "NetworkLoadBalancerListener" and method_name == "list_listeners":
                        network_load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, network_load_balancer_id=network_load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "NetworkSecurityGroupSecurityRule" and method_name == "list_network_security_group_security_rules":
                        network_security_group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_security_group_id=network_security_group_id)
                        futures_list.update({(region, resource_type, compartment_id, network_security_group_id):future})
                    elif resource_type == "NetworkSecurityGroupVnic" and method_name == "list_network_security_group_vnics":
                        network_security_group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, network_security_group_id=network_security_group_id)
                        futures_list.update({(region, resource_type, compartment_id, network_security_group_id):future})
                    elif resource_type == "NoSQLIndex" and method_name == "list_indexes":
                        table_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, table_name_or_id=table_id)
                        futures_list.update({(region, resource_type, compartment_id, table_id):future})
                    elif resource_type == "OcbAssetSourceConnection" and method_name == "list_asset_source_connections":
                        asset_source_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, asset_source_id=asset_source_id)
                        futures_list.update({(region, resource_type, compartment_id, asset_source_id):future})
                    elif resource_type == "PathRouteSet" and method_name == "list_path_route_sets":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "PreauthenticatedRequest" and method_name == "list_preauthenticated_requests":
                        bucket_name = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, namespace_name=self.object_storage_namespace, bucket_name=bucket_name)
                        futures_list.update({(region, resource_type, compartment_id, bucket_name):future})
                    elif resource_type == "PrivateIp" and method_name == "list_private_ips":
                        subnet_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, subnet_id=subnet_id)
                        futures_list.update({(region, resource_type, compartment_id, subnet_id):future})
                    elif resource_type == "PublicIp" and method_name == "list_public_ips":
                        # handle the varient cases to list regional and AD specific public ips
                        availability_domain = item[2]
                        for availability_domain in self.availability_domains[region]:
                            future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, scope="AVAILABILITY_DOMAIN", availability_domain=availability_domain, lifetime="EPHEMERAL")
                            futures_list.update({(region, resource_type, availability_domain):future})
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, scope="REGION")
                        futures_list.update({(region, resource_type, compartment_id, "REGION"):future})
                    elif resource_type == "RRSet" and method_name == "get_rr_set":
                        zone_id = item[2][0]
                        domain = item[2][1]
                        rtype = item[2][2]
                        future = executor.submit(self.list_resources, klass, method_name, region, zone_name_or_id=zone_id, domain=domain, rtype=rtype)
                        futures_list.update({(region, resource_type, compartment_id, (zone_id, domain, rtype)):future})
                    elif resource_type == "RuleSet" and method_name == "list_rule_sets":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "Snapshot" and method_name == "list_snapshots":
                        file_system_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, file_system_id=file_system_id)
                        futures_list.update({(region, resource_type, compartment_id, file_system_id):future})
                    elif resource_type == "SSLCipherSuite" and method_name == "list_ssl_cipher_suites":
                        load_balancer_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, load_balancer_id=load_balancer_id)
                        futures_list.update({(region, resource_type, compartment_id, load_balancer_id):future})
                    elif resource_type == "Tag" and method_name == "list_tags":
                        tag_namespace_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, tag_namespace_id=tag_namespace_id)
                        futures_list.update({(region, resource_type, compartment_id, tag_namespace_id):future})
                    elif resource_type == "TargetAsset" and method_name == "list_target_assets":
                        migration_plan_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, migration_plan_id=migration_plan_id)
                        futures_list.update({(region, resource_type, compartment_id, migration_plan_id):future})
                    elif resource_type == "UserGroupMembership" and method_name == "list_user_group_memberships":
                        group_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, group_id=group_id)
                        futures_list.update({(region, resource_type, compartment_id, group_id):future})
                    elif resource_type == "VaultReplica" and method_name == "list_vault_replicas":
                        vault_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, vault_id=vault_id)
                        futures_list.update({(region, resource_type, compartment_id, vault_id):future})
                    elif resource_type == "VmCluster" and method_name == "list_vm_clusters":
                        exadata_infrastructure_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, exadata_infrastructure_id=exadata_infrastructure_id)
                        futures_list.update({(region, resource_type, compartment_id, exadata_infrastructure_id):future})
                    elif resource_type == "VmClusterNetwork" and method_name == "list_vm_cluster_networks":
                        exadata_infrastructure_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, exadata_infrastructure_id=exadata_infrastructure_id)
                        futures_list.update({(region, resource_type, compartment_id, exadata_infrastructure_id):future})
                    elif resource_type == "VmwareEsxiHost" and method_name == "list_esxi_hosts":
                        sddc_id = item[2]
                        future = executor.submit(self.list_resources, klass, method_name, region, sddc_id=sddc_id)
                        futures_list.update({(region, resource_type, compartment_id, sddc_id):future})
                    elif method_name in [
                        "list_block_volume_replicas",
                        "list_boot_volumes",
                        "list_boot_volume_attachments",
                        "list_boot_volume_replicas",
                        "list_export_sets",
                        "list_file_systems",
                        "list_instances",
                        "list_mount_targets",
                        "list_volume_group_replicas",
                    ]:
                        # need to provide the availability domain when listing instances,
                        # boot volumes, file systems, ...
                        # availability_domain = item[2]
                        availability_domain = None # using `None` will get resource across all ADs which is more efficient (note the query executor will remove duplicates requests)
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id, availability_domain=availability_domain)
                        futures_list.update({(region, resource_type, compartment_id, availability_domain):future})
                    else:
                        # all other resources
                        future = executor.submit(self.list_resources, klass, method_name, region, compartment_id=compartment_id)
                        futures_list.update({(region, resource_type, compartment_id, None):future})

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

                    if resource_type == "AutoScalingPolicy":
                        # map Auto Scaling Policy into extended verison parent id
                        new_result = [ExtendedAutoScalingPolicySummary(future[3],policy) for policy in result]
                        result = new_result
                    elif resource_type == "DbNode":
                        # map DbNode into extended verison with compartment id
                        if future[3].startswith("ocid1.vmcluster"):
                            new_result = [ExtendedDbNodeSummary(future[3],dbnode) for dbnode in result]
                            result = new_result
                    elif resource_type == "DrgRouteDistributionStatement":
                        # map DrgRouteDistributionStatement to ExtendedDrgRouteDistributionStatement
                        new_result = [ExtendedDrgRouteDistributionStatement(future[2],future[3],statement) for statement in result]
                        result = new_result
                    elif resource_type == "DrgRouteRule":
                        # map DrgRouteRule to ExtendedDrgRouteRule
                        new_result = [ExtendedDrgRouteRule(future[2],future[3],rule) for rule in result]
                        result = new_result
                    elif resource_type == "Export":
                        # map Export into extended verison with compartment id
                        new_result = [ExtendedExportSummary(future[2],export) for export in result]
                        result = new_result
                    elif resource_type == "InstanceAgentAvailablePlugin":
                        # map InstanceAgentAvailablePlugin to ExtendedAvailablePluginSummary
                        new_result = [ExtendedAvailablePluginSummary(future[3][0], future[3][1], plugin) for plugin in result]
                        result = new_result
                    elif resource_type == "InstanceAgentPlugin":
                        # map InstanceAgentPlugin to ExtendedInstanceAgentPlugin
                        new_result = [ExtendedInstanceAgentPluginSummary(future[2], future[3], plugin) for plugin in result]
                        result = new_result
                    elif resource_type == "MySQLBackup":
                        # map MySQL Backup into extended version with compartment id
                        new_result = [ExtendedMySQLBackupSummary(future[2],backup) for backup in result]
                        result = new_result
                    elif resource_type == "NoSQLIndex":
                        # map NoSQL Index into extended version with compartment id and table id
                        new_result = [ExtendedNoSQLIndexSummary(future[2], future[3], index) for index in result]
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
                    elif resource_type == "RRSet":
                        # map RRSet to ExtendedRRSet
                        if len(result.items) > 0:
                            compartment_id = future[2]
                            zone_id = future[3][0]
                            new_result = ExtendedRRSet(compartment_id, zone_id, result)
                            result = [new_result]
                        else:
                            result = []
                    elif resource_type == "Tag":
                        # map Tag to ExtendedTagSummary
                        compartment_id = future[2]
                        tag_namespace_id = future[3]
                        new_result = [ExtendedTagSummary(compartment_id, tag_namespace_id, tag) for tag in result]
                        result = new_result
                    elif resource_type == "VirtualCircuitBandwidthShape":
                        fastconnect_provider_id = future[3]
                        new_result = [ExtendedVirtualCircuitBandwidthShape(fastconnect_provider_id, shape) for shape in result]
                        result = new_result
                    elif resource_type in [
                        "ApiGatewayUsagePlanDetails",
                        "AutoScalingConfigurationDetails",
                        "BastionDetails",
                        "ClusterDetails",
                        "ClusterOptions",
                        "DataFlowApplicationDetails", "DataFlowRunDetails",
                        "ExportSetDetails",
                        "Image",
                        "InstanceConfigurationDetails", "InstancePoolDetails",
                        "MySQLConfiguration", "MySQLDbSystemDetails", "MySQLHeatwaveCluster",
                        "NetworkFirewallDetails", "NetworkFirewallPolicyDetails",
                        "NodePoolDetails", "NodePoolOptions",
                        "NoSQLIndexDetails", "NoSQLTableDetails",
                        "OsmsManagedInstance",
                        "VaultSecretDetails",
                    ]:
                        # if the response is from a get request, wrap it in a list
                        if type(result) is not list:
                            result = [result]
                    elif resource_type == "Vnic":
                        result = [result]

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
            except oci.exceptions.RequestException as re:
                logger.warn(("get_resources()", future, re))
                failed_requests.append(future)
            except TimeoutError as te:
                logger.error(("get_resources()", future, te, self.timeout))
                failed_requests.append(future)
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
                for resource_type in retry_results[region]:
                    if region not in results:
                        results[region] = {}
                    if resource_type in results[region]:
                        results[region][resource_type].extend(retry_results[region][resource_type])
                    else:
                        results[region][resource_type] = retry_results[region][resource_type]

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

        # cache compartments that have KMS keys
        kms_key_compartments_by_region = dict()

        for region in resources:
            regional_resource_requests = set()
            kms_key_compartments_by_region[region] = set()

            if self.include_resource_types != None and "Image" in self.include_resource_types:
                # If Image is specifically requested search for platform images in the root Compartment
                regional_resource_requests.add(("Image", self.tenancy.id, None))

            if self.include_resource_types != None and "NodePoolOptions" in self.include_resource_types:
                # If NodePoolOptions is specifically requested search for all configurations
                regional_resource_requests.add(("NodePoolOptions", None, "all"))

            if self.include_resource_types != None and "VolumeBackupPolicy" in self.include_resource_types:
                # If VolumeBackupPolicy is specifically requested search for platform policies where Compartment is None
                regional_resource_requests.add(("VolumeBackupPolicy", None, None))

            if self.include_resource_types and "MySQLConfiguration" in self.include_resource_types:
                # add search for MySQLConfiguration in tenancy to get the default configurations that are
                # not included in the per compartment results.
                regional_resource_requests.add(("MySQLConfiguration", self.tenancy.id, "DEFAULT"))

            # get static/read-only resources
            for ro_resource_type in OciResourceDiscoveryClient.static_resource_client_methods:
                if self.include_resource_types and ro_resource_type in self.include_resource_types and ro_resource_type not in ["VirtualCircuitBandwidthShape"]:
                    # always add search for these resources in the root compartment
                    regional_resource_requests.add((ro_resource_type, self.tenancy.id, None))

            for resource in resources[region]:
                # special case for Vnic which doesn't have a list method
                if resource.resource_type == "Vnic":
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, resource.identifier))

                # handle list resource query varient cases
                if resource.resource_type in ["BootVolume", "FileSystem", "FssReplication", "FssReplicationTarget", "Instance", "MountTarget"]:
                    # list by avaiability domain
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, resource.availability_domain))
                elif resource.resource_type == "Bucket":
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, self.object_storage_namespace))
                elif resource.resource_type == "IdentityProvider":
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, "SAML2"))
                # elif resource.resource_type == "PrivateIp":
                #     # skip private ips, fetch private ips per subnet instead (below)
                #     pass
                elif resource.resource_type == "Key":
                    # KMS vault keys need special handling. Keys have to be fetched using the Vault specific service endpoint,
                    # but the RQS results have the key id and compartment but no details of the vault it is contained in.
                    # To ensure we find all keys we need to `list_keys` for each vault that is found across compartments that
                    # contain keys.
                    # Build up a list of compartments containing keys here for use later
                    kms_key_compartments_by_region[region].add(resource.compartment_id)
                else:
                    # for all other resources
                    regional_resource_requests.add((resource.resource_type, resource.compartment_id, None))

                # handle special cases
                if resource.resource_type == "Instance" and self.include_resource_types and "OsmsManagedInstance" in self.include_resource_types:
                    # get Managed Instance for Instance
                    # only fetch when explictly requested (as it has to be fetched for every instance and can be slow)
                    regional_resource_requests.add(("OsmsManagedInstance", resource.compartment_id, resource.identifier))

                # handle parent/child resources
                if resource.resource_type == "AmsSource" and (self.include_resource_types == None or "AmsSourceApplication" in self.include_resource_types):
                    regional_resource_requests.add(("AmsSourceApplication", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "ApiGatewayApi" and (self.include_resource_types == None or "ApiGatewaySdk" in self.include_resource_types):
                    regional_resource_requests.add(("ApiGatewaySdk", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "AutonomousContainerDatabase" and (self.include_resource_types == None or "AutonomousContainerDatabaseDataguardAssociation" in self.include_resource_types):
                    regional_resource_requests.add(("AutonomousContainerDatabaseDataguardAssociation", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "AutonomousDatabase":
                    if self.include_resource_types == None or "AutonomousDatabaseBackup" in self.include_resource_types:
                        regional_resource_requests.add(("AutonomousDatabaseBackup", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "AutonomousDatabaseDataguardAssociation" in self.include_resource_types:
                        regional_resource_requests.add(("AutonomousDatabaseDataguardAssociation", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "AutoScalingConfiguration" and (self.include_resource_types == None or "AutoScalingPolicy" in self.include_resource_types):
                    regional_resource_requests.add(("AutoScalingPolicy", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Bastion" and (self.include_resource_types == None or "BastionSession" in self.include_resource_types):
                    regional_resource_requests.add(("BastionSession", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "BigDataService" and (self.include_resource_types == None or "BigDataServiceMetastoreConfig" in self.include_resource_types):
                    regional_resource_requests.add(("BigDataServiceMetastoreConfig", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Bucket" and (self.include_resource_types == None or "PreauthenticatedRequest" in self.include_resource_types):
                    regional_resource_requests.add(("PreauthenticatedRequest", resource.compartment_id, resource.display_name))
                elif resource.resource_type == "Budget" and (self.include_resource_types == None or "AlertRule" in self.include_resource_types):
                    regional_resource_requests.add(("AlertRule", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Certificate" and (self.include_resource_types == None or "CertificateVersion" in self.include_resource_types):
                    regional_resource_requests.add(("CertificateVersion", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "CertificateAuthority" and (self.include_resource_types == None or "CertificateAuthorityVersion" in self.include_resource_types):
                    regional_resource_requests.add(("CertificateAuthority", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "CloudVmClsuter" and (self.include_resource_types == None or "ExadataIormConfig" in self.include_resource_types):
                    regional_resource_requests.add(("ExadataIormConfig", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "ComputeCapacityReservation" and (self.include_resource_types == None or "ComputeCapacityReservationInstance" in self.include_resource_types):
                    regional_resource_requests.add(("ComputeCapacityReservationInstance", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "DbSystem":
                    if self.include_resource_types == None or "DbNode" in self.include_resource_types:
                        regional_resource_requests.add(("DbNode", resource.compartment_id, ("DbSystem", resource.identifier)))
                    if self.include_resource_types == None or "DbHome" in self.include_resource_types:
                        regional_resource_requests.add(("DbHome", resource.compartment_id, ("DbSystem", resource.identifier)))
                    if self.include_resource_types == None or "Backup" in self.include_resource_types:
                        regional_resource_requests.add(("Backup", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "DbKeyStore" in self.include_resource_types:
                        regional_resource_requests.add(("DbKeyStore", resource.compartment_id, None))
                elif resource.resource_type == "DedicatedVmHost" and (self.include_resource_types == None or "DedicatedVmHostInstance" in self.include_resource_types):
                    regional_resource_requests.add(("DedicatedVmHostInstance", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Drg":
                    if self.include_resource_types == None or "DrgRouteTable" in self.include_resource_types:
                        regional_resource_requests.add(("DrgRouteTable", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "DrgRouteDistribution" in self.include_resource_types:
                        regional_resource_requests.add(("DrgRouteDistribution", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "DrgRouteDistribution" and (self.include_resource_types == None or "DrgRouteDistributionStatement" in self.include_resource_types):
                    regional_resource_requests.add(("DrgRouteDistributionStatement", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "DrgRouteTable" and (self.include_resource_types == None or "DrgRouteRule" in self.include_resource_types):
                    regional_resource_requests.add(("DrgRouteRule", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "DnsResolver" and (self.include_resource_types == None or "DnsResolverEndpoint" in self.include_resource_types):
                    regional_resource_requests.add(("DnsResolverEndpoint", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "ExadataInfrastructure":
                    if self.include_resource_types == None or "VmCluster" in self.include_resource_types:
                        regional_resource_requests.add(("VmCluster", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "VmClusterNetwork" in self.include_resource_types:
                        regional_resource_requests.add(("VmClusterNetwork", resource.compartment_id, resource.identifier))
                elif resource.resource_type in ["ExternalContainerDatabase", "ExternalNonContainerDatabase", "ExternalPluggableDatabase"]:
                    if self.include_resource_types == None or "ExternalDatabaseConnector" in self.include_resource_types:
                        regional_resource_requests.add(("ExternalDatabaseConnector", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "FileSystem":
                    if self.include_resource_types == None or "Export" in self.include_resource_types:
                        regional_resource_requests.add(("Export", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "ExportSet" in self.include_resource_types:
                        regional_resource_requests.add(("ExportSet", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "FunctionsApplication" and (self.include_resource_types == None or "FunctionsFunction" in self.include_resource_types):
                    regional_resource_requests.add(("FunctionsFunction", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Group" and (self.include_resource_types == None or "UserGroupMembership" in self.include_resource_types):
                    regional_resource_requests.add(("UserGroupMembership", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "IdentityProvider":
                    if self.include_resource_types == None or "IdentityProviderGroup" in self.include_resource_types:
                        regional_resource_requests.add(("IdentityProviderGroup", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "IdpGroupMapping" in self.include_resource_types:
                        regional_resource_requests.add(("IdpGroupMapping", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Instance":
                    if self.include_resource_types == None or "BootVolumeAttachment" in self.include_resource_types:
                        regional_resource_requests.add(("BootVolumeAttachment", resource.compartment_id, resource.availability_domain))
                    if self.include_resource_types == None or "InstanceAgentPlugin" in self.include_resource_types:
                        regional_resource_requests.add(("InstanceAgentPlugin", resource.compartment_id, resource.identifier))
                    if self.include_resource_types == None or "VnicAttachment" in self.include_resource_types:
                        regional_resource_requests.add(("VnicAttachment", resource.compartment_id, None))
                    if self.include_resource_types == None or "VolumeAttachment" in self.include_resource_types:
                        regional_resource_requests.add(("VolumeAttachment", resource.compartment_id, None))
                elif resource.resource_type == "IpSecConnection" and (self.include_resource_types == None or "IpSecConnectionTunnel" in self.include_resource_types):
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
                elif resource.resource_type == "Migration" and (self.include_resource_types == None or "MigrationAsset" in self.include_resource_types):
                    regional_resource_requests.add(("MigrationAsset", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "MigrationPlan" and (self.include_resource_types == None or "TargetAsset" in self.include_resource_types):
                    regional_resource_requests.add(("TargetAsset", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "MountTarget" and (self.include_resource_types == None or "ExportSet" in self.include_resource_types):
                    regional_resource_requests.add(("ExportSet", resource.compartment_id, resource.availability_domain))
                elif resource.resource_type == "NetworkLoadBalancer":
                    pass
                    # No need to fetch child resource are they are included in the load balancer response
                    # if self.include_resource_types == None or "NetworkLoadBalancerBackendSet" in self.include_resource_types:
                    #     regional_resource_requests.add(("NetworkLoadBalancerBackendSet", resource.compartment_id, resource.identifier))
                    # if self.include_resource_types == None or "NetworkLoadBalancerListener" in self.include_resource_types:
                    #     regional_resource_requests.add(("NetworkLoadBalancerListener", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "NetworkSecurityGroup" and (self.include_resource_types == None or "NetworkSecurityGroupSecurityRule" in self.include_resource_types):
                    regional_resource_requests.add(("NetworkSecurityGroupSecurityRule", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "NetworkSecurityGroup" and (self.include_resource_types == None or "NetworkSecurityGroupVnic" in self.include_resource_types):
                    regional_resource_requests.add(("NetworkSecurityGroupVnic", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "NoSQLTable" and (self.include_resource_types == None or "NoSQLIndex" in self.include_resource_types):
                    regional_resource_requests.add(("NoSQLIndex", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "OcbAssetSource" and (self.include_resource_types == None or "OcbAssetSourceConnection" in self.include_resource_types):
                    regional_resource_requests.add(("OcbAssetSourceConnection", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "SteeringPolicy" and (self.include_resource_types == None or "SteeringPolicyAttachment" in self.include_resource_types):
                    regional_resource_requests.add(("SteeringPolicyAttachment", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Subnet":
                    if (self.include_resource_types == None or "PrivateIp" in self.include_resource_types):
                        regional_resource_requests.add(("PrivateIp", resource.compartment_id, resource.identifier))
                    if (self.include_resource_types == None or "PrivateIp" in self.include_resource_types):
                        regional_resource_requests.add(("Ipv6", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "TagNamespace" and (self.include_resource_types == None or "Tag" in self.include_resource_types):
                    regional_resource_requests.add(("Tag", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "User" and (self.include_resource_types == None or "MfaTotpDevice" in self.include_resource_types):
                    regional_resource_requests.add(("MfaTotpDevice", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "Vault" and (self.include_resource_types == None or "VaultReplica" in self.include_resource_types):
                    regional_resource_requests.add(("VaultReplica", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "VirtualCircuit" and (self.include_resource_types == None or "CrossConnectMapping" in self.include_resource_types):
                    regional_resource_requests.add(("CrossConnectMapping", resource.compartment_id, resource.identifier))
                elif resource.resource_type == "VmCluster":
                    if self.include_resource_types == None or "DbNode" in self.include_resource_types:
                        regional_resource_requests.add(("DbNode", resource.compartment_id, ("VmCluster", resource.identifier)))
                    if self.include_resource_types == None or "DbHome" in self.include_resource_types:
                        regional_resource_requests.add(("DbHome", resource.compartment_id, ("VmCluster", resource.identifier)))
                elif resource.resource_type == "VmwareSddc" and (self.include_resource_types == None or "VmwareEsxiHost" in self.include_resource_types):
                    regional_resource_requests.add(("VmwareEsxiHost", resource.compartment_id, resource.identifier))
                elif resource.resource_type in ["Volume", "BootVolume", "VolumeGroup"] and (self.include_resource_types == None or "VolumeBackupPolicyAssignment" in self.include_resource_types):
                    regional_resource_requests.add(("VolumeBackupPolicyAssignment", resource.compartment_id, resource.identifier))

            resource_requests.update({region:regional_resource_requests})

        # for each resource not supported by search, perform a brute force iteration
        # over all compartments in all regions - this can take a long time for
        # tenancies with lots of compartments so we limit to only fetch resources
        # types that are specifically requested
        for region in self.regions:
            brute_force_requests = set()

            resource_types = {
                "AlarmStatus",
                "AmsMigration", "AmsSource", "AmsSourceApplication", # Force a search across all compartments
                "Backup", # Database Backups. Force a search across all compartments to find unattached backups.
                "Cluster", "NodePool", # OKE
                "DataFlowPrivateEndpoint", # Data Flow
                "DataSafeOnPremConnector", # Data Safe
                "DnsView", # BUG? not getting DnsView results returned from RQS, so need to manually query all compartments
                "EmailSuppression", # Email
                "InstanceAgentAvailablePlugin", # InstanceAgentAvailablePlugin
                "LogGroup", "LogSavedSearch", # Loging
                "ManagementDashboard", "ManagementSavedSearch", # Dashboard
                "MySQLDbSystem", "MySQLChannel", "MySQLConfiguration", # MySQL
                "NetworkFirewall", # BUG? network firewall is not getting returned from RQS, so need to manually query all compartments
                "NetworkLoadBalancer", # BUG? network loadbalancer is not getting returned from RQS, so need to manually query all compartments
                "DatabaseInsight", "SQLPlan", "SQLSearch", "SQLText", # OperationalInsight
                "RoverCluster", "RoverEntitlement", "RoverNode", # Roving Edge
                "StreamPool", # Streams
            }

            # only fetch additional resource types if explictly included
            resource_types = resource_types.intersection(set(self.include_resource_types)) if self.include_resource_types else []
            for resource_type in resource_types:
                # search in the root compartment
                brute_force_requests.add((resource_type, self.tenancy.id, None))
                # search all child compartments
                for compartment_id in self.compartments if self.compartments else [compartment.id for compartment in self.all_compartments]:
                    brute_force_requests.add((resource_type, compartment_id, None))

            # TODO temp fix for region missing
            if region.region_name not in resource_requests:
                resource_requests[region.region_name] = {}

            resource_requests[region.region_name].update(brute_force_requests)

        resources_by_region = self.get_resources(resource_requests)

        # special cases
        if self.include_resource_types and "GiVersion" in self.include_resource_types:
            for region in self.regions:
                resources_by_region[region.region_name]["GiVersion"] = self.list_gi_versions_by_shape(region)

        # get additional resource details
        # this currently needs all regions to complete the first query before starting the next set of requests
        # TODO opportunity to future optimization
        extra_resource_requests = dict()
        for region in resources_by_region:
            regional_resource_requests = set()
            # get FastConnect circuit shapes
            for fastconnect_provider in resources_by_region[region]["FastConnectProviderService"] if (self.include_resource_types == None or "VirtualCircuitBandwidthShape" in self.include_resource_types) and "FastConnectProviderService" in resources_by_region[region] else []:
                regional_resource_requests.add(("VirtualCircuitBandwidthShape", None, fastconnect_provider.id))
            # find kms keys for a vault
            for vault in resources_by_region[region]["Vault"] if "Vault" in resources_by_region[region] and (self.include_resource_types == None or "Key" in self.include_resource_types) else []:
                # as we don't know which compartment the keys are in we need to search across all compartments we know contain keys
                if vault.lifecycle_state == "ACTIVE":
                    for compartment_id in kms_key_compartments_by_region[region]:
                        regional_resource_requests.add(("Key", compartment_id, vault.management_endpoint))
            # find references to images that are not in the image results and do an explict get
            for instance in resources_by_region[region]["Instance"] if (self.include_resource_types == None or "Image" in self.include_resource_types) and "Instance" in resources_by_region[region] and "Image" in resources_by_region[region] else []:
                image_ids = [image.id for image in resources_by_region[region]["Image"]]
                if instance.source_details.source_type == "image" and instance.source_details.image_id not in image_ids:
                    regional_resource_requests.add(("Image", None, instance.source_details.image_id))
            # find references to images that are not in the image results and do an explict get
            for boot_volume_backup in resources_by_region[region]["BootVolumeBackup"] if (self.include_resource_types == None or "Image" in self.include_resource_types) and "BootVolumeBackup" in resources_by_region[region] and "Image" in resources_by_region[region] else []:
                image_ids = [image.id for image in resources_by_region[region]["Image"]]
                if boot_volume_backup.image_id not in image_ids:
                    regional_resource_requests.add(("Image", None, boot_volume_backup.image_id))
            # find references to images that are in teh NodePoolOption sources and go an explict get
            for node_pool_option in resources_by_region[region]["NodePoolOptions"] if (self.include_resource_types == None or "Image" in self.include_resource_types) and "NodePoolOptions" in resources_by_region[region] else []:
                image_ids = [source.image_id for source in node_pool_option.sources]
                for image_id in image_ids:
                    logger.debug(image_id)
                    regional_resource_requests.add(("Image", None, image_id))
            # get RRSets for Dns Zones
            for dns_zone in resources_by_region[region]["CustomerDnsZone"] if "CustomerDnsZone" in resources_by_region[region] and (self.include_resource_types == None or "RRSet" in self.include_resource_types) else []:
                for record_type in dns_record_types:
                    regional_resource_requests.add(("RRSet", dns_zone.compartment_id, (dns_zone.id, dns_zone.name, record_type)))
            # get extra details for ApiGatewayUsagePlanDetails
            if "ApiGatewayUsagePlan" in resources_by_region[region]:
                for resource in resources_by_region[region]["ApiGatewayUsagePlan"]:
                    regional_resource_requests.add(("ApiGatewayUsagePlanDetails", None, resource.id))
            # get extra details for AutoScalingConfiguration
            if "AutoScalingConfiguration" in resources_by_region[region]:
                for resource in resources_by_region[region]["AutoScalingConfiguration"]:
                    regional_resource_requests.add(("AutoScalingConfigurationDetails", resource.compartment_id, resource.id))
            # get extra details for Bastion
            if "Bastion" in resources_by_region[region]:
                for resource in resources_by_region[region]["Bastion"]:
                    regional_resource_requests.add(("BastionDetails", resource.compartment_id, resource.id))
            # get extra details for Cluster
            if "Cluster" in resources_by_region[region]:
                for resource in resources_by_region[region]["Cluster"]:
                    regional_resource_requests.add(("ClusterDetails", resource.compartment_id, resource.id))
            # get extra details for DataFlowApplication
            if "DataFlowApplication" in resources_by_region[region]:
                for resource in resources_by_region[region]["DataFlowApplication"]:
                    regional_resource_requests.add(("DataFlowApplicationDetails", resource.compartment_id, resource.id))
            # get extra details for DataFlowRun
            if "DataFlowRun" in resources_by_region[region]:
                for resource in resources_by_region[region]["DataFlowRun"]:
                    regional_resource_requests.add(("DataFlowRunDetails", resource.compartment_id, resource.id))
            # get extra details for ExportSet
            if "ExportSet" in resources_by_region[region]:
                for resource in resources_by_region[region]["ExportSet"]:
                    regional_resource_requests.add(("ExportSetDetails", resource.compartment_id, resource.id))
            # get extra details for InstanceConfiguration
            if "InstanceConfiguration" in resources_by_region[region]:
                for resource in resources_by_region[region]["InstanceConfiguration"]:
                    regional_resource_requests.add(("InstanceConfigurationDetails", resource.compartment_id, resource.id))
            # get extra details for InstancePool
            if "InstancePool" in resources_by_region[region]:
                for resource in resources_by_region[region]["InstancePool"]:
                    regional_resource_requests.add(("InstancePoolDetails", resource.compartment_id, resource.id))
            # get extra details for MySQLDbSystems
            if "MySQLDbSystem" in resources_by_region[region]:
                for mysql_db_system in resources_by_region[region]["MySQLDbSystem"]:
                    regional_resource_requests.add(("MySQLDbSystemDetails", mysql_db_system.compartment_id, mysql_db_system.id))
                    if (self.include_resource_types == None or "MySQLBackup" in self.include_resource_types):
                        regional_resource_requests.add(("MySQLBackup", mysql_db_system.compartment_id, mysql_db_system.id))
                    if (self.include_resource_types == None or "MySQLHeatwaveCluster" in self.include_resource_types):
                        regional_resource_requests.add(("MySQLHeatwaveCluster", mysql_db_system.compartment_id, mysql_db_system.id))
            # get extra details for NetworkFirewall
            if "NetworkFirewall" in resources_by_region[region]:
                for resource in resources_by_region[region]["NetworkFirewall"]:
                    regional_resource_requests.add(("NetworkFirewallDetails", None, resource.id))
            # get extra details for NetworkFirewallPolicy
            if "NetworkFirewallPolicy" in resources_by_region[region]:
                for resource in resources_by_region[region]["NetworkFirewallPolicy"]:
                    regional_resource_requests.add(("NetworkFirewallPolicyDetails", None, resource.id))
            # get extra details for NodePool
            if "NodePool" in resources_by_region[region]:
                for resource in resources_by_region[region]["NodePool"]:
                    regional_resource_requests.add(("NodePoolDetails", resource.compartment_id, resource.id))
            # get extra details for NoSQLndex
            if "NoSQLIndex" in resources_by_region[region]:
                for resource in resources_by_region[region]["NoSQLIndex"]:
                    regional_resource_requests.add(("NoSQLIndexDetails", resource.compartment_id, (resource.table_id, resource.name)))
            # get extra details for NoSQLTable
            if "NoSQLTable" in resources_by_region[region]:
                for resource in resources_by_region[region]["NoSQLTable"]:
                    regional_resource_requests.add(("NoSQLTableDetails", None, resource.id))
            if "VaultSecret" in resources_by_region[region]:
                for resource in resources_by_region[region]["VaultSecret"]:
                    regional_resource_requests.add(("VaultSecretDetails", resource.compartment_id, resource.id))
            extra_resource_requests.update({region:regional_resource_requests})

        second_pass_resources_by_region = self.get_resources(extra_resource_requests)

        # merge the responses
        for region in second_pass_resources_by_region:
            for resource_type in second_pass_resources_by_region[region]:
                if resource_type in resources_by_region[region]:
                    # merge
                    resources_by_region[region][resource_type].extend(second_pass_resources_by_region[region][resource_type])
                else:
                    # add
                    resources_by_region[region][resource_type] = second_pass_resources_by_region[region][resource_type]

        # and again... repeat for one more round of queries:
        final_resource_requests = dict()
        for region in resources_by_region:
            third_pass_resources_by_region = set()
            # get extra details for MySQLDbSystems Details
            if "MySQLDbSystemDetails" in resources_by_region[region]:
                for mysql_db_system in resources_by_region[region]["MySQLDbSystemDetails"] if (self.include_resource_types == None or "MySQLConfiguration" in self.include_resource_types) else []:
                    third_pass_resources_by_region.add(("MySQLConfiguration", mysql_db_system.compartment_id, mysql_db_system.configuration_id))
            if "DbHome" in resources_by_region[region]:
                for db_home in resources_by_region[region]["DbHome"] if (self.include_resource_types == None or "Database" in self.include_resource_types) else []:
                    third_pass_resources_by_region.add(("Database", db_home.compartment_id, db_home.id))
            # if requested, get ImageShapeCompatibility for Images
            if "Image" in resources_by_region[region] and (self.include_resource_types != None and "ImageShapeCompatibility" in self.include_resource_types):
                for image in resources_by_region[region]["Image"]:
                    third_pass_resources_by_region.add(("ImageShapeCompatibility", None, image.id))

            final_resource_requests.update({region:third_pass_resources_by_region})

        final_resources_by_region = self.get_resources(final_resource_requests)

        # merge the responses
        for region in final_resources_by_region:
            for resource_type in final_resources_by_region[region]:
                if resource_type in resources_by_region[region]:
                    # merge
                    resources_by_region[region][resource_type].extend(final_resources_by_region[region][resource_type])
                else:
                    # add
                    resources_by_region[region][resource_type] = final_resources_by_region[region][resource_type]

        for region in resources_by_region:
            # replace summary result with resource details
            self.replace_resource_details(resources_by_region, region, "ApiGatewayUsagePlan", "ApiGatewayUsagePlanDetails")
            self.replace_resource_details(resources_by_region, region, "AutoScalingConfiguration", "AutoScalingConfigurationDetails")
            self.replace_resource_details(resources_by_region, region, "Bastion", "BastionDetails")
            self.replace_resource_details(resources_by_region, region, "Cluster", "ClusterDetails")
            self.replace_resource_details(resources_by_region, region, "DataFlowApplication", "DataFlowApplicationDetails")
            self.replace_resource_details(resources_by_region, region, "DataFlowRun", "DataFlowRunDetails")
            self.replace_resource_details(resources_by_region, region, "ExportSet", "ExportSetDetails")
            self.replace_resource_details(resources_by_region, region, "InstanceConfiguration", "InstanceConfigurationDetails")
            self.replace_resource_details(resources_by_region, region, "InstancePool", "InstancePoolDetails")
            self.replace_resource_details(resources_by_region, region, "MySQLDbSystem", "MySQLDbSystemDetails")
            self.replace_resource_details(resources_by_region, region, "NodePool", "NodePoolDetails")
            self.replace_resource_details(resources_by_region, region, "NoSQLIndex", "NoSQLIndexDetails")
            self.replace_resource_details(resources_by_region, region, "NoSQLTable", "NoSQLTableDetails")
            self.replace_resource_details(resources_by_region, region, "NetworkFirewall", "NetworkFirewallDetails")
            self.replace_resource_details(resources_by_region, region, "NetworkFirewallPolicy", "NetworkFirewallPolicyDetails")
            self.replace_resource_details(resources_by_region, region, "VaultSecret", "VaultSecretDetails")

        if len(resources_by_region) == 0:
            logger.warn("Resource discovery results are empty")  

        # remove duplicate shapes
        # For multi-AD regions the list_shapes method returns shapes per AD, but does not distinguish which shape
        # applies to which AD so there are multiple identical shape definitions in the response.
        # Reduce the shape list to a unique set of shapes for the region.
        for region in resources_by_region:
            if "Shape" in resources_by_region[region]:
                unique_shapes = dict()
                for shape in resources_by_region[region]["Shape"]:
                    unique_shapes[shape.shape] = shape
                resources_by_region[region]["Shape"] = list(unique_shapes.values())

        # remove duplicate platform images
        # For every compartment that has a custom image the list_images method also returns the full list of platform
        # images, resulting in duplicate entries in the conbined result set.
        # Reduce to a unique set of images for the region.
        for region in resources_by_region:
            if "Image" in resources_by_region[region]:
                unique_images = dict()
                for image in resources_by_region[region]["Image"]:
                    unique_images[image.id] = image
                resources_by_region[region]["Image"] = list(unique_images.values())

        return resources_by_region

    @staticmethod
    def replace_resource_details(resources_by_region, region, summary_type, details_type):
        # replace summary with details
        if details_type in resources_by_region[region]:
            resources = resources_by_region[region][details_type]
            del resources_by_region[region][summary_type]
            del resources_by_region[region][details_type]
            resources_by_region[region][summary_type] = resources

    # special method to get Database Grid Infrastructure versions
    # need to get Db Shapes and requst GI version for each shape separately
    def list_gi_versions_by_shape(self, region=None):
        logger.info("fetching database gi versions")
        config = self.config
        if region:
            config["region"] = region.region_name
        database = oci.database.DatabaseClient(config=config, signer=self.signer)
        shapes = database.list_db_system_shapes(compartment_id=self.tenancy.id)
        results = {}
        for shape in [s for s in shapes.data if s.shape_family == "EXADATA"]:
            gi_versions = database.list_gi_versions(compartment_id=self.tenancy.id, shape=shape.shape)
            results[shape.shape] = gi_versions.data
        return results
