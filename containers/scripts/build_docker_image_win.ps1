
#Create Docker Image on Windows without sh shell installed

$DOCKERIMAGE="okit"

$Scriptfolder = Split-Path -Path $PSScriptRoot -Parent
$Rootfolder= (get-item $Scriptfolder ).parent
$DockerFolder = "$Scriptfolder\docker"
Write-Host $Rootfolder

docker build --tag $DOCKERIMAGE --file $DockerFolder/Dockerfile --force-rm  $DockerFolder
