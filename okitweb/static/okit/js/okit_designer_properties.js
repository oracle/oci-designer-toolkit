console.log('Loaded Properties Javascript');

/*
** Property Sheet Load function
 */

function assetSelected(type, id) {
    //console.log("Selected: " + type + " - " + id);
    if (type == 'VirtualCloudNetwork') {
        //$("#properties").load("propertysheets/virtualcloudnetwork.html");
        loadVirtualCloudNetworkProperties(id);
    } else if (type == "InternetGateway") {
        loadInternetGatewayProperties(id);
    } else if (type == "RouteTable") {
        loadRouteTableProperties(id);
    } else if (type == "SecurityList") {
        loadSecurityListProperties(id);
    } else if (type == "Subnet") {
        loadSubnetProperties(id);
    } else if (type == "LoadBalancer") {
        loadLoadBalancerProperties(id);
    } else {
        $("#properties").load("propertysheets/empty.html");
    }
}

function handlePropertiesDragEnd(e) {
    console.log('Properties Drag End');
}

var asset_propereties_width = 0;
function handlePropertiesMouseDown(e) {
    console.log('Properties Mouse Down : ' + e.target.clientWidth);
    asset_propereties_width = e.target.clientWidth;
}

function handlePropertiesMouseUp(e) {
    console.log('Properties Mouse Up : ' + e.target.clientWidth);
    if (asset_propereties_width != e.target.clientWidth) {
        redrawSVGCanvas();
    }
}

