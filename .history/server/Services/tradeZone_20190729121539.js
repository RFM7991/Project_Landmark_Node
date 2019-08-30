const tradeZonehelper = require('../helpers/tradeZoneHelper')
const citySDK = require('./citysdk')
const cartography = require('./cartography')

const methods = {

    getTradeZoneCartography : (state, center, isCity, callback) => {
        console.log('Firing')
        let d =  (isCity ? 0.402 : 0.804);
        let points = methods.getBoundaries(center, d)
        citySDK.getTract(center.lat, center.lng, 
            (currentTract) => {
                methods.getTracts(currentTract[0].tract, points, 
                    tracts => 
                        methods.getZoneCart(state, tracts, 
                            cartData => 
                                callback(cartData)
                        )
                )
        })
        
    },

    getTradeZoneStats: (center, isCity, callback) => {
        console.log('Firing')
        let d =  (isCity ? 0.402 : 0.804);
        let points = methods.getBoundaries(center, d)
        points.push(center)
        methods.filterTracts(points, 
            collection => 
                methods.getZoneStats(collection, 
                    stats => 
                        callback(stats)
                )
        )  
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

    filterTracts : (points, callback) => {
        let collection = []
        let tracts = []
        points.forEach((e, i)=> {
            citySDK.getTract(e.lat, e.lng, (data) => {
                let tract = data[0].tract
                points.shift()
                if (!tracts.includes(tract)) {
                    console.log('TEST', i, tract, points.length)
                    tracts.push(tract)
                    collection.push(e)
                }
                if (points.length == 0) {
                    callback(collection)
                }
                
            })
        });
    },

    getZoneCart : (state, tracts, callback) => {
        console.log('Balloon', tracts.length, tracts)
        let collection = []
        tracts.forEach(e => {
            cartography.getTractCart(state, e, (data) => {
                tracts.shift()
                collection.push(data)

                if (tracts.length == 0) 
                    callback(JSON.stringify({collection : collection}))
            })
        })
    },

    getZoneStats : (points, callback) => {
        console.log('Balloon', points.length, points)
        let collection = []
        points.forEach(e => {
            citySDK.getBasic('tract', e.lat, e.lng, (data) => {
                points.shift()
                collection.push(data)

                if (points.length == 0) {
                    callback(JSON.stringify({collection : methods.aggregateZoneStats(collection)}))
                }
            })
        })
    },

    aggregateZoneStats : (data) => {
        var result = {}
        var population = 0
        var median_ageTotal = 0
        var males = 0
        var females = 0
        var median_incomeTotal = 0

        data.forEach((e, i) => {
            console.log(i, e)
            population += e.population
            median_ageTotal += e.median_age
            males += e.males
            females += e.females
            median_incomeTotal += e.median_income
        })

        result.population = population
        result.males = males
        result.females = females
        result.median_age = median_ageTotal / data.length
        result.median_income = median_incomeTotal / data.length

        console.log(result)

        return result
    }
}

module.exports = methods