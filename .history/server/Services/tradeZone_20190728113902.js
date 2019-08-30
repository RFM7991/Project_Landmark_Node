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
            
        });
    },

    getTractBoundaries : (tracts) => {
        let collection = []
        points.array.forEach(element => {
            if (!collection.includes(element)) {
                collection.push(element)
            }
        });
    }
}

get
module.exports = methods