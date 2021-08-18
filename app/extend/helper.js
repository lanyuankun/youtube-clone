const crypto = require('crypto')
const _ = require('lodash')
exports.md5 = str => {
    return crypto.createHash('md5').update(str).digest('hex')
}
exports._ = _

exports.isSame = (obj1, obj2) => {
    return obj1.toString() == obj2.toString()
}