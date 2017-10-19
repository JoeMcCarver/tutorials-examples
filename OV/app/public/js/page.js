$(document).ready(() => {
    console.log('Loading --> page');
    $('.accordion').accordion({
        active: 'false',
        collapsible: true,
        event: "click",
        heightStyle: 'content'
    });
    $('.region-select').chosen({
        placeholder_text_multiple: 'Select a Region...',
        width: 175,
        group_selectable: true
    });
    $("#helpDlg").dialog({
        autoOpen: false,
        buttons: [{
            text: "OK",
            click: () => {
                $(this).dialog("close");
            }
		}]
    });
    $("#help-button").click(() => {
        $("#helpDlg").dialog("open");
    });
    $('#date-start').datepicker({
        showButtonPanel: true,
        closeText: "Close",
        constrainInput: true,
        minDate: '01/01/2012',
        maxDate: -2,
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 1
    });
    $('#date-end').datepicker({
        showButtonPanel: true,
        closeText: "Close",
        constrainInput: true,
        minDate: '01/01/2012',
        maxDate: -1,
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 1
    });
    $("#queryhelp").dialog({
        autoOpen: false,
        buttons: [{
            text: "OK",
            click: () => {
                $(this).dialog("close");
            }
		}],
        titleColor: true,
        height: 'auto'
    });
    console.log('...page initialization complete.');
});
