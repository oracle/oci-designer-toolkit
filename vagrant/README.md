# Vagrantfile to set up a Vbox Vagrant VM with OKIT
A Vagrantfile that installs and configures an Oracle Linux 7 Vagrant VM for running OKIT 

## Prerequisites
1. Install [Oracle VM VirtualBox](https://www.virtualbox.org/wiki/Downloads)
2. Install [Vagrant](https://vagrantup.com/)
3. If you have VirtualBox 6.1 installed you need to apply a small fix to get Vagrant to work, https://blogs.oracle.com/scoter/getting-vagrant-226-working-with-virtualbox-61-ga
 

## Getting started
1. Clone this repository `git clone git@orahub.oraclecorp.com:andrew.hopkinson/okit.oci.web.designer.git`. When the repos is cloned from orahub you need to disconnect to be able to continue

2. Copy your .oci/config file to the okit.oci.web.designer/vagrant folder. The vagrant should now have these files: 
    - Vagrantfile
    - run-as-root.sh
    - run-as-vagrant.sh
    - config
    - README.md

3. Navigate to the vagrant folder and run `vagrant up; vagrant ssh`
This step takes about 30 minutes on my mac, a little longer the first time as the Vbox image is downloaded from github. 
    - NOTE! There seems to be an issue using the terminal in MobaXterm. The regular Windows cmd shell works.
    
4. After the Vagrant VM is built the vagrant users home folder should have folders from the cloned okit.oci.web.designer repository exposed in the Vagrant vm in the vagrant users home directory (/okitweb, /visualiser & /output). The OKIT app should also be running. To access the app the ports have been forwarded to the host and you should be able to access OKIT on http://localhost:8080/okit/designer from the host.



## 

## Feedback