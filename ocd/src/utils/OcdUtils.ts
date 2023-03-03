/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

export namespace OcdUtils {
    export function toTitleCase(str?: string): string {
        return str ? str.replace(/\b\w+/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();}).replaceAll('-', '_').replace(/\W+/g, ' ') : ''
    }
}