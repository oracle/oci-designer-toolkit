/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdVariable } from "@ocd/model"

export class OcdProviderExporter {

    // Common
    variableStatement = (v: OcdVariable) => {
        return `variable "${v.name}" {
    ${v.default !== '' ? `default = "${v.default}"` : ''}
    description = "${v.description}"
}
`
    }

    autoGeneratedNotice = () => {return`
# ======================================================================
# === Auto Generated Code All Edits Will Be Lost During Regeneration ===
# ======================================================================
    `}
}