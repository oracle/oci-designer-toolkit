#!/bin/bash

# Copyright (c) 2019  Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0 [https://oss.oracle.com/licenses/upl/]

#
# This file is called from the Vagrantfile and completes the install of the Vagrant instance
# Some edits needed to make it work in your env.
#

export PATH=/usr/local/bin:$PATH

# Install software as root
yum update -y
if [ -f /usr/bin/ol_yum_configure.sh ];
then
    /usr/bin/ol_yum_configure.sh
    yum update -y
fi

yum install -y \
  oracle-softwarecollection-release-el7 \
  oraclelinux-developer-release-el7 \
  oracle-epel-release-el7
yum repolist all
yum update -y
yum install -y \
  ansible \
  curl \
  git \
  make \
  nano \
  nginx \
  oci-utils \
  openssl \
  python36 \
  python36-virtualenv \
  python-oci-cli \
  sudo \
  tar \
  terraform \
  tree \
  wget
yum repolist all
yum clean all

# Install pip
rm -fv /usr/bin/python3
ln -sv /usr/bin/python3.6 /usr/bin/python3
cd /tmp
curl https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py
python3 /tmp/get-pip.py
pip3 install --upgrade pip

# Install required python modules
cd /tmp
pip3 install \
    ansible \
    flask \
    gunicorn \
    jinja2 \
    oci \
    pyyaml \
    werkzeug

# Install oci ansible module
cd /tmp
git clone https://github.com/oracle/oci-ansible-modules.git
cd oci-ansible-modules
python3 ./install.py

# Add Environment
echo 'export PYTHONIOENCODING="utf8"'                                            >> /etc/bashrc
echo 'export PYTHONPATH=":/okit/visualiser:/okit/okitweb:/okit"'                 >> /etc/bashrc
echo 'export FLASK_APP=okitweb'                                                  >> /etc/bashrc
echo 'export FLASK_DEBUG=development'                                            >> /etc/bashrc
echo ''                                                                          >> /etc/bashrc
echo "alias lh='ls -lash' "                                                      >> /etc/bashrc
echo "alias lt='ls -last' "                                                      >> /etc/bashrc
echo "alias env='/usr/bin/env | sort' "                                          >> /etc/bashrc
echo "alias ips='ip -f inet address' "                                           >> /etc/bashrc
echo "alias ssh='/usr/bin/ssh -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /etc/bashrc
echo "alias scp='/usr/bin/scp -oStrictHostKeyChecking=no -oUserKnownHostsFile=/dev/null -oConnectTimeout=10' " >> /etc/bashrc
echo ''                                                                          >> /etc/bashrc
echo 'export PATH=/opt/python/bin:${PATH} '                                      >> /etc/bashrc
echo "alias ta='terraform apply da.plan' "                                                     >> /etc/bashrc
echo "alias td='terraform destroy -var-file=/okit/config/connection.tfvars -auto-approve' "    >> /etc/bashrc
echo "alias tp='terraform plan -var-file=/okit/config/connection.tfvars -out=da.plan' "        >> /etc/bashrc
echo "alias ti='terraform init' "                                                              >> /etc/bashrc
echo "alias tg='terraform get --update' "                                                      >> /etc/bashrc
echo "alias apa='ansible-playbook main.yml --extra-vars \"@/okit/config/connection.yml\" ' "   >> /etc/bashrc
echo ''                                                                          >> /etc/bashrc
echo "alias startflask='python3 -m flask run --host=0.0.0.0 --port=8080 --no-debugger'"
echo "alias startgunicorn='nginx;gunicorn --workers=2 --limit-request-line 0 --bind=0.0.0.0:5000 okitweb.wsgi:app'"
source /etc/bashrc

# Create Directories
mkdir -p /workspace
mkdir -p /okit/{ansible,config,converter,terraform,visualiser,okitweb,workspace,python,unittests,preview};
mkdir -p /home/vagrant/okit
chown -R vagrant:vagrant /home/vagrant/okit

