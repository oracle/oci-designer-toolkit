function handleSubmitQuery(e) {
    $('*').css('cursor', 'wait');
    var queryJsonBody = {};
    queryJsonBody['compartment_id'] = $('#compartment').val();
    queryJsonBody['virtual_cloud_network_filter'] = {'display_name': $('#virtual_cloud_network_filter').val()};
    $.ajax({
        type: 'post',
        url: 'query',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(queryJsonBody),
        success: function(resp) {
            $('*').css('cursor', 'auto');
            //console.log('Response : ' + resp);
            $('#okitjson').html(resp);
            //window.location = 'generate/terraform';
            //openInNewTab('generate/terraform');
        },
        error: function(xhr, status, error) {
            $('*').css('cursor', 'auto');
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}


/*
** Add button handlers
 */
document.getElementById('submitquery').addEventListener('click', handleSubmitQuery, false);

