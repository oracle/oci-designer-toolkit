#!/bin/bash
#
# This file is called from the Vagrantfile and completes the install of the Vagrant instance
# Some edits needed to make it work in your env.
#
# Set Python Variables
echo "export PYTHONIOENCODING=utf8" >> /home/vagrant/.bash_profile
echo "export PYTHONPATH=:/vagrant/okit.oci.web.designer/visualiser:/vagrant/okit.oci.web.designer/okitweb:/okit" >> /home/vagrant/.bash_profile

# Set Python Variables
#echo "export PYTHONIOENCODING=utf8" >> /home/vagrant/.bash_profile
echo "export PYTHONIOENCODING=utf8" >> /home/vagrant/.bash_profile
#echo "export PYTHONPATH=:/vagrant/okit.oci.web.designer/visualiser:/vagrant/okit.oci.web.designer/okitweb:/okit" >> /home/vagrant/.bash_profile
echo "export PYTHONPATH=:/vagrant/okit.oci.web.designer/visualiser:/vagrant/okit.oci.web.designer/okitweb:/okit" >> /home/vagrant/.bash_profile

# Specify Ansible Config variables
echo "export ANSIBLE_CONFIG_DIR=/okit/ansible/config" >> /home/vagrant/.bash_profile
echo "export ANSIBLE_INVENTORY=${ANSIBLE_CONFIG_DIR}/ansible_hosts" >> /home/vagrant/.bash_profile
echo "export ANSIBLE_CONFIG=${ANSIBLE_CONFIG_DIR}/ansible.cfg" >> /home/vagrant/.bash_profile
echo "export ANSIBLE_LIBRARY=${SRC}:${ANSIBLE_LIBRARY}" >> /home/vagrant/.bash_profile
# Flask
echo "export FLASK_APP=okitweb" >> /home/vagrant/.bash_profile
echo "export FLASK_DEBUG=development" >> /home/vagrant/.bash_profile
# Define System
#echo "export LANG en_GB.UTF-8" >> /home/vagrant/.bash_profile
#echo "export LANGUAGE en_GB:en" >> /home/vagrant/.bash_profile
#echo "export LC_ALL en_GB.UTF-8" >> /home/vagrant/.bash_profile
echo "export PATH=/usr/local/bin:/opt/python/bin:${PATH}" >> /home/vagrant/.bash_profile
# Define Aliases
echo '' >> /home/vagrant/.bash_profile

echo "alias lh='ls -lash' " >> /home/vagrant/.bash_profile
echo "alias lt='ls -last' " >> /home/vagrant/.bash_profile
echo "alias env='/usr/bin/env | sort' " >> /home/vagrant/.bash_profile
#echo "export PYTHONPATH=:/home/opc/okit/visualiser:/home/opc/okit/okitweb"


echo "alias lh='ls -lash' " >> /home/vagrant/.bash_profile
echo "alias lt='ls -last' " >> /home/vagrant/.bash_profile
echo "alias env='/usr/bin/env | sort' " >> /home/vagrant/.bash_profile
echo "alias ips='ip -f inet address' " >> /home/vagrant/.bash_profile
echo "alias ssh='/usr/bin/ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /home/vagrant/.bash_profile
echo "alias scp='/usr/bin/scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /home/vagrant/.bash_profile
echo "alias sshopc='ssh -i /okit/config/ssh/id_rsa_oci_test' " >> /home/vagrant/.bash_profile
echo "alias scpopc='scp -i /okit/config/ssh/id_rsa_oci_test' " >> /home/vagrant/.bash_profile
echo '' >> /home/vagrant/.bash_profile

echo "alias ta='terraform apply da.plan' " >> /home/vagrant/.bash_profile
echo "alias td='terraform destroy -var-file=/okit/config/connection.tfvars -auto-approve' " >> /home/vagrant/.bash_profile
echo "alias tp='terraform plan -var-file=/okit/config/connection.tfvars -out=da.plan' " >> /home/vagrant/.bash_profile
echo "alias ti='terraform init' " >> /home/vagrant/.bash_profile
echo "alias tg='terraform get --update' " >> /home/vagrant/.bash_profile
echo "alias apa='ansible-playbook main.yml --extra-vars \"@/okit/config/connection.yml\" ' " >> /home/vagrant/.bash_profile
echo "alias wtd='terraform destroy -var-file=/okit/config/wizards.tfvars -auto-approve' " >> /home/vagrant/.bash_profile
echo "alias wtp='terraform plan -var-file=/okit/config/wizards.tfvars -out=da.plan' "        >> /home/vagrant/.bash_profile

export OCI_CONFIG_DIR=/home/vagrant/
echo "export OCI_CONFIG_DIR=/vagrant/" >> /home/vagrant/okit-repo/vagrant/.bash_profile
