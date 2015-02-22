var R = require('ramda')

function xor2 (a, b) {
  var buf = new Buffer(a.length)
  for (var i = 0; i < a.length; i++) {
    buf[i] = a[i] ^ b[i]
  }

  return buf
}

// XOR an array of buffers
module.exports = function xor (arr) {
  if (R.length(R.uniq(R.map(R.length, arr))) !== 1) {
    throw new Error('Buffers must be same size')
  }

  return R.reduce(xor2, R.head(arr), R.tail(arr))
}
