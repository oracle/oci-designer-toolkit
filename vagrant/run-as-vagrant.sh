#!/bin/bash
#
# This file is called from the Vagrantfile and completes the install of the Vagrant instance
# Some edits needed to make it work in your env.
#

# Set Python Variables
#echo "export PYTHONIOENCODING=utf8" >> /home/vagrant/.bash_profile

# Specify Ansible Config variables
echo "export ANSIBLE_CONFIG_DIR=/okit/ansible/config"               >> /home/vagrant/.bash_profile
echo "export ANSIBLE_INVENTORY=${ANSIBLE_CONFIG_DIR}/ansible_hosts" >> /home/vagrant/.bash_profile
echo "export ANSIBLE_CONFIG=${ANSIBLE_CONFIG_DIR}/ansible.cfg"      >> /home/vagrant/.bash_profile
echo "export ANSIBLE_LIBRARY=${SRC}:${ANSIBLE_LIBRARY}"             >> /home/vagrant/.bash_profile
# Define System
#echo "export LANG en_GB.UTF-8" >> /home/vagrant/.bash_profile
#echo "export LANGUAGE en_GB:en" >> /home/vagrant/.bash_profile
#echo "export LC_ALL en_GB.UTF-8" >> /home/vagrant/.bash_profile
echo "export PATH=/usr/local/bin:/opt/python/bin:${PATH}"           >> /home/vagrant/.bash_profile
# Define Aliases
echo '' >> /home/vagrant/.bash_profile

# Create a link to the .oci folder in the Vagrantfile folder on the host
ln -s /vagrant/.oci .oci

export OCI_CONFIG_DIR=~/.oci
echo "export OCI_CONFIG_DIR=~/.oci" >> /home/vagrant/.bash_profile
