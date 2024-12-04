module.exports = {
    "appId": "com.oracle.okit-ocd",
    "artifactName": "${productName}-${version}-${arch}.${ext}",
    "files": [
      ".vite/build/**/*",
      "../../node_modules/**/*"
    ],
    "directories": {
      "output": "../../dist/${os}",
      "buildResources": "assets"
    },
    "fileAssociations": [
      {
        "ext": "okit",
        "name": "OCD Design",
        "role": "Editor"
      },
      {
        "ext": "ocd",
        "name": "OCD Design",
        "role": "Editor"
      }
    ],
    "mac": {
      "icon": "build/assets/icon.icns",
      "category": "public.app-category.developer-tools",
      "mergeASARs": false,
      "target": [
        {
          "target": "dmg",
          "arch": ["universal"]
        }
      ]
    },
    "dmg": {
      "icon": "build/assets/icon.icns",
      "background": "build/assets/background.png",
      "window": {
        "width": 585,
        "height": 355
      }
    },
    "win": {
      "icon": "build/assets/icon.ico"
    },
    "nsis": {
      "perMachine": true
    },
    "linux": {
      "desktop": {
        "Name": "OKIT - Open Cloud designer",
        "StartupNotify": "true",
        "Terminal": "false",
        "Type": "Application"        
      },
      "icon": "build/assets/icon.png",
      "executableName": "${productName}-${version}.${ext}",
      "target": [
        "snap"
      ]
    },
    "rpm": {}
}