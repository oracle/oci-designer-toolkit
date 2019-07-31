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

function deleteRouteRulesRow(btn) {
    var table = btn.parentNode.parentNode.parentNode;
    var row = table.parentNode;
    row.parentNode.removeChild(row);
}
