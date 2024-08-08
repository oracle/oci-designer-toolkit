/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdCacheData } from "../components/OcdCache"

export type OcdCacheContext = {
    ocdCache: OcdCacheData
    setOcdCache: (c: OcdCacheData) => void
}

