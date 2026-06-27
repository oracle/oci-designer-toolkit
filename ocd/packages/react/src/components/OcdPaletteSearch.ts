/*
** Copyright (c) 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

export const normalizePaletteSearch = (value: string | undefined): string => (value ?? '').trim().toLowerCase()

export const paletteSearchMatches = (searchTerm: string | undefined, ...values: Array<string | undefined>): boolean => {
    const query = normalizePaletteSearch(searchTerm)
    if (query === '') return true
    return values.some((value) => normalizePaletteSearch(value).includes(query))
}
