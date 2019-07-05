#!/usr/bin/env bash
docker kill okit-oci-web-nginx
docker rm okit-oci-web-nginx
docker run --name okit-oci-web-nginx -v /Users/anhopki/Development/OraHub/andrew.hopkinson/okit.oci.web.designer/web/:/usr/share/nginx/html:ro -p 8080:80 -d nginx
docker ps -a
