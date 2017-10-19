var wincmd = require('node-windows');

wincmd.list(function (svc) {

    var count = 0;

    svc.forEach(function (service) {
            var name = service.ImageName;
        if (name === 'voltq.exe' || name === 'node.exe') {
            count++;
            var pid = service.PID;
            var sessionNum = service['Session#'];
            var mem = service.MemUsage;
            var window = service.WindowTitle;
            var str = `Process# ${count} --> ${name}/${pid}\nSession Number: ${sessionNum}, Mem: ${mem}, Window: ${window}\n\n`
            console.log(str);
        }
    });
}, true);
