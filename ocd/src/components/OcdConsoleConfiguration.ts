/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export interface OcdConsoleConfiguration {
    showModelPalette: boolean,
    showProvidersPalette: string[],
    verboseProviderPalette: boolean,
    displayPage: 'bom' | 'designer' | 'markdown' | 'tabular' | 'terraform' | 'variables'
}

export class OcdConsoleConfig {
    config: OcdConsoleConfiguration
    constructor (config: any = undefined) {
        if (typeof config === 'string' && config.length > 0) this.config = JSON.parse(config)
        else if (config instanceof Object) this.config = config
        else this.config = this.newConsoleConfiguration()
    }

    static new = () => new OcdConsoleConfig()
    static clone = (ocdConsoleState: OcdConsoleConfiguration) => new OcdConsoleConfig(ocdConsoleState)

    newConsoleConfiguration = (): OcdConsoleConfiguration => {
        return {
            showModelPalette: true,
            showProvidersPalette: ['oci'],
            verboseProviderPalette: false,
            displayPage: 'designer'
        }
    }
}

export default OcdConsoleConfig