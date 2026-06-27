import { describe, expect, it } from 'vitest'

import { resourceAttributes, resourceMap } from '../src/importer/data/OciResourceMap'
import { elementOverrides } from '../src/importer/data/OciElementOverrides'

const curatedBatch = [
    {
        terraformType: 'oci_adm_knowledge_base',
        modelType: 'adm_knowledge_base',
        requiredAttributes: ['display_name'],
    },
    {
        terraformType: 'oci_adm_vulnerability_audit',
        modelType: 'adm_vulnerability_audit',
        requiredAttributes: ['knowledge_base_id', 'build_type', 'source.type'],
    },
    {
        terraformType: 'oci_adm_remediation_recipe',
        modelType: 'adm_remediation_recipe',
        requiredAttributes: ['display_name', 'knowledge_base_id', 'scm_configuration.branch'],
    },
    {
        terraformType: 'oci_adm_remediation_run',
        modelType: 'adm_remediation_run',
        requiredAttributes: ['display_name', 'remediation_recipe_id'],
    },
    {
        terraformType: 'oci_ai_document_project',
        modelType: 'ai_document_project',
        requiredAttributes: ['display_name', 'description'],
    },
    {
        terraformType: 'oci_ai_document_model',
        modelType: 'ai_document_model',
        requiredAttributes: ['display_name', 'model_type', 'project_id', 'training_dataset.dataset_type'],
    },
    {
        terraformType: 'oci_ai_language_model',
        modelType: 'ai_language_model',
        requiredAttributes: ['display_name', 'project_id', 'model_details.model_type', 'training_dataset.dataset_type'],
    },
    {
        terraformType: 'oci_ai_anomaly_detection_ai_private_endpoint',
        modelType: 'ai_anomaly_detection_private_endpoint',
        requiredAttributes: ['display_name', 'dns_zones', 'subnet_id'],
    },
    {
        terraformType: 'oci_ai_anomaly_detection_data_asset',
        modelType: 'ai_anomaly_detection_data_asset',
        requiredAttributes: ['display_name', 'project_id', 'private_endpoint_id', 'data_source_details.data_source_type'],
    },
    {
        terraformType: 'oci_ai_anomaly_detection_detect_anomaly_job',
        modelType: 'ai_anomaly_detection_job',
        requiredAttributes: ['display_name', 'model_id', 'input_details.input_type', 'output_details.bucket'],
    },
] as const

