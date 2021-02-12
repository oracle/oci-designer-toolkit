# OCI Resource Model Class Extensions

These OCI rsource model class extension add additional attributes to some of the
base OCI resource classes to provide linkage back to the parent or assocated
resources

* **`ExtendedSourceApplicationSummary`** - adds a unique application `id` to
  `oci.application_migration.modelsSourceApplicationSummary`

* **`ExtendedAutoScalingPolicySummary`** - adds the parent
  `auto_scaling_configuration_id` to `oci.autoscaling.models.AutoScalingPolicySummary`

* **`ExtendedSecurityRule`** - adds the parent `network_security_group_id` to
  `oci.core.models.SecurityRule`

* **`ExtendedNetworkSecurityGroupVnic`** - adds the associated
  `network_security_group_id` to `oci.core.models.NetworkSecurityGroupVnic`

* **`ExtendedBucketSummary`** - adds the buckets `compartment_id` to
  `oci.object_storage.models.BucketSummary`
