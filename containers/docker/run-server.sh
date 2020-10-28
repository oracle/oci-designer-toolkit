#!/bin/bash

# Copyright (c) 2020, Oracle and/or its affiliates.
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

export PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin
export PYTHONPATH=:/okit/visualiser:/okit/okitweb:/okit

/usr/local/bin/gunicorn --workers=4 --limit-request-line 0 --timeout 120 --bind=0.0.0.0:80 okitweb.wsgi:app
