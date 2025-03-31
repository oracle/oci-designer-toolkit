/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

// Resources that will be excluded from None OpenTofu exports
export const ociNoneVisualResources: string[] = [
    'network_security_group_security_rule',
    'volume_attachment',
    'vnic_attachment'
]
export const azureNoneVisualResources: string[] = []
export const awsNoneVisualResources: string[] = []
export const googleNoneVisualResources: string[] = []
