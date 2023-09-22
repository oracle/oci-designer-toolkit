/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export interface PaletteResource {
    container: boolean,
    title: string,
    class: string,
    provider?: string
}

export interface PaletteGroup {
    title: string,
    class: string,
    resource: PaletteResource[],
    provider?: string
}

export interface PaletteProvider {
    title: string,
    provider: string,
    class: string,
    groups: PaletteGroup[]
}