const discoveryMigrationBatch = [
    {
        terraformType: 'oci_cloud_bridge_agent',
        modelType: 'cloud_bridge_agent',
        requiredAttributes: ['display_name', 'agent_type', 'environment_id'],
    },
    {
        terraformType: 'oci_cloud_bridge_agent_dependency',
        modelType: 'cloud_bridge_agent_dependency',
        requiredAttributes: ['display_name', 'dependency_name', 'dependency_version'],
    },
    {
        terraformType: 'oci_cloud_bridge_agent_plugin',
        modelType: 'cloud_bridge_agent_plugin',
        requiredAttributes: ['agent_id', 'plugin_name', 'desired_state'],
    },
    {
        terraformType: 'oci_cloud_bridge_asset',
        modelType: 'cloud_bridge_asset',
        requiredAttributes: ['display_name', 'asset_type', 'inventory_id'],
    },
    {
        terraformType: 'oci_cloud_bridge_asset_source',
        modelType: 'cloud_bridge_asset_source',
        requiredAttributes: ['display_name', 'environment_id', 'inventory_id'],
    },
    {
        terraformType: 'oci_cloud_bridge_discovery_schedule',
        modelType: 'cloud_bridge_discovery_schedule',
        requiredAttributes: ['display_name', 'execution_recurrences'],
    },
    {
        terraformType: 'oci_cloud_bridge_environment',
        modelType: 'cloud_bridge_environment',
        requiredAttributes: ['display_name'],
    },
    {
        terraformType: 'oci_cloud_bridge_inventory',
        modelType: 'cloud_bridge_inventory',
        requiredAttributes: ['display_name'],
    },
    {
        terraformType: 'oci_cloud_migrations_migration',
        modelType: 'cloud_migrations_migration',
        requiredAttributes: ['display_name', 'replication_schedule_id'],
    },
    {
        terraformType: 'oci_cloud_migrations_migration_asset',
        modelType: 'cloud_migrations_migration_asset',
        requiredAttributes: ['display_name', 'migration_id', 'inventory_asset_id'],
    },
    {
        terraformType: 'oci_cloud_migrations_migration_plan',
        modelType: 'cloud_migrations_migration_plan',
        requiredAttributes: ['display_name', 'migration_id', 'source_migration_plan_id'],
    },
    {
        terraformType: 'oci_cloud_migrations_replication_schedule',
        modelType: 'cloud_migrations_replication_schedule',
        requiredAttributes: ['display_name', 'execution_recurrences'],
    },
    {
        terraformType: 'oci_cloud_migrations_target_asset',
        modelType: 'cloud_migrations_target_asset',
        requiredAttributes: ['display_name', 'migration_plan_id', 'preferred_shape_type'],
    },
    {
        terraformType: 'oci_stack_monitoring_discovery_job',
        modelType: 'stack_monitoring_discovery_job',
        requiredAttributes: ['discovery_client', 'discovery_type', 'should_propagate_tags_to_discovered_resources'],
    },
    {
        terraformType: 'oci_stack_monitoring_monitored_resource_task',
        modelType: 'stack_monitoring_monitored_resource_task',
        requiredAttributes: ['name', 'work_request_ids'],
    },
    {
        terraformType: 'oci_stack_monitoring_monitored_resource_type',
        modelType: 'stack_monitoring_monitored_resource_type',
        requiredAttributes: ['name', 'display_name', 'metric_namespace'],
    },
    {
        terraformType: 'oci_log_analytics_log_analytics_entity',
        modelType: 'log_analytics_entity',
        requiredAttributes: ['name', 'entity_type_name', 'management_agent_id'],
    },
    {
        terraformType: 'oci_jms_fleet',
        modelType: 'jms_fleet',
        requiredAttributes: ['display_name', 'inventory_log.log_group_id', 'operation_log.log_id'],
    },
    {
        terraformType: 'oci_management_agent_management_agent_install_key',
        modelType: 'management_agent_install_key',
        requiredAttributes: ['display_name', 'allowed_key_install_count', 'time_expires'],
    },
] as const

const databaseMigrationBatch = [
    {
        terraformType: 'oci_database_migration_connection',
        modelType: 'database_migration_connection',
        requiredAttributes: ['display_name', 'connection_type', 'technology_type', 'username', 'password', 'key_id', 'vault_id'],
    },
    {
        terraformType: 'oci_database_migration_job',
        modelType: 'database_migration_job',
        requiredAttributes: ['display_name', 'job_id', 'suspend_trigger'],
    },
] as const

const securityBatch = [
    {
        terraformType: 'oci_vulnerability_scanning_container_scan_recipe',
        modelType: 'vss_container_scan_recipe',
        requiredAttributes: ['display_name', 'image_count', 'scan_settings.scan_level'],
    },
    {
        terraformType: 'oci_vulnerability_scanning_container_scan_target',
        modelType: 'vss_container_scan_target',
        requiredAttributes: ['display_name', 'container_scan_recipe_id', 'target_registry.compartment_id', 'target_registry.type'],
    },
] as const

const healthChecksBatch = [
    {
        terraformType: 'oci_health_checks_http_probe',
        modelType: 'health_checks_http_probe',
        requiredAttributes: ['protocol', 'targets', 'path', 'method', 'timeout_in_seconds'],
    },
    {
        terraformType: 'oci_health_checks_ping_probe',
        modelType: 'health_checks_ping_probe',
        requiredAttributes: ['protocol', 'targets', 'port', 'timeout_in_seconds'],
    },
] as const

const licenseManagerBatch = [
    {
        terraformType: 'oci_license_manager_configuration',
        modelType: 'license_manager_configuration',
        requiredAttributes: ['email_ids'],
    },
    {
        terraformType: 'oci_license_manager_license_record',
        modelType: 'license_manager_license_record',
        requiredAttributes: ['display_name', 'product_license_id', 'is_perpetual', 'is_unlimited', 'license_count'],
    },
    {
        terraformType: 'oci_license_manager_product_license',
        modelType: 'license_manager_product_license',
        requiredAttributes: ['display_name', 'is_vendor_oracle', 'license_unit', 'images.listing_id', 'images.package_version'],
    },
] as const

