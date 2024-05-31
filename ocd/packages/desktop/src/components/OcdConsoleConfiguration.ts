/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export interface OcdConsoleConfiguration {
    showPalette: boolean
    showModelPalette: boolean
    showProvidersPalette: string[]
    verboseProviderPalette: boolean
    displayPage: 'bom' | 'designer' | 'documentation' | 'help' | 'markdown' | 'tabular' | 'terraform' | 'variables' | 'validation'
    helpPage?: 'releasenotes' | 'userguide'
    detailedResource: boolean
    showPreviousViewOnStart: boolean
    showProperties: boolean
    highlightCompartmentResources: boolean
    zoomOnWheel: boolean
    recentDesigns: string[]
    maxRecent: number
}

export class OcdConsoleConfig {
    config: OcdConsoleConfiguration
    constructor (config: any = undefined) {
        if (typeof config === 'string' && config.length > 0) this.config = JSON.parse(config)
        else if (config instanceof Object) this.config = config
        else this.config = this.newConsoleConfiguration()
    }

    static new = () => new OcdConsoleConfig()
    static clone = (ocdConsoleState: OcdConsoleConfig) => new OcdConsoleConfig(ocdConsoleState.config)

    newConsoleConfiguration = (): OcdConsoleConfiguration => {
        return {
            showPalette: true,
            showModelPalette: true,
            showProvidersPalette: ['oci'],
            verboseProviderPalette: false,
            displayPage: 'designer',
            detailedResource: true,
            showPreviousViewOnStart: true,
            showProperties: true,
            highlightCompartmentResources: false,
            zoomOnWheel: false,
            recentDesigns: [],
            maxRecent: 10,
        }
    }
}

export default OcdConsoleConfig