#!/bin/bash

# Copyright (c) 2020, 2024, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Updating OKIT From GitHub                                    **"
echo "**                                                               **"
echo "*******************************************************************"

cd /github/oci-designer-toolkit
git pull 2>/dev/null

echo "*******************************************************************"
echo "**                                                               **"
echo "**  Run WebServer                                                **"
echo "**                                                               **"
echo "*******************************************************************"

export PYTHONIOENCODING=utf8
# export LANG=en_GB.UTF-8
# export LANGUAGE=en_GB:en
# export LC_ALL=en_GB.UTF-8

export PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin
export PYTHONPATH=:/okit/visualiser:/okit/okitweb:/okit

python3 --version

#/usr/local/bin/gunicorn --workers=4 --limit-request-line 0 --timeout 120 --bind=0.0.0.0:80 okitweb.wsgi:app
/usr/local/bin/gunicorn okitweb.wsgi:app --config /okit/config/gunicorn_http.py
