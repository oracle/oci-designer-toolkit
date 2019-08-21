console.log('Loaded OKIT Common Javascript');

function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}

function standardiseId(id) {
    return id.r.replace(/\./g, '-');
}

/*
** Query OCI
 */

function handleQueryAjax(e) {
    $.ajax({
        type: 'get',
        url: 'oci/compartment',
        dataType: 'text',
        contentType: 'application/json',
        data: JSON.stringify(OKITJsonObj),
        success: function(resp) {
            console.log('Response : ' + resp);
            let jsonBody = JSON.parse(resp)
            let len =  jsonBody.length;
            for(let i=0;i<len;i++ ){
                console.log(jsonBody[i]['display_name']);
            }
        },
        error: function(xhr, status, error) {
            console.log('Status : '+ status)
            console.log('Error : '+ error)
        }
    });
}

function handleQueryOci(e) {
    window.location = 'oci/query/oci';
}

/*
** Set cursor icons
 */
function setBusyIcon() {
    $('*').css('cursor', 'wait');
}

function unsetBusyIcon() {
    $('*').css('cursor', 'auto');
}
