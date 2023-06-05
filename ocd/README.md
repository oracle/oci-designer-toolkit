# Getting Started OKIT Open Cloud Designer

The OCD project is a refactoring of the original OKIT implementation and TypeScript / JavaScript 
based implementation using React to build the interface and provide the WebServer. In addition
Electron is used to generate native installers for simplicity of installation and use.

# Scripts

## install

Installs all required modules for the sub packages

## build 

Script will build all packages within the ocd workspace

## import

Imports the Terraform Schemas and converts them to the standard OCD Resource schema that can then be used to generate the TypeScript 
and React code.

## generate

Reads the OCD Schema file and generates Model, Properties and Terraform TypeScript / React files.

## import-and-generate

Executes "import" and then "generate" scripts

## web

Runs the development React web application and presents the Web BUI on [http://localhost:3000/](http://localhost:3000/)

## desktop

Executes the build process and generates installation files in the ./packages/ocd-react/dist directory.


# Installing
Before the application can be either built as a desktop or run as a web server all appropriate node modules must be 
installed. This can be achieve by executing the to level __install__ script; as follows:

``` bash
npm run install
```

# Building Desktop Application

1. Generate TypeScript and React code from Schema
```bash
npm run generate
```
2. Build Desktop Application
```bash
npm run desktop
```
3. Install Application from packages/ocd-react/dist


# Running Development Web Application

1. Generate TypeScript and React code from Schema
```bash
npm run generate
```
2. Run Web Server
```bash
npm run web
```
3. Access BUI on [http://localhost:3000/](http://localhost:3000/)
