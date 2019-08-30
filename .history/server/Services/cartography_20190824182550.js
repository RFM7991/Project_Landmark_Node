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

  getCartographicGeoJSON : () => {
    census({
      "vintage" : 2017,
      "geoHierarchy" : {
        "metropolitan statistical area/micropolitan statistical area": "*"
      },
      "geoResolution" : "500k" // required
    }, 
    (err, res) => {
      fs.writeFile("./directory/filename.json", 
        JSON.stringify(res), 
        () => console.log("done")
    )}
  }
}
const getBoundaries = (center, distance) => {
  return tradeZonehelper.getPoints(center, distance)
}
const getZoneCart = (state, tracts, callback) => {
  console.log('Points', tracts.length, tracts)
  let collection = []
  tracts.forEach(e => {
      methods.getTractCart(state, e, (data) => {
          collection.push(data)

          if (collection.length == tracts.length) 
              callback(collection)
      })  
  })
}

const getTracts = (currentTract, points, callback) => {
  let collection = []
  points.forEach((e, i)=> {
      citySDK.getTract(e.lat, e.lng, (data) => {
          let tract = data[0].tract
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