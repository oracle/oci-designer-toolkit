# Oracle Cloud Infrastructure Designer and Visualisation Toolkit [0.13.0](CHANGELOG.md#version-0.13.0)

OCI designer and visualisation toolKIT (OKIT) is a browser based tool that allows the user to [design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit), 
[deploy](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit) and visualise ([introspect/query](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)) 
OCI environments through a graphical web based interface. 

- [Design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    The Web based interface will allow architects and designers to build a visual representation of their infrastructure
    and then export this in a number of formats. 

    - svg
    - png
    - jpeg

- [Generate](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    Once completed the design can be enhanced to add key property information allowing the designed infrastructure to
    be exported to a number of DevOps frameworks.
    
    - Ansible
    - Terraform
    - OCI Resource Manager
    
    This allows for rapid proto-typing and building.

- [Introspect](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)

    OKIT will also allow the user to introspect existing OCI environments, through simple query functionality embedded within the
    web interface, to provide a portable generic json file, that can be used to visualise existing systems or generate terraform/ansible. 



## Installation
Detailed OKIT Installation steps can be found in the [OCI Designer Toolkit Installation Guide](documentation/Installation.md).

_Note:_
```diff
- OKIT is designed to be installed as a local single user container and it is recommended that you 
- do NOT install OKIT on an OCI Instance. Installing on an OCI Instance will leave you OCI Tenancy 
- open to anyone who can find the IP address. If you do decide to install on an OCI Instance the 
- OCI Designer Toolkit Installation Guide will give some recommendations for securing your Instance.
```

### Runtime Quick Start
[Docker](https://www.docker.com/products/docker-desktop) is the recommended runtime container for OKIT. The project contains a top-level Dockerfile to facilitate direct
building, of the runtime environment, from the docker command line.

#### Prerequisites 
Before building / running OKIT you will need to install [Docker / Docker Desktop](https://www.docker.com/products/docker-desktop).

#### Build Docker Container
```bash
docker build --tag okit --force-rm https://github.com/oracle/oci-designer-toolkit.git
```

#### Create / Generate Connection Information
If you already have the OCI sdk/cli installed on you machine you can use the previously generated pem key and config file
we will assume that this exists in &lt;USER HOME DIR&gt;/.oci 

##### Key File

If you do not have a previously generated private key you will need to create a private/public key pair for use with OKIT and OCI.
These keys can be generated using the following commands as defined in [Required Keys and OCIDs](https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm).

```bash
openssl genrsa -out <USER HOME DIR>/.oci/oci_api_key.pem 2048   
openssl rsa -pubout -in <USER HOME DIR>/.oci/oci_api_key.pem -out <USER HOME DIR>/.oci/oci_api_key_public.pem                                  
```

Upload the generated __oci_api_key_public.pem__ to OCI through the [console](https://docs.cloud.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm) and record the associated fingerprint following upload.

###### Get Fingerprint
```bash
openssl rsa -pubout -outform DER -in ~/.oci/oci_api_key.pem | openssl md5 -c
```

##### Config File

Create the OCI cli __config__ file in the directory __&lt;USER HOME DIR&gt;/.oci__ with contents similar to that below.
The __*key_file*__ is a fixed value because the contents of the __&lt;USER HOME DIR&gt;/.oci__ will be mounted to the
appropriate users home directory, as __~/.oci__, during the run process.

```properties
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaak6z......
fingerprint=3b:7e:37:ec:a0:86:1....
key_file=~/.oci/oci_api_key.pem  
tenancy=ocid1.tenancy.oc1..aaaaaaaawpqblfem........
region=us-phoenix-1
```

#### Run Container

```bash
docker run -d --rm -p 80:80 --volume <USER HOME DIR>/okit/user/templates:/okit/templates --volume <USER HOME DIR>/.oci:/root/.oci --name okit okit
```

Once started the Designer BUI can be accessed on [http://localhost/okit/designer](http://localhost/okit/designer)


## Usage / Examples
The OKIT User / Usage Guide and worked examples can be found in the [OCI Designer Toolkit Usage Guide](documentation/Usage.md)


## Changes

See [CHANGELOG](CHANGELOG.md).

## Known Issues

You can find information on any known issues with OKIT here and under the Issues tab of this project's GitHub repository.
Any issues found with the tool should be raised on the projects issues page. Please check that the issue has not previously
been reported. 


## Contributing
OCI Designer Toolkit is an open source project. See [CONTRIBUTING](CONTRIBUTING.md) for details.

If you would like to extend OKIT the development documentation can be found in [OCI Designer Toolkit Development Guide](documentation/Development.md)


