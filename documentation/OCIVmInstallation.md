# OCI Designer Toolkit Installation Guide for OCI Instance
```diff
- THIS IS NOT RECOMMENDED BUT THESE NOTES ARE FOR THOSE WHO INSIST ON TRYING THIS
- THE FOLLOWING WILL SHOW HOW TO CONFIGURE OKIT WITH INSTANCE PRINCIPAL FUNCTIONALITY.
-
- IF YOU INSTALL OKIT WITH PUBLIC ACCESS THEN THE INSTANCE WILL POTENTIALLY HAVE COMPLETE ACCESS
- TO YOUR TENANCY ALLOWING FOR INTERROGATION AND CREATION OF OCI RESOURCES.
```
To install OKIT and run it within an OCI instance you will need to configure [Instance Principal](https://docs.cloud.oracle.com/en-us/iaas/Content/Identity/Tasks/callingservicesfrominstances.htm)
functionality within your Tenancy to allow the OKIT Instance to access OCI API and Query the Tenancy / Access Resource Manager.

When creating the Instance it is recommended the Instance is within its own Virtual Cloud Network / Subnet. The Subnet should 
be secured with a Security List that __only__ allows TCP/22 and TCP/443 port access to the Instance to allow the configuration of a [SSH Tunnel](#ssh-tunnel)
to restrict access to the Instance to authorised users or https authenticated using the OCI console login. 

Once the Instance has been created the following commands will install OKIT and create the service to run the WebServer.
```bash
# Install Required Packages 
sudo bash -c "yum install -y git"
sudo bash -c "yum install -y openssl"
sudo bash -c "yum install -y oci-utils"
# This is not required for OL8
sudo bash -c "yum install -y python-oci-cli"
# Update
sudo bash -c "yum update -y"
# Update Python Modules
sudo bash -c "python3 -m pip install -U pip"
sudo bash -c "python3 -m pip install -U setuptools"
# Clone OKIT
sudo bash -c "mkdir -p /github"
sudo bash -c "git clone -b master https://github.com/oracle/oci-designer-toolkit.git /github/oci-designer-toolkit"
sudo bash -c "mkdir -p /okit/{git,local,log,instance/git,instance/local,instance/templates/user,workspace,ssl}"
# Install OKIT Required python modules
sudo bash -c "python3 -m pip install --no-cache-dir -r /github/oci-designer-toolkit/requirements.txt"
# Link Directories
sudo bash -c "ln -sv /github/oci-designer-toolkit/config /okit/config"
sudo bash -c "ln -sv /github/oci-designer-toolkit/okitweb /okit/okitweb"
sudo bash -c "ln -sv /github/oci-designer-toolkit/visualiser /okit/visualiser"
sudo bash -c "ln -sv /github/oci-designer-toolkit/okitweb/static/okit/templates/reference_architecture /okit/instance/templates/reference_architecture"
# Copy Config
sudo bash -c "cp -v /github/oci-designer-toolkit/instance/config.py /okit/instance"
# Add additional environment information 
sudo bash -c "echo 'export PATH=$PATH:/usr/local/bin' >> /etc/bashrc"
sudo bash -c "echo 'export PYTHONPATH=:/okit/visualiser:/okit/okitweb:/okit' >> /etc/bashrc"
sudo bash -c "echo 'export OCI_CLI_AUTH=instance_principal' >> /etc/bashrc"
sudo bash -c "echo 'export OKIT_VM_COMPARTMENT=`oci-metadata -g compartmentID --value-only`' >> /etc/bashrc"
sudo bash -c "echo 'export OKIT_VM_REGION=`oci-metadata -g region --value-only`' >> /etc/bashrc"
# Generate ssl Self Sign Key
sudo bash -c "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /okit/ssl/okit.key -out /okit/ssl/okit.crt -subj '/C=GB/ST=Berkshire/L=Reading/O=Oracle/OU=OKIT/CN=www.oci_okit.com'"
# Copy GUnicorn Service File
# sudo bash -c 'sed "s/{COMPARTMENT_OCID}/`oci-metadata -g compartmentID --value-only`/" /okit/containers/services/gunicorn.oci.service > /etc/systemd/system/gunicorn.service'
sudo bash -c 'sed "s/{COMPARTMENT_OCID}/`oci-metadata -g compartmentID --value-only`/" /github/oci-designer-toolkit/containers/services/gunicorn.oci.service > /etc/systemd/system/gunicorn.service'
sudo bash -c 'sed -i "s/{REGION_IDENTIFIER}/`oci-metadata -g region --value-only`/" /etc/systemd/system/gunicorn.service'
sudo bash -c 'sed -i "s/<home_region>/`oci-metadata -g region --value-only`/" /okit/instance/config.py'
#####################################################################################
### Edit /okit/instance/config.py as described in OKIT Configuration File section ###
#####################################################################################
# Enable Gunicorn Service
sudo systemctl enable gunicorn.service
sudo systemctl start gunicorn.service
# Open Firewall
sudo firewall-offline-cmd  --add-port=443/tcp
sudo systemctl restart firewalld
```

## OpenID Connect Configuration for IDCS

To use OpenID Connect with IDCS two configurations are required.

### Setup of IDCS
Ask your administrator to update the primary (default) IDCS instance of your tenancy. This instance is often labled as OracleIdentityCloudService in the OCI Console login screen drop down.

In the steps we use <server_base_url>. The format is protocol://fully.qualified.host.name.

Configuration steps:
1. Select Identity -> Federation from the OCI Console Hamburger Menu. ![Identity Federation](images/Identity_Federation.png?raw=true "Identity Federation")
1. From the Cloud Provider Select the "Oracle Identity Cloud Service Console" url. ![Cloud Provider](images/Identity_Cloud_Provider.png?raw=true "Cloud Provider")
1. Log into IDCS admin console (e.g. https://idcs-aabbccddee6677889900ddhhaa.identity.oraclecloud.com/ui/v1/adminconsole)
1. From the hamburger menu on the upper left, select Applications.
1. Click 'Add' ![Identity Application](images/Identity_Application.png?raw=true "Identity Application")
1. In the 'Add Application' window select 'Confidential Application'![Confidential Application](images/Identity_Confidential_App.png?raw=true "Confidential Application")
    1. In 'App Details' enter
        1. A unique 'Name'
        1. For 'Custom Logout URL' enter <server_base_url>/okit/postlogout
        1. Click 'Next'
1. In the Client step select 'Configure this application as a client now'
    1. In the Authorization section:
        1. Select the 'Grant Types': Client Credentials, JWT Assertion, Refresh Token, and Authorization Code
        1. Set the 'Redirect URL' to <server_base_url>/okit/postlogin
        1. Set the 'Logout URL' to <server_base_url>/okit/logout
        1. Set the 'Post Logout URL' to <server_base_url>/okit/postlogout
1. Click 'Next' until the 'Finish' button can be selected.
1. Click 'Finish'
1. An 'Application Added' window shows the values for Client ID and Client Secret. Copy both values for later use. Click on 'Close' to close the window.
1. Click 'Activate' to enable the configuration.
1. From the hamburger menu on the upper left, select Settings.
1. Click 'Default' ![Identity Application](images/Idcs_Defaults.png?raw=true "Identity Application")
1. Turn on "Access Signing Certificate"

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

## Dynamic Group
A Tenancy level Dynamic Group will need to be created to enable Instance Principal access for the instance.

### OKITInstanceGroup
Create the OKITInstanceGroup Dynamic Group and add a single Rule relating to the OKIT Instance.
![OKIT Dynamic Group](images/DynamicGroup.png?raw=true "OKIT Dynamic Group")

## Policies
Tenancy level policies will need to be created for the Dynamic Group and depending on the required level of access either
the Query or Resource Manager level policies defined below should be specified.
### Query
```text
Allow dynamic-group OKITInstanceGroup to read all-resources in tenancy
Allow dynamic-group OKITInstanceGroup to use instances in tenancy
```
### Resource Manager
```text
Allow dynamic-group OKITInstanceGroup to manage orm-stacks in tenancy
Allow dynamic-group OKITInstanceGroup to manage orm-jobs in tenancy
Allow dynamic-group OKITInstanceGroup to manage all-resources in tenancy
```
### OKITInstancePrincipal
Create the OKITInstancePrincipal Policy and add either the Query or Resource Manager Policies.
![OKIT Dynamic Group Policies](images/DynamicGroupPolicies.png?raw=true "OKIT Dynamic Group Policies")

## SSH Tunnel
```bash
ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -N -L 8080:127.0.0.1:80 opc@<Instance IP> -i <Private Key File>
```

Once the tunnel has been created the OKIT Designer BUI can be accessed on [http://localhost:8080/okit/designer](http://localhost:8080/okit/designer).


