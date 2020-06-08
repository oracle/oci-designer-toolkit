
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

#Start Docker image on windows
#Assuming that OCI CLI it's configured in default path - oci setup config

$Scriptfolder = Split-Path -Path $PSScriptRoot -Parent
$Rootfolder= (get-item $Scriptfolder ).parent
Write-Host $Rootfolder


docker run --rm -p 443:443/tcp -p 80:80/tcp --hostname okit --name okit -v $ENV:UserProfile\.oci:/root/.oci  -v $Rootfolder\okitweb:/okit/okitweb -v $Rootfolder\visualiser:/okit/visualiser -v $Rootfolder\log:/okit/log okit:latest
