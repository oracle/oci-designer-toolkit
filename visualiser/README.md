# OKIT Visualiser

## Installation

Install by creating the docker image as described in the README within the docker directory

## Usage

Creating OCI Assets from a Drawio diagram consists of the following steps:

- Create Drawio Image
- Export Drawio to __Uncompressed__ XML file (/oci/visualiser/test/drawio/OCITest.xml)
- Parse exported Drawio XML to create standard json (/oci/visualiser/test/input/OCITest.json)
- Generate Terraform files from standardised json to output directory (/oci/visualiser/test/output/terraform)
- Run terraform plan / apply on files in /oci/visualiser/test/output/terraform


### Parsing Drawio XML File

```bash
clear; python3 parser.py -s drawio -f /oci/visualiser/test/drawio/OCITest.xml -o /oci/visualiser/test/input/OCITest.json
```

### Parsing Visualiser Json

```bash
clear; python3 generate.py -d /oci/visualiser/test/output/ -f /oci/visualiser/test/input/OCITest.json
```

## Cleanup

## Development

## Contributing

Bug reports, enhancement request and pull requests are welcome on the OraHub at [oci.devops/issues](https://orahub.oraclecorp.com/cloud-tools-ateam/oci.devops/issues)

## Examples