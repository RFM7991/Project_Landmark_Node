const tradeZonehelper = require('../helpers/tradeZoneHelper')
const citySDK = require('./citysdk')
const cartography = require('./cartography')

const methods = {

    getTradeZoneCartography : (state, center, isCity, callback) => {
        console.log('Firing')
        let d =  (isCity ? 0.402 : 0.804);
        let points = methods.getBoundaries(center, d)
        citySDK.getTract(state, center.lat, center.lng, 
            (currentTract) => {
                methods.getTracts(currentTract, points, 
                    tracts => 
                        methods.getZoneCart(state, tracts, 
                            cartData => 
                                callback(cartData)
                        )
                )
        } )
        
    },

    getBoundaries : (center, distance) => {
        return tradeZonehelper.getPoints(center, distance)
    },
    
    getTracts : (currentTract, points, callback) => {
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
                    callback(collection)
                }
                
            })
        });
    },

    getZoneCart : (state, tracts, callback) => {
        let collection = []
        tracts.forEach(e => {
            cartography.getTractCart(state, e, (data) => {
                tracts.shift()
                collection.push(data)

                if (tracts.length == 0) 
                    callback(JSON.stringify({collection : collection}))
            })
        })
    }
}

module.exports = methods