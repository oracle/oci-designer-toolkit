# A2 Catalog Curation — Shared Task Notes

## Goal
Expand the OCI catalog in curated batches toward the full provider set. Each
service needs a resourceMap entry + curated resourceAttributes in
ocd/packages/codegen/src/importer/data/OciResourceMap.ts.

## Hard rules (learned)
- A curated attribute leaf named `resources`/`resource`/`results` collides with the
  generator's reserved param -> TS2349 in the model validator. Drop such attributes.
- A curated attr 'home_region' -> homeRegion collides with base OciTerraformResource (TS2416 in export); drop it. Verify the FULL build (model+export+import+react), not just model.
- Do NOT run the full `npm run build` (the appdmg DMG maker won't compile on Node 26).

## Progress
- (loop appends per-iteration here)
- STATUS CORRECTION 2026-06-10: entries below stop at iteration 8 (238) but the LIVE
  catalog in OciResourceMap.ts has 265 entries — iterations 9-10 ran without updating
  this file. Vendored oci tf-schema has 727 resource schemas; 460 still absent.
  Verified by codex sweep. Next-batch candidates identified (14): oci_core_volume_backup,
  oci_core_volume_backup_policy, oci_core_volume_backup_policy_assignment,
  oci_core_volume_group_backup, oci_core_instance_console_connection,
  oci_core_route_table_attachment, oci_core_ipv6, oci_core_public_ip_pool,
  oci_file_storage_snapshot, oci_mysql_mysql_backup, oci_mysql_mysql_configuration,
  oci_mysql_replica, oci_dns_record, oci_dns_steering_policy_attachment.
  Before any new iteration: recount live entries first; trust the code, not this log.
- Iteration 11 (catalog 265 -> 279): added 14 high-value services across block volume
  backups/policies, instance console access, route-table attachments, IPv6/public-IP
  pools, FSS snapshots, MySQL backups/configuration/replicas, and DNS records/steering
  attachments:
  volume_backup (oci_core_volume_backup),
  volume_backup_policy (oci_core_volume_backup_policy),
  volume_backup_policy_assignment (oci_core_volume_backup_policy_assignment),
  volume_group_backup (oci_core_volume_group_backup),
  instance_console_connection (oci_core_instance_console_connection),
  route_table_attachment (oci_core_route_table_attachment),
  ipv6 (oci_core_ipv6),
  public_ip_pool (oci_core_public_ip_pool),
  file_storage_snapshot (oci_file_storage_snapshot),
  mysql_backup (oci_mysql_mysql_backup),
  mysql_configuration (oci_mysql_mysql_configuration),
  mysql_replica (oci_mysql_replica),
  dns_record (oci_dns_record),
  dns_steering_policy_attachment (oci_dns_steering_policy_attachment).
  Notes:
  * All 14 confirmed present in resource_schemas of the vendored tf-schema.json before
    curation; none were already mapped.
  * Dropped nested `source_details.region`, MySQL snapshot `region`, and operational
    state/time/size read-only fields from the curated attribute lists. Kept console
    connection `public_key` as public key material, matching prior identity_api_key
    treatment.
  * MySQL configuration keeps a representative non-secret variable subset; the provider
    exposes dozens of tunables, but curating all of them would bloat the generated
    properties surface without improving common design/import workflows.
  Regenerated OCI codegen; workspace compile clean; react build clean. Active resourceMap
  entries: 279.
- Iteration 2 (catalog 140 -> 154): added 14 high-value services across
  identity/security/db/observability/compute/networking/storage/AI:
  identity_domain (oci_identity_domain),
  cloud_guard_target (oci_cloud_guard_target),
  cloud_guard_detector_recipe (oci_cloud_guard_detector_recipe),
  data_safe_target_database (oci_data_safe_target_database),
  pluggable_database (oci_database_pluggable_database),
  data_guard_association (oci_database_data_guard_association),
  jms_fleet (oci_jms_fleet),
  stack_monitoring_resource (oci_stack_monitoring_monitored_resource),
  apm_synthetics_monitor (oci_apm_synthetics_monitor),
  dr_protection_group (oci_disaster_recovery_dr_protection_group),
  custom_image (oci_core_image),
  public_ip (oci_core_public_ip),
  object_lifecycle_policy (oci_objectstorage_object_lifecycle_policy),
  ai_anomaly_detection_project (oci_ai_anomaly_detection_project).
  Regenerated OCI codegen; STRICT model build clean (no TS2349). Active
  resourceMap entries: 154.

- Iteration 3 (catalog 154 -> 168): added 14 high-value services across
  genai/database/compute/networking/storage/observability/security/dns:
  genai_dedicated_cluster (oci_generative_ai_dedicated_ai_cluster),
  genai_endpoint (oci_generative_ai_endpoint),
  db_home (oci_database_db_home),
  compute_cluster (oci_core_compute_cluster),
  preauthenticated_request (oci_objectstorage_preauthrequest),
  replication_policy (oci_objectstorage_replication_policy),
  private_ip (oci_core_private_ip),
  cluster_network (oci_core_cluster_network),
  unified_agent_configuration (oci_logging_unified_agent_configuration),
  network_source (oci_identity_network_source),
  cloud_guard_responder_recipe (oci_cloud_guard_responder_recipe),
  dns_steering_policy (oci_dns_steering_policy),
  autonomous_container_database (oci_database_autonomous_container_database),
  database_backup (oci_database_backup).
  Note: oci_generative_ai_agent_agent + _knowledge_base were dropped — the
  vendored oci/tf-schema.json predates the GenAI Agent resource types, so the
  generator silently skips them. Substituted db_home + compute_cluster (both
  present in schema). Regenerated OCI codegen; STRICT model build clean (exit 0,
  0 TS errors, no TS2349). Active resourceMap entries: 168.

- Iteration 4 (catalog 168 -> 182): added 14 high-value services across
  networking(FastConnect)/loadbalancer/database(Exadata)/dns/email/devops/security/AI:
  virtual_circuit (oci_core_virtual_circuit),
  cross_connect (oci_core_cross_connect),
  cross_connect_group (oci_core_cross_connect_group),
  load_balancer_certificate (oci_load_balancer_certificate),
  load_balancer_path_route_set (oci_load_balancer_path_route_set),
  vm_cluster (oci_database_vm_cluster),
  autonomous_vm_cluster (oci_database_autonomous_vm_cluster),
  exadata_infrastructure (oci_database_exadata_infrastructure),
  dns_view (oci_dns_view),
  email_sender (oci_email_sender),
  devops_deployment (oci_devops_deployment),
  devops_connection (oci_devops_connection),
  data_safe_security_assessment (oci_data_safe_security_assessment),
  ai_anomaly_detection_model (oci_ai_anomaly_detection_model).
  Notes: removed a pre-existing empty `oci_database_exadata_infrastructure: []`
  attr stub that collided with the new populated entry (TS1117). Dropped
  `region` from virtual_circuit and the `private_key`/`passphrase` secret inputs
  from load_balancer_certificate (collision/secret-hygiene caution). Regenerated
  OCI codegen; FULL build (model+export+import+react) clean: exit 0, 0 TS errors,
  no TS2416/TS2349. Active resourceMap entries: 182.

- Iteration 5 (catalog 182 -> 196): added 14 high-value services across
  apigateway/security(WAF,CloudGuard,DataSafe)/RMS/integration(GoldenGate)/
  devops/database/mysql/dns/email/observability(StackMonitoring)/FSDR:
  apigateway_api (oci_apigateway_api),
  web_app_firewall_policy (oci_waf_web_app_firewall_policy),
  resourcemanager_private_endpoint (oci_resourcemanager_private_endpoint),
  golden_gate_connection (oci_golden_gate_connection),
  devops_deploy_stage (oci_devops_deploy_stage),
  data_safe_user_assessment (oci_data_safe_user_assessment),
  cloud_guard_managed_list (oci_cloud_guard_managed_list),
  autonomous_database_backup (oci_database_autonomous_database_backup),
  mysql_channel (oci_mysql_channel),
  dns_rrset (oci_dns_rrset),
  email_dkim (oci_email_dkim),
  stack_monitoring_config (oci_stack_monitoring_config),
  database_key_store (oci_database_key_store),
  dr_plan (oci_disaster_recovery_dr_plan).
  Notes: dropped all golden_gate_connection secret inputs (password, ssl_key*,
  account_key, secret_access_key, private_key_file/passphrase, sas_token,
  key_store_password, wallet, region) for secret-hygiene + collision caution;
  dropped `resource_type` from stack_monitoring_config (resourceType collision
  caution). All 14 verified present in tf-schema.json (count 2 each) before
  curation. Regenerated OCI codegen; FULL build
  (model+export+import+react) clean: exit 0, 0 TS errors, no TS2416/TS2349.
  Active resourceMap entries: 196.

- Iteration 6 (catalog 196 -> 210): added 14 high-value services across
  governance(Cloud Advisor/Service Catalog)/identity creds/LB sub-resources/
  WAF/API Gateway/Object Storage/KMS/Fusion Apps/DevOps/Database:
  optimizer_profile (oci_optimizer_profile),
  service_catalog (oci_service_catalog_service_catalog),
  identity_api_key (oci_identity_api_key),
  identity_auth_token (oci_identity_auth_token),
  load_balancer_rule_set (oci_load_balancer_rule_set),
  load_balancer_hostname (oci_load_balancer_hostname),
  waf_network_address_list (oci_waf_network_address_list),
  apigateway_certificate (oci_apigateway_certificate),
  apigateway_usage_plan (oci_apigateway_usage_plan),
  objectstorage_object (oci_objectstorage_object),
  kms_key_version (oci_kms_key_version),
  fusion_environment (oci_fusion_apps_fusion_environment),
  devops_trigger (oci_devops_trigger),
  database_software_image (oci_database_database_software_image).
  Notes:
  * Dropped oci_resourcemanager_stack — it is data-source-only in the vendored
    tf-schema.json (not in resource_schemas), so the generator skips it;
    substituted database_software_image (present, count 2). Dropped
    oci_mysql_configuration candidate (count 0).
  * Secret hygiene: dropped identity_auth_token `token` (generated secret) and
    apigateway_certificate `private_key`/`certificate`/`intermediate_certificates`
    (cert material) and fusion admin-user `password`; kept identity_api_key
    `key_value` (public PEM, not secret).
  * objectstorage_object: dropped the `source_uri_details` block — its nested
    `object` leaf generated a converter `sourceUriDetailsObject` that collided
    (TS2300/TS2717/TS2451) with the block's own generated symbol in export/import/
    react. Flat `object`/`bucket`/`namespace`/content-* fields kept and clean.
  * Build-cache gotcha: a top-level attribute literally named `object` is fine,
    BUT after deleting+regenerating the wrapper+generated files, incremental
    `tsc` (stale .tsbuildinfo) failed to re-emit the ESM `generated/*.d.ts` and
    the export ESM barrel entry, surfacing as bogus "not assignable to
    OciResource" / "Could not resolve OciObjectstorageObject.js". Fix: delete
    each package's `*.tsbuildinfo` + `lib/` and rebuild clean. If a future batch
    deletes/regenerates resource files, nuke incremental caches before verifying.
  Regenerated OCI codegen; FULL build (model+export+import+react) clean: exit 0,
  0 TS errors, no TS2416/TS2349/TS2300. Active resourceMap entries: 210.

- Iteration 7 (catalog 210 -> 224): added 14 high-value services across
  OKE/storage(boot-volume,FSS)/database(MySQL HeatWave,NoSQL)/notifications/
  governance(budget)/datacatalog/dns/security(WAAS,certificates)/AI:
  virtual_node_pool (oci_containerengine_virtual_node_pool),
  containerengine_addon (oci_containerengine_addon),
  boot_volume_backup (oci_core_boot_volume_backup),
  file_storage_replication (oci_file_storage_replication),
  filesystem_snapshot_policy (oci_file_storage_filesystem_snapshot_policy),
  mysql_heat_wave_cluster (oci_mysql_heat_wave_cluster),
  ons_subscription (oci_ons_subscription),
  budget_alert_rule (oci_budget_alert_rule),
  datacatalog_data_asset (oci_datacatalog_data_asset),
  dns_resolver_endpoint (oci_dns_resolver_endpoint),
  waas_policy (oci_waas_waas_policy),
  ai_language_endpoint (oci_ai_language_endpoint),
  certificates_ca_bundle (oci_certificates_management_ca_bundle),
  nosql_table_replica (oci_nosql_table_replica).
  Notes:
  * All 14 confirmed present in resource_schemas of the vendored tf-schema.json
    before curation.
  * Dropped `region` from nosql_table_replica — region->region collides with the
    base OciResource.region property (same class of collision as the iter-4
    virtual_circuit `region` drop). Curated lists also omit compartment_id/id/
    tags per the existing "common" convention.
  * Generator derives class names from the SHORT map value, not the TF type:
    virtual_node_pool -> OciVirtualNodePool, filesystem_snapshot_policy ->
    OciFilesystemSnapshotPolicy, certificates_ca_bundle -> OciCertificatesCaBundle.
  * Kept certificates_ca_bundle `ca_bundle_pem` (public CA cert material, not a
    secret); ons_subscription/budget_alert_rule have no secret inputs.
  Regenerated OCI codegen; FULL build (model+export+import+react) clean: exit 0,
  0 TS errors, no TS2416/TS2349/TS2300. Active resourceMap entries: 224.

- Iteration 8 (catalog 224 -> 238): added 14 high-value services across
  database(Migration,Exascale)/VMware(OCVP)/service-mesh/data-science/AI(Vision,
  Document Understanding)/artifact-registry/health-checks/log-analytics/
  networking(VTAP)/streaming/dns:
  database_migration (oci_database_migration_migration),
  ocvp_sddc (oci_ocvp_sddc),
  service_mesh_virtual_service (oci_service_mesh_virtual_service),
  service_mesh_virtual_deployment (oci_service_mesh_virtual_deployment),
  datascience_pipeline (oci_datascience_pipeline),
  ai_vision_model (oci_ai_vision_model),
  ai_document_processor_job (oci_ai_document_processor_job),
  generic_artifact (oci_artifacts_generic_artifact),
  health_checks_ping_monitor (oci_health_checks_ping_monitor),
  log_analytics_object_collection_rule (oci_log_analytics_log_analytics_object_collection_rule),
  exadb_vm_cluster (oci_database_exadb_vm_cluster),
  vtap (oci_core_vtap),
  connect_harness (oci_streaming_connect_harness),
  dns_tsig_key (oci_dns_tsig_key).
  Notes:
  * All 14 confirmed present in resource_schemas of the vendored tf-schema.json
    (grep count 2 each) before curation; candidates with count 0/1 (data-source-
    only, e.g. oci_goldengate_deployment, oci_data_flow_application) were skipped.
  * Secret hygiene: dropped dns_tsig_key `secret` (TSIG shared key) — same class
    as prior password/token drops.
  * Curated lists omit compartment_id/defined_tags/freeform_tags/id (covered by
    `common` + base); no attr hits the known region/home_region base collisions.
    display_name/name/description verified safe (already used by existing entries).
  Regenerated OCI codegen; FULL build (model+export+import+react) clean: exit 0,
  0 TS errors, no TS2416/TS2349/TS2300. Active resourceMap entries: 238.

## Next
- Pick services NOT already in OciResourceMap.ts; curate ~14/batch.
- Before curating: confirm each candidate exists in
  packages/codegen-cli/schema/oci/tf-schema.json (grep count >0), else the
  generator skips it silently and the map entry is dead.
