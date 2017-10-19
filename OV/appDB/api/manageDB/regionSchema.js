var regionSchema = {
  // service point ID
  stationCode: {
    type: String,
    required: true,
    unique: true
  },
  region: {
    type: String,
    required: true
  }
};

module.exports = regionSchema;
