const tradeZonehelper = require('../helpers/tradeZoneHelper')
const citySDK = require('citysdk')
const cartography = require('cartography')

const methods = {

    getBoundaries : (center, distance) => {
        return tradeZonehelper.getPoints(center, distance)
    },
    
    getTracts : (points) => {
        let collection = []
        points.array.forEach(e => {
            citySDK.getTract(e.lat, e.lng, (data) => {
                let tract = data[0].tract
                if (!collection.includes(tract)) {
                    collection.push(tract)
                }
            })
            return Promise.all(collection).catch(alert)
        });
    },

    getZoneCart : (state, tracts) => {
        let collection = []
        tracts.array.forEach(e => {
            cartography.getTractCart(state, e, (data) => {
                collection.push(data)
            })
        })
    }
}

get
module.exports = methods