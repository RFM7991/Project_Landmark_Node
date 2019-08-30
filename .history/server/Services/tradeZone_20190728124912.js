const tradeZonehelper = require('../helpers/tradeZoneHelper')
const citySDK = require('./citysdk')
const cartography = require('./cartography')

const methods = {

    getTradeZoneCartography : (state, center, isCity) => {
        console.log('Firing')
        let d =  (isCity ? 0.402 : 0.804);
        let points = methods.getBoundaries(center, d)
        methods.getTracts(points, (tracts) => {
            methods.getZoneCart(state, tracts)
        })
     //   .then(tracts => methods.getZoneCart(state, tracts)
      //      .then(cartData => console.log(cartData)))
    },

    getBoundaries : (center, distance) => {
        return tradeZonehelper.getPoints(center, distance)
    },
    
    getTracts : (points, callback) => {
        let collection = []
        points.forEach((e, i)=> {
            citySDK.getTract(e.lat, e.lng, (data) => {
                let tract = data[0].tract
                points.shift()
                if (!collection.includes(tract)) {
                    console.log('TEST', i, tract, points.length)
                    collection.push(tract)
                }
                if (points.length == 0) {
                    callback(collection)
                }
                
            })
        });
    },

    getZoneCart : (state, tracts) => {
        let collection = []
        tracts.array.forEach(e => {
            cartography.getTractCart(state, e, (data) => {
                collection.push(data)
            })
        })
        return Promise.all(collection).catch(alert)
    }
}

module.exports = methods