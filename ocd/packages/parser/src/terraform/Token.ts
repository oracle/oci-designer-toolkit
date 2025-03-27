/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { TokenTypes } from "./types/TokenTypes.js";

export class Token {
    type: TokenTypes
    key: string
    value: string

    constructor (type: TokenTypes, key: string, value: string) {
        this.type = type
        this.key = key
        this.value = value
    }
}
