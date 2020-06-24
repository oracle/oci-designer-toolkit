
# Copyright (c) 2020, Oracle and/or its affiliates.
# Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

#Start Docker image on windows
#Assuming that OCI CLI it's configured in default path - oci setup config

Clear-Host

$Scriptfolder =  Split-Path -Path $PSScriptRoot 
Write-Host $Scriptfolder
               
$Rootfolder= Split-Path -Path $Scriptfolder 
Write-Host $Rootfolder

$LogFolder = Join-Path -Path $Rootfolder -ChildPath "log"
Write-Host $LogFolder

$VisualizerFolder =Join-Path -Path $Rootfolder -ChildPath "Visualizer"
Write-Host $VisualizerFolder

$OkitwebFolder =Join-Path -Path $Rootfolder -ChildPath "okitweb"
Write-Host $OkitwebFolder

#default in Userprofile .oci 
$OciCliFolder =  Join-Path -Path $ENV:UserProfile -ChildPath ".oci"


if (-not (Test-Path -LiteralPath $LogFolder)) {
    
    try {
        New-Item -Path $LogFolder -ItemType Directory -ErrorAction Stop | Out-Null #-Force
    }
    catch {
        Write-Error -Message "Unable to create directory '$LogFolder'. Error was: $_" -ErrorAction Stop
    }
    "Successfully created directory '$LogFolder'."

}

if (-not (Test-Path -LiteralPath $OciCliFolder)) 
{ 
    Write-Error -Message "Unable to find OCI CLi folder '$OciCliFolder'. Error was: $_" -ErrorAction Stop

}


& "docker" run --rm -it -p 443:443/tcp -p 80:80/tcp --hostname okit --name okit -v $ENV:UserProfile\.oci:/root/.oci  -v $Rootfolder\okitweb:/okit/okitweb -v $Rootfolder\visualiser:/okit/visualiser -v $Rootfolder\log:/okit/log okit:latest
