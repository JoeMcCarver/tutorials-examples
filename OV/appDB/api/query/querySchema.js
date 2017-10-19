var mongoose = require('mongoose');

var queryObjSchema = new mongoose.Schema({
    spId: {
        type: Number,
        required: true
    },
    district: Number,
    bus: Number,
    station: String,
    feederId: Number,
    region: String,
    phase: Number,
    type: {
        type: Number,
        required: false
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
    reads: [
        {
            readObj: {
                readDate: {
                    type: Date,
                    required: true
                },
                voltsA: {
                    type: Number,
                    required: false,
                    min: 1
                },
                voltsB: {
                    type: Number,
                    required: false,
                    min: 1
                },
                voltsC: {
                    type: Number,
                    required: false,
                    min: 1
                }
            }
        }
    ]
});

module.exports = queryObjSchema;
