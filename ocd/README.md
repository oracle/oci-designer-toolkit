```diff
- ALPHA Code: This is experimental and work in progress. Therefore does not provide all the functionality in OKIT.**
```

# Getting Started OKIT Open Cloud Designer

The OCD project is a refactoring of the original OKIT implementation and TypeScript / JavaScript 
based implementation using React to build the interface and provide the WebServer. In addition
Electron is used to generate native installers for simplicity of installation and use.

# Prerequisites

- node / npm

# Installing
Before the application can be either built as a desktop or run as a web server all appropriate node modules must be 
installed. This can be achieve by executing the __install__ script, from this directory, as follows:

``` bash
npm run install
```

# Building Desktop Application

1. Build Desktop Application
```bash
npm run desktop
```
2. Install Application from 
    1. ./dist/linux/
    2. ./dist/mac/ocd-0.1.0.dmg
    3. ./dist/win/ocd Setup 0.1.0.exe

# Running Development Web Application

1. Run Web Server
```bash
npm run web
```
2. Access BUI on [http://localhost:3000/](http://localhost:3000/)


# OCD Desktop Features 

The OCD Desktop / Web interface is composed of a number of section similar to those provided in the original OKIT BUI. These 
provide similar functionality but with some key difference that will be document below.

![OCD Desktop](images/OcdDesktop.png)

## Palette

Location of all resources that can be used within OCD. These are split into two tabs.

### Provider

The Provider tab contains a set of provider (currently only OCI) Resources that are available within the OCD Desktop to design your architecture. These resources can be displayed in either a simple, icon only, or a verbose format, icon and name. When you want to add a resource to your architecture simply drag it from the palette onto the canvas.

### Model

The Model tab contains a list of all Resource that have already been added to the design allowing the user to drag a second copy of the resource onto the canvas, either the 
same [Page/View](#pagesviews) or a new [Page/View](#pagesviews).

## Canvas

Freeform location where your design can be created. Once a Resource has been dragged from the palete and dropped on the canvas it can subsequently be moved as required by the user. In addition container style Resource (Vcn / Subnet) will also allow resize and can contain other resources. It should be noted that Compartments are not represented on the
canvas as a Resource but rather created as Layers using the top tab bar. These compartment layers can subsequently be shown/hidden and the Resources within the Compartment layer will be shown/hidden on the canvas.

## Pages/Views

The Page/View Tabs (at base of canvas) allow the user to create multiple visual representations of the same design/model by selecting resources from the "Model" palette.

## Properties

The properties panel provides access to the edittable properties available for the selected Resource. In addition the User can provide Resource specific documentation that will be included in any generated Markdown.

# Scripts

- __install__ : Installs all required modules for the sub packages
- __build__ : Script will build all packages within the ocd workspace
- __import__ : Imports the Terraform Schemas and converts them to the standard OCD Resource schema that can then be used to generate the TypeScript 
and React code.
- __generate__ : Reads the OCD Schema file and generates Model, Properties and Terraform TypeScript / React files.
- __import-and-generate__ : Executes "import" and then "generate" scripts
- __web__ : Runs the development React web application and presents the Web BUI on [http://localhost:3000/](http://localhost:3000/)
- __desktop__ : Executes the build process and generates installation files in the ./dist directory.
    - __linux-desktop__ : Build just linux desktop
    - __macos-desktop__ : Build just MacOS desktop
    - __win-desktop__ : Build just Windows desktop


