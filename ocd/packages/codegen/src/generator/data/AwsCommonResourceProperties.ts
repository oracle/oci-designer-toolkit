/*
** Common resource property handling for the AWS Terraform generator.
** Mirrors the Google provider's generic element set; resource-specific
** mappings come from the @ocd/model AWS resources.
*/

export const commonElements = [
    'parent_id',      // Common Element
    'tags',           // Common Element
    'display_name',   // Common Element
    'id',             // Common Element
    'name',           // Common Element
]
export const commonIgnoreElements = [
    'location',
    'type'
]
