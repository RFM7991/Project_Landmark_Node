var fs = require("fs")
const zipwriter = require('../mongo/zipwriter')
const tractWriter = require('../mongo/tractWriter')
const citySDK = require('./citysdk')

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

    getTradeZoneCartography : (state, center, isCity, callback) => {
      let radius =  (isCity ? 0.402 : 0.804);
      let points = getBoundaries(center, radius)
      citySDK.getTract(center.lat, center.lng, 
          (currentTract) => {
              getTracts(currentTract[0].tract, points, 
                  tracts => 
                      getZoneCart(state, tracts, 
                          cartData => 
                              callback(cartData)
                      )
              )
      })  
  },
    
   
}

module.exports = methods