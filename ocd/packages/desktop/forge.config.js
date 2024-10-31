// Copyright (c) 2020, Oracle and/or its affiliates. All rights reserved.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
// module.exports = {
    packagerConfig: {
        asar: true,
        name: 'ocd',
        executableName: 'ocd',
        icon: './public/assets/icon'
        // prune: false,
    },
    rebuildConfig: {},
    makers: [
        {
            name: "@electron-forge/maker-dmg",
            config: {
                icon: "./public/assets/icon.icns",
                format: "ULFO",
                overwrite: true
            }
        },
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "ocd"
            }
        },
        {
            name: "@electron-forge/maker-zip",
            platforms: [
                "darwin"
            ]
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {}
        }
    ],
    plugins: [
        {
            name: "@electron-forge/plugin-auto-unpack-natives",
            config: {}
        }
    ],
};