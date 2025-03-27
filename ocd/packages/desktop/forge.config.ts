import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg'
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import os from 'os'
// @ts-ignore
// import * as Package from './package.json'
// import * as Package from './package.json' with {type: "json"}
import Package from './package.json' with {type: "json"}
console.debug('Forge Config: package.json.version', Package.version)

const archPos = process.argv.findIndex(arg => arg.startsWith('--arch'))
let arch = archPos > 0 ? process.argv[archPos+1] : os.arch()
if (arch === undefined) {
  arch = process.argv[archPos].replace('arch', '').replace(/[\W]+/g,"")
}
// const arch = archPos > 0 ? process.argv[archPos+1] : os.arch()
console.info('Args:', process.argv, archPos, arch)
const config: ForgeConfig = {
  outDir: '../../dist',
  packagerConfig: {
    asar: true,
    executableName: 'ocd',
    icon: './public/assets/icon',
    // osxSign: {}, // Appears to break the MacOS App I assume because it's empty
    appCategoryType: 'public.app-category.developer-tools'
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'ocd',
      setupExe: `ocd-${Package.version}-Setup.exe`
    }), 
    // new MakerZIP({}, ['darwin']), 
    new MakerDMG({
      appPath: 'ocd', 
      background: './public/assets/background.png',
      icon: './public/assets/icon.icns',
      title: 'OKIT - Open Cloud Designer',
      format: 'ULFO',
      overwrite: true,
      additionalDMGOptions: {
        window: {
          size: {
            width: 585,
            height: 355
          }
        },
      },
      contents: [
        {
          x: 400,
          y: 200,
          type: 'link',
          path: '/Applications'
        },
        {
          x: 150,
          y: 200,
          type: 'file',
          path: `${process.cwd()}/../../dist/ocd-darwin-${arch}/ocd.app`
        }
      ]
    }, ['darwin']), 
    new MakerRpm({
      options: {
        name: 'ocd',
        productName: 'ocd'
      }
    }), 
    new MakerDeb({
      options: {
        name: 'ocd',
        productName: 'ocd'
      }
    })
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.mts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