const announcementsBatch = [
    {
        terraformType: 'oci_announcements_service_announcement_subscription',
        modelType: 'announcement_subscription',
        requiredAttributes: ['display_name', 'description', 'ons_topic_id', 'preferred_language', 'preferred_time_zone'],
    },
    {
        terraformType: 'oci_announcements_service_announcement_subscriptions_filter_group',
        modelType: 'announcement_subscription_filter_group',
        requiredAttributes: ['announcement_subscription_id', 'name', 'filters.type', 'filters.value'],
    },
] as const

const analyticsAccessBatch = [
    {
        terraformType: 'oci_analytics_analytics_instance_private_access_channel',
        modelType: 'analytics_instance_private_access_channel',
        requiredAttributes: ['analytics_instance_id', 'display_name', 'subnet_id', 'vcn_id', 'private_source_scan_hosts.scan_hostname'],
    },
    {
        terraformType: 'oci_analytics_analytics_instance_vanity_url',
        modelType: 'analytics_instance_vanity_url',
        requiredAttributes: ['analytics_instance_id', 'hosts', 'ca_certificate', 'private_key', 'public_certificate'],
    },
] as const

const serviceConfigurationBatch = [
    {
        terraformType: 'oci_audit_configuration',
        modelType: 'audit_configuration',
        requiredAttributes: ['retention_period_days'],
    },
    {
        terraformType: 'oci_artifacts_container_configuration',
        modelType: 'artifacts_container_configuration',
        requiredAttributes: ['is_repository_created_on_first_push'],
    },
    {
        terraformType: 'oci_cloud_guard_cloud_guard_configuration',
        modelType: 'cloud_guard_configuration',
        requiredAttributes: ['reporting_region', 'self_manage_resources', 'status'],
    },
] as const

