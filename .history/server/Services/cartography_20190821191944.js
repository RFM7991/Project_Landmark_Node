var fs = require("fs")
const zipwriter = require('../mongo/zipwriter')
const tractWriter = require('../mongo/tractWriter')

var methods = {
    getZipCart: (state, zip, callback) => {
      zipwriter.findZip(state, zip, (data) => {
        callback(data)
      })
    },

    getTractCart: (state, tract, callback) => {
      tractWriter.findTract(state, tract, (data) => {
        callback(data)
      })
    },

    testZip: () => {
      tractWriter.initTractPost()
    }
   
}

module.exports = methods