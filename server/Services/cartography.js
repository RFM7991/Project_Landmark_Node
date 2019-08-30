var fs = require("fs")
const zipwriter = require('../mongo/zipwriter')
const tractWriter = require('../mongo/tractWriter')
const citySDK = require('./citysdk')
const tradeZonehelper = require('../helpers/tradeZoneHelper')
const census = require('citysdk')

var methods = {
    getZipCartograpahy: (state, zip, callback) => {
      zipwriter.findZip(state, zip, (data) => {
        callback(data)
      })
    },

    getTractCart: (state, geoId, callback) => {
      tractWriter.findTract(state, geoId, (data) => {
        callback(data)
      })
    },

    getTradeZoneCartography : (state, center, isCity, callback) => {
      let radius =  (isCity ? 0.402 : 0.804);
      let points = getBoundaries(center, radius)
      citySDK.getTract(center.lat, center.lng, 
          (currentTract) => {
            console.log('TRACT DATA', currentTract)
              getTracts(currentTract[0].tract, points, 
                  tracts => 
                      getZoneCart(state, tracts, 
                          cartData => 
                              callback(cartData)
                      )
              )
      })  
  },
  getCartographicGeoJSON : (tract, callback) => 
  census({
    "vintage" : 2017,
    "geoHierarchy" : {
      "tract": { 'lat': 40.8581292, 'lng': -74.2053012 }
    },
    "geoResolution" : "500k" // required
  }, 
  (err, res) => {
    callback(err, res)
  }
)
}
const getBoundaries = (center, distance) => {
  return tradeZonehelper.getPoints(center, distance)
}
const getZoneCart = (state, geoIds, callback) => {
  console.log('Points', geoIds.length, geoIds)
  let collection = []
  geoIds.forEach(e => {
      methods.getTractCart(state, e, (data) => {
          collection.push(data)

          if (collection.length == geoIds.length) 
              callback(collection)
      })  
  })
}

const getTracts = (currentTract, points, callback) => {
  let collection = []
  points.forEach((e, i)=> {
      citySDK.getTract(e.lat, e.lng, (data) => {
          let tract = data[0].GEOID
          points.shift()
          if (!collection.includes(tract) && currentTract != tract) {
              console.log('TEST', i, tract, points.length)
              collection.push(tract)
          }
          if (points.length == 0) {
              collection.push(currentTract)
              callback(collection)
          }  
      })
  });
}


module.exports = methods