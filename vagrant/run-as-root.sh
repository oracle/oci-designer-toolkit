#!/bin/bash
#
# This file is called from the Vagrantfile and completes the install of the Vagrant instance
# Some edits needed to make it work in your env.
#

export PATH=/usr/local/bin:$PATH

# Install software as root
yum install -y oracle-softwarecollection-release-el7 oraclelinux-developer-release-el7 oracle-epel-release-el7
yum upgrade -y
yum install -y git nano ansible curl make nginx openssl python36 python36-virtualenv sudo tar terraform tree wget oci-utils python-oci-cli
/usr/bin/ol_yum_configure.sh
yum repolist all
yum clean all

# Install pip
rm -fv /usr/bin/python3 ; \
    ln -sv /usr/bin/python3.6 /usr/bin/python3 ; \
    cd /tmp ; \
    curl https://bootstrap.pypa.io/get-pip.py -o /tmp/get-pip.py ; \
    python3 /tmp/get-pip.py ; \
    pip3 install --upgrade pip

# Install required python modules
cd /tmp ; \
    pip3 install \
        flask \
        gunicorn \
        jinja2 \
        oci \
        pyyaml \
        simplejson \
        werkzeug

# Install oci ansible module
cd /tmp ; \
    git clone https://github.com/oracle/oci-ansible-modules.git ; \
    cd oci-ansible-modules ; \
    pip install ansible

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
          log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                            '$status $body_bytes_sent "$http_referer" '
                            '"$http_user_agent" "$http_x_forwarded_for"';

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
                  proxy_set_header Host $http_host;
                  proxy_set_header X-Real-IP $remote_addr;
                  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                  proxy_set_header X-Forwarded-Proto $scheme;
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
Environment="PYTHONPATH=:/vagrant/okit.oci.web.designer/visualiser:/vagrant/okit.oci.web.designer/okitweb:vagrant/okit.oci.web.designer"
RuntimeDirectory=gunicorn
WorkingDirectory=/vagrant/okit.oci.web.designer
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

# enable and start nginx
systemctl enable nginx
systemctl start nginx

# Enable Gunicorn
pip3 install configparser flask flask-cors flask_restful gunicorn ipaddress ipcalc jinja2 oci pexpect pyyaml
pip3 install requests simplejson six svglib svg.path wtforms xlrd
systemctl enable gunicorn.service
systemctl enable gunicorn.socket
systemctl start gunicorn.socket
systemctl restart gunicorn.service

# Install netdata
# Optional but could be useful to monitor the VM.
# bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait

