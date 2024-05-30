```diff
- Beta Code: This is experimental and work in progress. Therefore does not provide all the functionality in OKIT.
```

# Getting Started OKIT Open Cloud Designer

The OCD project is a refactoring of the original OKIT implementation and TypeScript / JavaScript 
based implementation using React to build the interface and provide the WebServer. In addition
Electron is used to generate native installers for simplicity of installation and use.

This Beta release is to show the new desktop functionality available in the OKIT - Open Cloud Desktop release and is not
guarenteed to be 100% functional. At present the following resources and features are availble but we will be releasing updates 
regularly.

| Resource                       | Properties | Terraform | Validation | Query   | Query Only |
| ------------------------------ | :--------: | :-------: | :--------: | :-----: | :--------: |
| VCN                            | &check;    | &check;   |            | &check; |            |
| Subnet                         | &check;    | &check;   |            | &check; |            |
| Security List                  | &check;    | &check;   |            | &check; |            |
| Route Table                    | &check;    | &check;   |            | &check; |            |
| DHCP Options                   | &check;    | &check;   |            | &check; |            |
| Internet Gateway               | &check;    | &check;   |            | &check; |            |
| NAT Gateway                    | &check;    | &check;   |            | &check; |            |
| Instance                       | &check;    | &check;   |            | &check; |            |
| Autonomous Database            | &check;    | &check;   |            | &check; |            |
| Load Balancer                  | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend Set      | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend          | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend Listener | &check;    | &check;   |            | &check; |            |
| Block Volume                   | &check;    | &check;   |            | &check; |            |
| Volume Attachment              | &check;    | &check;   |            | &check; |            |
| Boot Volumes                   | &check;    | &check;   |            | &check; | &check;    |
| Boot Volumes Attachment        | &cross;    | &check;   |            | &check; | &check;    |
| Customer Premises Equipment    | &check;    | &check;   |            | &check; |            |
| Database System                | &check;    | &check;   |            | &check; |            |
| Service Gateway                | &check;    | &check;   |            | &check; |            |
| DRG                            | &check;    | &check;   |            | &check; |            |
| DRG Attachment                 |            |           |            |         |            |
| DRG Route Table                |            |           |            |         |            |
| DRG Distribution               |            |           |            |         |            |
| Local Peering                  | &check;    | &check;   |            | &check; |            |
| IPSec VPN                      | &check;    | &check;   |            | &check; |            |
| Remote Peering                 |            |           |            |         |            |
| NoSQL Database                 |            |           |            |         |            |
| MySQL (with Heatwave)          |            |           |            |         |            |
| Vault                          |            |           |            |         |            |
| Key                            |            |           |            |         |            |
| Secret                         |            |           |            |         |            |
| File System                    |            |           |            |         |            |
| Mount Target                   |            |           |            |         |            |
| OKE Cluser & Node Pool         |            |           |            |         |            |
| Analytics Instance             |            |           |            |         |            |
| Policy                         |            |           |            | &check; |            |
| Dynamic Groups                 | &check;    | &check;   |            | &check; |            |
| Groups                         | &check;    | &check;   |            |         |            |
| Users                          | &check;    | &check;   |            |         |            |

Not all menu options are currently available and if selected will display a message saying they are currently not availble,
again these will be added over time.

If you have any comments please leave them on the GitHub issues marked as ___OCD Beta:___

## Native Installs
The [OCD Beta Nightly Release](https://github.com/oracle/oci-designer-toolkit/releases/tag/ocd.nightly) contains a number of native install artefacts which can be used to install OCD on you machine.
At present we do not have any certificates associated with these and hence you may see some security warnings during execution. If you are happy to accept that the installation files built by GitHub are okey then
you will need to acknowledge in the appropriate dialog for your system.

### MacOS
#### Error
![Security Acknowledgement](https://github.com/oracle/oci-designer-toolkit/blob/nightly/ocd/images/MacosError.png)
#### Solution
System Settings -> Security

![Security Acknowledgement](https://github.com/oracle/oci-designer-toolkit/blob/nightly/ocd/images/MacosSecurityOverride.png)

Select "Open Anyway"

# OCD Desktop Features 

The OCD Desktop / Web interface is composed of a number of section similar to those provided in the original OKIT BUI. These 
provide similar functionality but with some key difference that will be document below.

![OCD Desktop](https://github.com/oracle/oci-designer-toolkit/blob/nightly/ocd/images/OcdDesktop.png)

## Palette

Location of all resources that can be used within OCD. These are split into two tabs.

### Provider

The Provider tab contains a set of provider (currently only OCI) Resources that are available within the OCD Desktop to design your architecture. These resources can be displayed in either a simple, icon only, or a verbose format, icon and name. When you want to add a resource to your architecture simply drag it from the palette onto the canvas.

### Model

The Model tab contains a list of all Resource that have already been added to the design allowing the user to drag a second copy of the resource onto the canvas, either the 
same [Page/View](#pagesviews) or a new [Page/View](#pagesviews).

## Canvas

Freeform location where your design can be created. Once a Resource has been dragged from the palete and dropped on the canvas it can subsequently be moved as required by the user. In addition container style Resource (Vcn / Subnet) will also allow resize and can contain other resources. It should be noted that Compartments are not represented on the
canvas as a Resource but rather created as Layers using the top tab bar. These compartment layers can subsequently be shown/hidden and the Resources within the Compartment layer will be shown/hidden on the canvas. In addition Compartment Layers can be coloured (Style in properties) and if the "Highlight Compartment Resources" is selected from the designer menu (above the palette) 
then the borders of resource will be coloured to match the compartment.

## Pages/Views

The Page/View Tabs (at base of canvas) allow the user to create multiple visual representations of the same design/model by selecting resources from the "Model" palette.

## Properties

The properties panel provides access to the edittable properties available for the selected Resource. In addition the User can provide Resource specific documentation that will be included in any generated Markdown.

# Build Your Own

## Prerequisites

- node / npm

## Installing
Before the application can be either built as a desktop or run as a web server all appropriate node modules must be 
installed. This can be achieve by executing the __fresh-install__ of __reinstall__ script, from this directory, as follows:

``` bash
npm run fresh-install
```

This will create the oci-designer-toolkit/oci/__dist__ directory which will contain a subdirectory for the appropriate opperating system, for example :

```bash
ls -1
builder-debug.yml
builder-effective-config.yaml
mac

ls -1 mac
mac
ocd-0.1.0.dmg
ocd-0.1.0.dmg.blockmap
ocd-0.1.0.zip
ocd-0.1.0.zip.blockmap
```

In the above example the **ocd-0.1.0.dmg** can be opened in the normal way on a mac and the app will be installed.

## Running Desktop Application without installing

1. Build Desktop Application
```bash
npm run desktop
```

## Running Development Web Application

1. Run Web Server
```bash
npm run web
```
2. Access BUI on [http://localhost:3000/](http://localhost:3000/)



