# Oracle Cloud Infrastructure Designer and Visualisation Toolkit [0.18.0](CHANGELOG.md#version-0.18.0)

OCI designer and visualisation toolKIT (OKIT) is a browser based tool that allows the user to [design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit), 
[deploy](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit) and visualise ([introspect/query](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)) 
OCI environments through a graphical web based interface. 

- [Design](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    The Web based interface will allow architects and designers to build a visual representation of their infrastructure
    and then export this in a number of formats. 

    - svg
    - png
    - jpeg

- [Export](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)

    Once completed the design can be enhanced to add key property information allowing the designed infrastructure to
    be exported to a number of DevOps frameworks or Markdown for documentation.
    
    - Ansible
    - Terraform
    - OCI Resource Manager
    - Markdown
    
    This allows for rapid proto-typing and building.

- [Introspect](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)

    OKIT will also allow the user to introspect existing OCI environments, through simple query functionality embedded within the
    web interface, to provide a portable generic json file, that can be used to visualise existing systems or generate terraform/ansible.
  
  _Note:_
```diff
+ The 0.18.0 release introduces a new implementation of the Introspection/Query feature  
+ that improves performance on large queries. The use can return to the classic query 
+ functionality by unchecking Fast Discovery in the preferences.
```

  
## Blogs
- [Introduction to OKIT the OCI Designer Toolkit](https://www.ateam-oracle.com/introduction-to-okit-the-oci-designer-toolkit)
- [The OCI Designer Toolkit Templates Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-templates-feature)
- [The OCI Designer Toolkit Query Feature](https://www.ateam-oracle.com/the-oci-designer-toolkit-query-feature)
- [OCI Designer Toolkit Resource Manager Integration](https://www.ateam-oracle.com/oci-designer-toolkit-resource-manager-integration)
- [The OCI Designer Toolkit Documentation Generation](https://www.ateam-oracle.com/the-oci-designer-toolkit-documentation-generation)


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

##### OCI Config File

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

##### GIT Settings File

If Git integration is required you will need to create a __git_repositories__ file within the directory 
__&lt;USER HOME DIR&gt;/.oci__ with contents similar to that below.

```properties
[OKIT Community Templates]
branch=main
url=git@github.com:username/okit-community-templates.git
  
[Example Repo]
branch = master
url = git@url1.git

[Internal]
branch = BRANCHNAME
url = git@url2.git
```

This properties file contains a list of the Git repositories you want to access. It assumes that you are using public/private
key access, the key files exist within your __&lt;USER HOME DIR&gt;/.ssh__ directory and the __&lt;USER HOME DIR&gt;/.ssh/config__
defines the key/url mapping, similar to the following.

```properties
Host github.com
	IdentityFile ~/.ssh/id_rsa_github
```


#### Run Container

```bash
docker run -d --rm -p 80:80 --volume <USER HOME DIR>/okit/user/templates:/okit/templates --volume <USER HOME DIR>/.oci:/root/.oci --volume <USER HOME DIR>/.ssh:/root/.ssh --name okit okit
```

Once started the Designer BUI can be accessed on [http://localhost/okit/designer](http://localhost/okit/designer)

## OpenID Connect Configuration for IDCS

To use OpenID Connect with IDCS two configurations are required.

### Setup of IDCS
Ask your administrator to update the primary (default) IDCS instance of your tenancy. This instance is often labled as OracleIdentityCloudService in the OCI Console login screen drop down.

In the steps we use <server_base_url>. The format is protocol://fully.qualified.host.name.

Configuration steps:
1. Log into IDCS admin console (https://idcs-aabbccddee6677889900ddhhaa.identity.oraclecloud.com/ui/v1/adminconsole)
1. From the hamburger menu on the upper left, select Applications.
1. Click 'Add'
1. In the 'Add Application' window select 'Confidential Application'
  1. In 'App Details' enter
    1. A unique 'Name'
    1. For 'Custom Logout URL' enter <server_base_url>/okit/postlogout
    1. Click 'Next'
1. In the Client step select 'Configure this application as a client now'
  1. In the Authorization section:
    1. Select the 'Grant Types': Client Credentials, JWT Assertion, Refresh Token, and Authorization Code
    1. Set the 'Redirect URL' to <server_base_url>/okit/postlogin.
    1. Set the 'Logout URL' to <server_base_url>/okit/logout.
    1. Set the 'Post Logout URL' to <server_base_url>/okit/postlogout.
1. Click 'Next' until the 'Finish' button can be selected.
1. Click 'Finish'
1. An 'Application Added' window shows the values for Client ID and Client Secret. Copy both values for later use. Click on 'Close' to close the window.
1. Click 'Activate' to enable the configuration.

### OKIT Configuration File

OKIT has one configuration file that must be updated. It requires these values:
* home_region - Get this value from your Oracle Cloud Infrastructure admin
* tenant_name - Get this value from your Oracle Cloud Infrastructure admin
* client_id - Get this value from the IDCS Confidential Application configuration (see above)
* client_secret - Get this value from the IDCS Confidential Application configuration (see above)
* idcs_instance_id - The IDCS instance id is part of the IDCS URL, e.g., the URL is https://idcs-aabbccddee6677889900ddhhaa.identity.oraclecloud.com and the value is aabbccddee6677889900ddhhaa
* server_base_url - The OKIT fully qualified server base URL. The value you used during the IDCS configuration. The format is protocol://fully.qualified.host.name.

The OKIT configuration file is located in the directory 'instance'.
* config.py - Replace the values for <idcs_instance_id>, <client_id>, <client_secrect>, and <server_base_url> with the respective values.

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


