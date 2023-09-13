module.exports = {
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