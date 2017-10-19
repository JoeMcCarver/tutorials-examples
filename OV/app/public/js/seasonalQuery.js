var socket = io();

var dbCollections = {
    // TODO this is an example, it will need to be dynamically created
    // to reflect actual collections of seasonal data
    "su16": 'data16_1summerLT114',
    "fa16": 'data16_2fallLT114',
    "wi16": 'data16_3winterLT114',
    "sp17": 'data17_0springLT114',
    "su17": 'data17_1summerLT114'
};

socket.on('seasonCollections', (collections) => {
    
    dbCollections = {
        //TODO sort and identify collections
    };
    
    collections.forEach((collection) => {
        
    });
    
});

socket.on('connect', () => {
    
    socket.emit('getCollections');

    var submit = document.getElementById('seasonalButton');
    var ltVolt = document.getElementById('voltsSEL');
    
    ltVolt.addEventListener('change', (e) => {
        e.preventDefault();
        
    });

    submit.addEventListener('click', (e) => {
        e.preventDefault();

        var season = document.getElementById("seasonSEL").value,
            year = document.getElementById("seasonYR").value;

        console.log(`Seasonal Button Clicked --> Season: ${season}, Year: ${year}`);

        switch (year) {
            case '2012':
                year = 12;
                break;
            case '2013':
                year = 13;
                break;
            case '2014':
                year = 14;
                break;
            case '2015':
                year = 15;
                break;
            case '2016':
                year = 16;
                break;
            case '2017':
                year = 17;
                break;
            case '2018':
                year = 18;
                break;
            case '2019':
                year = 19;
                break;
        }

        var dbColl = '';

        switch (season) {
            case 'spring':
                dbColl += 'sp';
                break;
            case 'summer':
                dbColl += 'su';
                break;
            case 'fall':
                dbColl += 'fa';
                break;
            case 'winter':
                dbColl += 'wi';
                break;
        }

        dbColl += `${year}`;

        console.log(`dbColl --> ${dbColl}`);

        var getCollection = dbCollections[`${dbColl}`];

        console.log(`Event --> Seasonal Query request: ${getCollection}`);

        socket.emit('seasonalDataQ', getCollection);

    });
});


console.log('...seasonal query initialization complete.');
