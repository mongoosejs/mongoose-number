// mongoose-number

module.exports = exports = function (mongoose) {
  require('./type')(mongoose);
  return require('./schema')(mongoose);
}

