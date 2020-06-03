
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

#Create Docker Image on Windows without sh shell installed

$DOCKERIMAGE="okit"

$Scriptfolder = Split-Path -Path $PSScriptRoot -Parent
$Rootfolder= (get-item $Scriptfolder ).parent
$DockerFolder = "$Scriptfolder\docker"
Write-Host $Rootfolder

docker build --tag $DOCKERIMAGE --file $DockerFolder/Dockerfile --force-rm  $DockerFolder
