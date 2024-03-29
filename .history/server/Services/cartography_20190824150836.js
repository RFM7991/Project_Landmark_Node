var fs = require("fs")
const zipwriter = require('../mongo/zipwriter')
const tractWriter = require('../mongo/tractWriter')
const citySDK = require('./citysdk')
const tradeZonehelper = require('../helpers/tradeZoneHelper')

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
  }
}
   
  const getZoneCart = (state, tracts, callback) => {
    console.log('Points', tracts.length, tracts)
    let collection = []
    tracts.forEach(e => {
        cartography.getTractCart(state, e, (data) => {
            tracts.shift()
            collection.push(data)

            if (tracts.length == 0) 
                callback(collection)
        })  
    })
}


module.exports = methods