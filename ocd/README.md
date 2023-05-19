# Getting Started OKIT Open Cloud Designer

The OCD project is a refactoring of the original OKIT implementation and TypeScript / JavaScript 
based impleentation using React to build the interface and provide the WebServer. In addition
Electron is used to generate native installers for simplicity of installation and use.

# Scripts

## build 

Script will build all packages within the ocd workspace

## import

Imports the Terraform Schemas and converts them to the standard OCD Resource schema that can then be used to generate the TypeScript 
and React code.

## generate

Reads the OCD Schema file and generates Model, Properties and Terraform TypeScript / React files.

## import-and-generate

Executes "imaport" and then "generate" scripts

## web

Runs the development React web application and presents the Web BUI on [http://localhost:3000/](http://localhost:3000/)

## desktop

Executes the build process and generates installation files in the ./packages/ocd-react/dist directory.


# Building Desktop Application

1. Install required moduels
```bash
npm install -w ocd-codegen -w ocd-react 
```
2. Generate TypeScript and React code from Schema
```bash
npm run generate
```
3. Build Desktop Application
```bash
npm run desktop
```
4. Install Application from packages/ocd-react/dist

# Running Development Web Application

1. Install required moduels
```bash
npm install -w ocd-codegen -w ocd-react 
```
2. Generate TypeScript and React code from Schema
```bash
npm run generate
```
3. Run Web Server
```bash
npm run web
```
4. Access BUI on [http://localhost:3000/](http://localhost:3000/)
