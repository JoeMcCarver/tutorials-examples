var _ = require('lodash');

var config = {
    dev: 'developement',
    test: 'testing',
    prod: 'production',
    port1: 80,
    port2: 8080,

    logging: false,
    dateTime: function () {

        var date = new Date();

        var hour = date.getHours();
        hour = (hour < 10 ? "0" : "") + hour;

        var min = date.getMinutes();
        min = (min < 10 ? "0" : "") + min;

        var sec = date.getSeconds();
        sec = (sec < 10 ? "0" : "") + sec;

        var month = date.getMonth() + 1;
        month = (month < 10 ? "0" : "") + month;

        var day = date.getDate();
        day = (day < 10 ? "0" : "") + day;

        var year = date.getFullYear();

        return `${year}:${month}:${day}:${hour}:${min}:${sec}`;
    },
    forever: {
        'silent': false, // Silences the output from stdout and stderr in the parent process
        'uid': 'VoltQ', // Custom uid for this forever process. (default: autogen)
        'pidFile': 'C:\\VoltQ-Application\\daemon\\PID', // Path to put pid information for the process(es) started
        'max': 10, // Sets the maximum number of times a given script should run
        'killTree': true, // Kills the entire child process tree on `exit`

        'minUptime': 2000, // Minimum time a child process has to be up. Forever will 'exit' otherwise.
        'spinSleepTime': 1000, // Interval between restarts if a child is spinning (i.e. alive < minUptime).

        'command': 'node', // Binary to run (default: 'node')
        'sourceDir': "C:\\VoltQ-Application", // Directory that the source script is in

        'watch': true, // Value indicating if we should watch files.
        'watchDirectory': "C:\\VoltQ-Application", // Top-level directory to watch from.

        'cwd': 'C:\\VoltQ-Application',

        'logFile': 'C:\\VoltQ-Application\\daemon\\voltq.forever.log', // Path to log output from forever process
        'outFile': 'C:\\VoltQ-Application\\daemon\\voltq.out.log', // Path to log output from child stdout
        'errFile': 'C:\\VoltQ-Application\\daemon\\voltq.error.log' // Path to log output from child stderr
    },
    arcfm: {
        name: 'ArcFM',
        auth: {
            user: "jjm0966",
            password: "jjmfm66",
            connectString: "arcfm"
        },
        pMeter: 'ACE.PRIMARYMETER',
        sMeter: 'ACE.SECONDARYMETER',
        spA: 'ACE.MWM_ORDER_LAT_LONG_A',
        spB: 'ACE.MWM_ORDER_LAT_LONG_B'
    },
    volt: {
        name: 'VOLT',
        auth: {
            user: "jjm0966",
            password: "Summ3rtim3",
            connectString: "volt"
        },
        vFacts: 'VOLT.VOLTAGE_FACT'
    },
    pq: {
        name: 'huckleberry'
    }
};

// check to see if NODE_ENV was set, if not, default to dev
process.env.NODE_ENV = process.env.NODE_ENV || config.dev;

var envConfig = require(`./${process.env.NODE_ENV}`);

module.exports = _.merge(config, envConfig);
