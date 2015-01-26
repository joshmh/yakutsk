'use strict';

// XOR two buffers
module.exports = function xor(b1, b2) {
  if (b1.length !== b2.length) throw new Error('Buffers must be same size');

  var buf = new Buffer(b1.length);
  for (var i = 0; i < b1.length; i++) {
    buf[i] = b1[i] ^ b2[i];
  }

  return buf;
};
