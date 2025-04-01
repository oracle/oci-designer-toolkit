# OCI Resource Model Class Extensions

These OCI rsource model class extension add additional attributes to some of the
base OCI resource classes to provide linkage back to the parent or assocated
resources

* **`ExtendedAutoScalingPolicySummary`** - adds the parent
  `auto_scaling_configuration_id` to `oci.autoscaling.models.AutoScalingPolicySummary`

* **`ExtendedSecurityRule`** - adds the parent `network_security_group_id` to
  `oci.core.models.SecurityRule`

* **`ExtendedNetworkSecurityGroupVnic`** - adds the associated
  `network_security_group_id` to `oci.core.models.NetworkSecurityGroupVnic`

* **`ExtendedExportSummary`** - adds the export `compartment_id` to
  `oci.object_storage.models.ExportSummary`
