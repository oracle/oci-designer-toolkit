/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export type TerraformJson = {
    terraform: Record<string, any>,
    provider: Record<string, any>,
    resource: Record<string, any>,
    data: Record<string, any>,
    locals: Record<string, any>,
    output: Record<string, any>,
    variable: Record<string, any>
}
