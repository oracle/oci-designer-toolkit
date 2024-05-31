# May 2024 Release (Version 0.60.0)
____
**Update 0.60.0**: This update addresses the following issues.
1. Modify OCI Import View CSS to allow the view to scroll to the bottom of the list and display the last element.
____
Welcome to the May 2024 release of OKIT. There is only a single update in this version for the original OKIT (Web) but core to this release is the first public Beta of the new OKIT - Open Cloud Designer or OCD.

## OKIT (Web) Features
1. Dynamic Groups: A new Dynamic groups resource has been added to the palette; allowing users to define this resource in addition to the existing Identity Groups.

## OKIT - Open Cloud Designer
The public Beta version of the OKIT - Open Cloud Designer is now available for user testing and the native desktop installs are attached to this release.

This Beta release shows the new desktop functionality that will be available in the next iteration of OKIT providing Native Installers rather than the current Web Based solution. In addtion to a native installation the designer provides a true Drag-&-Drop interface allowing the user to define the layout of there design without any of the previous restrictions.

The concept of container based layouts has been remove and as such Compartment are nolonger represented on the canvas but are created as tabs across the top of the design with functionality that will allow the user to hide/show resources associated with the compartment. We have also added the concept of multiple Page/Views of the designs resources by placing page tabs at the bottom of the design. Here the user can create addition pages to show sub-sets of the designs resources, which can be selected from the "model" palette.

At present the Open Cloud Designer only supports a subset of the original OKIT (Web) resources but this covers the core resource and more will be added soon.

___**Available Resources**___

| Resource                       | Properties | Terraform | Validation | Query   | Query Only |
| ------------------------------ | :--------: | :-------: | :--------: | :-----: | :--------: |
| VCN                            | &check;    | &check;   |            | &check; |            |
| Subnet                         | &check;    | &check;   |            | &check; |            |
| Security List                  | &check;    | &check;   |            | &check; |            |
| Route Table                    | &check;    | &check;   |            | &check; |            |
| DHCP Options                   | &check;    | &check;   |            | &check; |            |
| Internet Gateway               | &check;    | &check;   |            | &check; |            |
| NAT Gateway                    | &check;    | &check;   |            | &check; |            |
| Instance                       | &check;    | &check;   |            | &check; |            |
| Autonomous Database            | &check;    | &check;   |            | &check; |            |
| Load Balancer                  | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend Set      | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend          | &check;    | &check;   |            | &check; |            |
| Load Balancer Backend Listener | &check;    | &check;   |            | &check; |            |
| Block Volume                   | &check;    | &check;   |            | &check; |            |
| Volume Attachment              | &check;    | &check;   |            | &check; |            |
| Boot Volumes                   | &check;    | &check;   |            | &check; | &check;    |
| Boot Volumes Attachment        | &cross;    | &check;   |            | &check; | &check;    |
| Customer Premises Equipment    | &check;    | &check;   |            | &check; |            |
| Database System                | &check;    | &check;   |            | &check; |            |
| Service Gateway                | &check;    | &check;   |            | &check; |            |
| DRG                            | &check;    | &check;   |            | &check; |            |
| Local Peering                  | &check;    | &check;   |            | &check; |            |
| IPSec VPN                      | &check;    | &check;   |            | &check; |            |
| Dynamic Groups                 | &check;    | &check;   |            | &check; |            |
| Groups                         | &check;    | &check;   |            |         |            |
| Users                          | &check;    | &check;   |            |         |            |

### Native Installs
___At present we do not have any certificates associated with these and hence you may see some security warnings during execution. If you are happy to accept that the installation files built by GitHub are okey then
you will need to acknowledge in the appropriate dialog for your system.___

### OCD Desktop Features 

The OCD Desktop / Web interface is composed of a number of section similar to those provided in the original OKIT BUI. These provide similar functionality but with some key difference that will be document below.

![OCD Desktop](https://github.com/oracle/oci-designer-toolkit/blob/master/ocd/images/OcdDesktop.png)

#### Palette

Location of all resources that can be used within OCD. These are split into two tabs.

##### Provider

The Provider tab contains a set of provider (currently only OCI) Resources that are available within the OCD Desktop to design your architecture. These resources can be displayed in either a simple, icon only, or a verbose format, icon and name. When you want to add a resource to your architecture simply drag it from the palette onto the canvas.

##### Model

The Model tab contains a list of all Resource that have already been added to the design allowing the user to drag a second copy of the resource onto the canvas, either the 
same [Page/View](#pagesviews) or a new [Page/View](#pagesviews).

#### Canvas

Freeform location where your design can be created. Once a Resource has been dragged from the palete and dropped on the canvas it can subsequently be moved as required by the user. In addition container style Resource (Vcn / Subnet) will also allow resize and can contain other resources. It should be noted that Compartments are not represented on the
canvas as a Resource but rather created as Layers using the top tab bar. These compartment layers can subsequently be shown/hidden and the Resources within the Compartment layer will be shown/hidden on the canvas. In addition Compartment Layers can be coloured (Style in properties) and if the "Highlight Compartment Resources" is selected from the designer menu (above the palette) 
then the borders of resource will be coloured to match the compartment.

#### Pages/Views

The Page/View Tabs (at base of canvas) allow the user to create multiple visual representations of the same design/model by selecting resources from the "Model" palette.

#### Properties

The properties panel provides access to the edittable properties available for the selected Resource. In addition the User can provide Resource specific documentation that will be included in any generated Markdown.
