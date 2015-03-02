// Adapted from: https://github.com/dcousens/bip32-wallet/blob/master/src/selection.js

var bitcoin = require('bitcoinjs-lib')
var Transaction = bitcoin.Transaction

// TODO: integrate privacy calculations, group by address, avoid linking multiple addresses together
// XXX: There may be better optimization techniques available here, may, be.
// TODO: integrate priority calculations
// var COIN = 100000000
// var freeThreshold = COIN * 144 / 250
// var isFree = inputs.reduce(function(accum, input) { return accum + priority(input) }, 0)  >  freeThreshold
//
// function priority(unspent) {
//   // unlike bitcoind, we assume priority is calculated for _right_ now
//   // not the next block
//   return unspent.value * unspent.confirmations
// }

// XXX: these are based on pubKeyHash estimates, the information is ignored so pre-calculated placeholders are used to improve performance
var dummy = {
  txHash: new Buffer(32),
  scriptPubKey: bitcoin.Script.fromBuffer(new Buffer(25)),
  scriptSig: bitcoin.Script.fromBuffer(new Buffer(106))
}

function estimateFeeWithChange (tx, network) {
  tx = tx.clone()
  tx.addOutput(dummy.scriptPubKey, network.dustSoftThreshold || 0)

  return network.estimateFee(tx)
}

function sortByValue (o1, o2) {
  return o2.value - o1.value
}

function filterByConf (o) {
  return o.confirmations >= 0
}

function selectInputs (unspents, outputs, network) {
  // sort by descending value
  var sorted = [].concat(unspents).sort(sortByValue).filter(filterByConf)

  var tx = new Transaction()
  var targetValue = 0

  outputs.forEach(function (output) {
    targetValue += output.value

    tx.addOutput(dummy.scriptPubKey, output.value)
  })

  var accum = 0
  var candidates = []
  var total = targetValue

  for (var i = 0; i < sorted.length; ++i) {
    var unspent = sorted[i]

    candidates.push(unspent)

    tx.addInput(dummy.txHash, 0, undefined, dummy.scriptSig)

    accum += unspent.value

    // ignore fees until we have the minimum amount
    if (accum < targetValue) continue

    var fee = network.estimateFee(tx)
    var changeFee = estimateFeeWithChange(tx, network)

    total = targetValue + fee
    var changeTotal = targetValue + changeFee

    // do we have enough for a change output
    if (accum >= changeTotal) {
      var change = accum - changeTotal

      return {
        change: change,
        fee: changeFee,
        inputs: candidates
      }
    }

    // no? what about without the change output
    if (accum >= total) {
      return {
        change: 0,
        fee: fee,
        inputs: candidates
      }
    }
  }

  throw new Error('Not enough funds (incl. fee): ' + accum + ' < ' + total)
}

module.exports = selectInputs
