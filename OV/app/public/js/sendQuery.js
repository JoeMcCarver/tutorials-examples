console.log('Loading --> send query...');
var socket = io();

socket.on('connect', () => {
    var submit = document.getElementById('ami-query');
    submit.addEventListener('click', (e) => {
        e.preventDefault();

        var formInput = {};

        var region = document.getElementsByClassName("region-select")[0].value,
            minVolt = document.getElementById("volt-min").value,
            maxVolt = document.getElementById("volt-max").value,
            startDate = document.getElementById("date-start").value,
            endDate = document.getElementById("date-end").value;

        if (!maxVolt || !startDate || !endDate) {
            socket.emit('ami-query-incomplete');
            $("#queryhelp").dialog("open");
            console.log('Nice Try, but you missed some essential fields');
        } else {

            var formInput = {
                "region": `${region}`,
                "min": `${minVolt}`,
                "max": `${maxVolt}`,
                "start": `${startDate}`,
                "end": `${endDate}`
            }

            console.log(formInput);

            socket.emit('ami-query', formInput);

        }


    });

});
console.log('...send query initialization complete.');
