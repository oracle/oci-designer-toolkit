/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const terraformMetadataOverrides = {
    "common": {
        "availability_domain": "local.ad-$s_name"
    }
}