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
import { existsSync } from 'fs'
import path from 'path'
console.debug('Forge Config: package.json.version', Package.version)

// The DMG maker depends on the optional native `appdmg` (-> `macos-alias`), which
// does not compile under newer Node (e.g. Node 26 + electron node-gyp). When it
// is unavailable, fall back to the ZIP maker for darwin so `electron-forge make`
// still succeeds (the build gate stays green). A real .dmg is produced only where
// appdmg actually resolves. Filesystem check (no import.meta/require) so it works
// regardless of how electron-forge loads this config. node_modules is hoisted to
// the monorepo root (../../) but may also be local (./).
function appdmgAvailable(): boolean {
  const cwd = process.cwd()
  return existsSync(path.join(cwd, '..', '..', 'node_modules', 'appdmg', 'package.json')) ||
         existsSync(path.join(cwd, 'node_modules', 'appdmg', 'package.json'))
}
const dmgMakerAvailable = appdmgAvailable()
console.info('Forge Config: appdmg available =', dmgMakerAvailable)

const archPos = process.argv.findIndex((arg: string) => arg.startsWith('--arch'))
let arch = archPos > 0 ? process.argv[archPos+1] : os.arch()
if (arch === undefined) {
  arch = process.argv[archPos].replace('arch', '').replace(/[\W]+/g,"")
}
// const arch = archPos > 0 ? process.argv[archPos+1] : os.arch()
console.info('Args:', process.argv, archPos, arch)
const config: ForgeConfig = {
  outDir: '../../dist',
  packagerConfig: {
    // Basename glob (asar unpack uses matchBase) so it matches the jsonnet WASM
    // even though Vite emits it under the dot-dir `.vite/` — `**/*.wasm` would
    // miss it because minimatch `**` does not traverse dot-directories. The
    // WASM must be asar-unpacked so the renderer can fetch it under file://.
    asar: { unpack: '*.wasm' },
    executableName: 'oci-designer-toolkit-next-gen',
    icon: './public/assets/icon',
    // osxSign: {}, // Appears to break the MacOS App I assume because it's empty
    appCategoryType: 'public.app-category.developer-tools'
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'oci-designer-toolkit-next-gen',
      setupExe: `oci-designer-toolkit-next-gen-${Package.version}-Setup.exe`
    }), 
    // Always ship a darwin ZIP (no native deps) so the build gate is green even
    // when appdmg cannot compile. The DMG maker below is added only when available.
    new MakerZIP({}, ['darwin']),
    ...(dmgMakerAvailable ? [new MakerDMG({
      background: './public/assets/background.png',
      icon: './public/assets/icon.icns',
      // appdmg/macos-alias requires the mounted volume name to be <= 27 chars.
      // Keep the app/package identity long, but use a short installer volume.
      title: 'ODT Next Gen',
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
          path: `${process.cwd()}/../../dist/oci-designer-toolkit-next-gen-darwin-${arch}/oci-designer-toolkit-next-gen.app`
        }
      ]
    }, ['darwin'])] : []),
    new MakerRpm({
      options: {
        name: 'oci-designer-toolkit-next-gen',
        productName: 'oci-designer-toolkit-next-gen'
      }
    }), 
    new MakerDeb({
      options: {
        name: 'oci-designer-toolkit-next-gen',
        productName: 'oci-designer-toolkit-next-gen'
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
