var BN = require('bignumber.js');
var pad = require('pad');

// Generates 128 bits of entropy from 50 fair die rolls
exports.generateBits = function generateBits(rolls) {
  if (rolls.length !== 50) throw new Error('We need 50 die rolls');

  var x = new BN(rolls[0] - 1);
  for (var i = 1; i < rolls.length; i++) {
    x = x.times(6).plus(rolls[i] - 1);
  }

  var hex = pad(32, x.toString(16).slice(-32), '0');
  return new Buffer(hex, 'hex');
};
