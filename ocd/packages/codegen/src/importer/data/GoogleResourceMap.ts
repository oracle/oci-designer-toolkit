/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdIncludedElements, OcdResourceMap } from "../../types/OcdImporterData";

export const resourceMap: OcdResourceMap = {
    "google_compute_network": "compute_network",
    "google_oracle_database_autonomous_database": "oracle_database_autonomous_database",
    "google_oracle_database_cloud_exadata_infrastructure": "oracle_database_cloud_exadata_infrastructure",
    "google_oracle_database_cloud_vm_cluster": "oracle_database_cloud_vm_cluster",
}

export const dataMap: OcdResourceMap = {}

export const resourceAttributes: OcdIncludedElements = {
    "common": [],
    "google_compute_network": [
        "gateway_ipv4"
      ],
    "google_oracle_database_autonomous_database": [],
    "google_oracle_database_cloud_exadata_infrastructure": [],
    "google_oracle_database_cloud_vm_cluster": [],
}
