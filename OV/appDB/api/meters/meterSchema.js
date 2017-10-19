var meterSchema = {
  // service point ID
  spId: {
    type: Number,
    unique: true
  },
  gisoNumber: {
    type: Number,
    required: true,
    unique: true
  },
  meterNumber: {
    type: Number,
    unique: true
  },
  station: String,
  feederId: Number,
  region: String,
  operatingVoltage: Number,
  phaseDesignation: Number,
  long: {
    type: Number,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  county: String
};

module.exports = meterSchema;