# Change Default nginx Config (Socket)
cat > /etc/nginx/nginx.conf <<EOF 
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
    }

      http {
          log_format  main  '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                            '\$status \$body_bytes_sent "\$http_referer" '
                            '"\$http_user_agent" "\$http_x_forwarded_for"';

          access_log  /var/log/nginx/access.log  main;

          sendfile            on;
          tcp_nopush          on;
          tcp_nodelay         on;
          keepalive_timeout   65;
          types_hash_max_size 2048;

          include             /etc/nginx/mime.types;
          default_type        application/octet-stream;

          # Load modular configuration files from the /etc/nginx/conf.d directory.
          # See http://nginx.org/en/docs/ngx_core_module.html#include
          # for more information.
          include /etc/nginx/conf.d/*.conf;

          server {
              listen       80 default_server;
              server_name  _;
              root         /usr/share/nginx/html;

              # Load configuration files for the default server block.
              include /etc/nginx/default.d/*.conf;

              location / {
                  #proxy_pass http://127.0.0.1:5000/;
                  proxy_pass http://unix:/var/run/gunicorn.sock;
                  proxy_redirect   off;
                  proxy_set_header Host \$http_host;
                  proxy_set_header X-Real-IP \$remote_addr;
                  proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto \$scheme;
              }

              error_page 404 /404.html;
                  location = /40x.html {
              }

              error_page 500 502 503 504 /50x.html;
                  location = /50x.html {
              }
          }
      }
EOF

# Write GUnicorn Service
cat > /etc/systemd/system/gunicorn.service <<EOF 
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
Type=notify
# the specific user that our service will run as
User=vagrant
Group=vagrant
Environment="PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin"
Environment="PYTHONPATH=${PYTHONPATH}"
RuntimeDirectory=gunicorn
WorkingDirectory=/home/vagrant/okit
ExecStart=/usr/local/bin/gunicorn okitweb.wsgi:app
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Write GUnicorn Socket
cat > /etc/systemd/system/gunicorn.socket <<EOF 
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/var/run/gunicorn.sock
# Our service won't need permissions for the socket, since it
# inherits the file descriptor by socket activation
# only the nginx daemon will need access to the socket
User=nginx
# Optionally restrict the socket permissions even more.
# Mode=600

[Install]
WantedBy=sockets.target
EOF

# Write Flask Service
cat > /etc/systemd/system/flask.service <<EOF
[Unit]
Description=Flask daemon
After=network.target

[Service]
Type=notify
# the specific user that our service will run as
User=vagrant
Group=vagrant
Environment="PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin"
Environment="PYTHONPATH=${PYTHONPATH}"
Environment="FLASK_APP=okitweb"
Environment="FLASK_DEBUG=development"
RuntimeDirectory=flask
WorkingDirectory=/home/vagrant/okit
ExecStart=/usr/bin/python3 -m flask run --host=0.0.0.0 --port=8080 --no-debugger
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Config SELinux
setsebool -P httpd_can_network_connect 1
# Reload
systemctl daemon-reload

# enable and start Flask
systemctl enable flask.service
#systemctl start flask.service

# enable and start nginx
#systemctl enable nginx
#systemctl start nginx

# Enable Gunicorn
#pip3 install configparser flask flask-cors flask_restful gunicorn ipaddress ipcalc jinja2 oci pexpect pyyaml
#pip3 install requests simplejson six svglib svg.path wtforms xlrd
#systemctl enable gunicorn.service
#systemctl enable gunicorn.socket
#systemctl start gunicorn.socket
#systemctl restart gunicorn.service

# Set Firewall Rules
firewall-offline-cmd  --add-port=80/tcp
firewall-offline-cmd  --add-port=8080/tcp
firewall-offline-cmd  --add-port=8888/tcp
firewall-offline-cmd  --add-port=5000/tcp
systemctl restart firewalld

# Install netdata
# Optional but could be useful to monitor the VM.
# bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait

