
#Create Docker Image on Windows without sh shell installed

Clear-Host
$DOCKERIMAGE="okit"

$Scriptfolder =  Split-Path -Path $PSScriptRoot 

$Rootfolder= Split-Path -Path $Scriptfolder 
Write-Host $Rootfolder
$DockerFolder = Join-Path -Path $Scriptfolder -ChildPath "docker"
Write-Host $DockerFolder

docker build --tag $DOCKERIMAGE --file $DockerFolder/Dockerfile --force-rm  $DockerFolder

