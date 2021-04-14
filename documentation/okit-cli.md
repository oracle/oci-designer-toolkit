# OCI Designer Toolkit OKIT CLI

The __okit-cli__ provides the user with the ability to interact with the OKIT functionality from the command line. 
At present this is limitted to converting the initial OKIT json files to the "**.okit**" format and from these "**.okit**"
files generating "**.svg**" files.

## Installation
Before using the __okit-cli__ you will need to install [nodejs](https://nodejs.org/en/) and once installed we will need
to install the required packages. 

### Package Installation
```bash
cd oci-designer-toolkit/node/okit-cli
npm install
```

## cli Syntax
This okit-cli provides a simple syntax, in the following format, that specifies command, action and files to act upon.
```bash
node src/okit-cli.js <COMMAND> <ACTION> <INPUT FILE> <OUTPUT FILE>
```

### Converting OKIT .json to .okit
Converting the okit "**.json**" files to the "**.okit**" format can be achieved using the following simple command
```bash
cd oci-designer-toolkit/node/okit-cli

node src/okit-cli.js import okit-json test/okit-node-test.json test/okit-node-test.okit
```

### Generate SVG
To generate an SVG image from an OKIT model we will need a "**.okit**" input file and hence if you only have the "**.json**" 
it will need to be converted. Once converted the "**.svg**" can be created with the following simple command.
```bash
cd oci-designer-toolkit/node/okit-cli

node src/okit-cli.js generate svg test/okit-node-test.okit test/okit-node-test.svg
```
