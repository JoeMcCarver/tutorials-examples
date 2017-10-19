var mongoose = require('mongoose');

var amiSchema = new mongoose.Schema({
    // service point ID
    spId: {
        type: Number,
        required: true
    },
    merterNumber: Number,
    readTime: {
        type: Date,
        required: true
    },
    district: Number,
    bus: Number,
    feederId: String,
    phase: Number,
    type: {
        type: Number,
        required: false
    },
    volts: {
        A: Number,
        B: Number,
        C: Number
    },
    lat: {
        type: Number,
        required: true        
    },
    long: {
        type: Number,
        required: true        
    }
});

module.exports = amiSchema;
