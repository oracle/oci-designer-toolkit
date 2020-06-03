
#Start Docker image on windows
#Assuming that OCI CLI it's configured in default path - oci setup config

$Scriptfolder = Split-Path -Path $PSScriptRoot -Parent
$Rootfolder= (get-item $Scriptfolder ).parent
Write-Host $Rootfolder


docker run --rm -p 443:443/tcp -p 80:80/tcp --hostname okit --name okit -v $ENV:UserProfile\.oci:/root/.oci:Z  -v $Rootfolder\okitweb:/okit/okitweb:Z -v $Rootfolder\visualiser:/okit/visualiser:Z -v $Rootfolder\log:/okit/log:Z okit:latest