describe('OciResourceMap catalog curation', () => {
    it('maps the ADM and AI batch to stable OCD resource names', () => {
        curatedBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates meaningful editable attributes for each mapped resource', () => {
        curatedBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })
    })

    it('maps discovery and migration resource families to stable OCD resource names', () => {
        discoveryMigrationBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates discovery and migration attributes for generated editors', () => {
        discoveryMigrationBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })
    })

    it('resolves discovery references to prefixed generated resource keys', () => {
        expect(elementOverrides.lookupOverrides.oci_cloud_bridge_agent.environment_id).toEqual({
            list: 'cloud_bridge_environment',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_cloud_bridge_asset.inventory_id).toEqual({
            list: 'cloud_bridge_inventory',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_cloud_bridge_asset_source.assets_compartment_id).toEqual({
            list: 'compartment',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_cloud_migrations_migration.replication_schedule_id).toEqual({
            list: 'cloud_migrations_replication_schedule',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_cloud_migrations_target_asset.migration_plan_id).toEqual({
            list: 'cloud_migrations_migration_plan',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_log_analytics_log_analytics_entity.management_agent_compartment_id).toEqual({
            list: 'compartment',
            element: 'id',
        })
    })

    it('omits discovery attributes that cannot resolve to stable generated lookups', () => {
        expect(resourceAttributes.oci_log_analytics_log_analytics_entity).not.toContain('cloud_resource_id')
    })

    it('maps Database Migration connection and job resources to stable OCD resource names', () => {
        databaseMigrationBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates Database Migration attributes without large computed result payloads', () => {
        databaseMigrationBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })

        expect(resourceAttributes.oci_database_migration_job).not.toContain('progress')
        expect(resourceAttributes.oci_database_migration_connection).not.toContain('ingress_ips')
    })

    it('resolves Database Migration connection references to generated resource keys', () => {
        expect(elementOverrides.lookupOverrides.oci_database_migration_migration.source_database_connection_id).toEqual({
            list: 'database_migration_connection',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_database_migration_migration.target_database_connection_id).toEqual({
            list: 'database_migration_connection',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_database_migration_connection.vault_id).toEqual({
            list: 'vault',
            element: 'id',
        })
    })

    it('maps container vulnerability scanning resources to stable VSS resource names', () => {
        securityBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates container vulnerability scanning recipe and target attributes', () => {
        securityBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })
    })

    it('resolves container vulnerability scanning targets to VSS container recipes', () => {
        expect(elementOverrides.lookupOverrides.oci_vulnerability_scanning_container_scan_target.container_scan_recipe_id).toEqual({
            list: 'vss_container_scan_recipe',
            element: 'id',
        })
    })

    it('maps Health Checks probe resources to stable OCD resource names', () => {
        healthChecksBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates editable Health Checks probe inputs without computed result URLs', () => {
        healthChecksBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })

            expect(attributes).not.toContain('results_url')
        })
    })

    it('maps License Manager resources to stable OCD resource names', () => {
        licenseManagerBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates editable License Manager inputs without computed inventory counters', () => {
        licenseManagerBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })

        expect(resourceAttributes.oci_license_manager_license_record).not.toContain('product_id')
        expect(resourceAttributes.oci_license_manager_license_record).not.toContain('license_unit')
        expect(resourceAttributes.oci_license_manager_product_license).not.toContain('active_license_record_count')
        expect(resourceAttributes.oci_license_manager_product_license).not.toContain('images.id')
    })

    it('resolves License Manager license records to product licenses', () => {
        expect(elementOverrides.lookupOverrides.oci_license_manager_license_record.product_license_id).toEqual({
            list: 'license_manager_product_license',
            element: 'id',
        })
    })

    it('maps Announcements subscription resources to stable OCD resource names', () => {
        announcementsBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates editable Announcements subscription inputs without action-only resources', () => {
        announcementsBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })

        expect(resourceMap.oci_announcements_service_announcement_subscriptions_actions_change_compartment).toBeUndefined()
        expect(resourceAttributes.oci_announcements_service_announcement_subscription).not.toContain('filter_groups.name')
    })

    it('resolves Announcements subscriptions to ONS topics and filter groups to subscriptions', () => {
        expect(elementOverrides.lookupOverrides.oci_announcements_service_announcement_subscription.ons_topic_id).toEqual({
            list: 'notification_topic',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_announcements_service_announcement_subscriptions_filter_group.announcement_subscription_id).toEqual({
            list: 'announcement_subscription',
            element: 'id',
        })
    })

    it('maps Analytics access endpoint resources to stable OCD resource names', () => {
        analyticsAccessBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates editable Analytics access endpoint inputs without computed connection outputs', () => {
        analyticsAccessBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })

        expect(resourceAttributes.oci_analytics_analytics_instance_private_access_channel).not.toContain('ip_address')
        expect(resourceAttributes.oci_analytics_analytics_instance_private_access_channel).not.toContain('egress_source_ip_addresses')
    })

    it('resolves Analytics access endpoint references to generated resource keys', () => {
        expect(elementOverrides.lookupOverrides.oci_analytics_analytics_instance_private_access_channel.analytics_instance_id).toEqual({
            list: 'analytics_instance',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_analytics_analytics_instance_private_access_channel.subnet_id).toEqual({
            list: 'subnet',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_analytics_analytics_instance_private_access_channel.network_security_group_ids).toEqual({
            list: 'network_security_group',
            element: 'id',
        })
        expect(elementOverrides.lookupOverrides.oci_analytics_analytics_instance_vanity_url.analytics_instance_id).toEqual({
            list: 'analytics_instance',
            element: 'id',
        })
    })

    it('maps tenancy-level service configuration resources to stable OCD resource names', () => {
        serviceConfigurationBatch.forEach(({ terraformType, modelType }) => {
            expect(resourceMap[terraformType]).toBe(modelType)
        })
    })

    it('curates editable service configuration inputs without computed provider metadata', () => {
        serviceConfigurationBatch.forEach(({ terraformType, requiredAttributes }) => {
            const attributes = resourceAttributes[terraformType] ?? []

            requiredAttributes.forEach((attribute) => {
                expect(attributes).toContain(attribute)
            })
        })

        expect(resourceAttributes.oci_artifacts_container_configuration).not.toContain('namespace')
        expect(resourceAttributes.oci_cloud_guard_cloud_guard_configuration).not.toContain('id')
    })
})
