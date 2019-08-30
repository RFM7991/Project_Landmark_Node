const tradeZonehelper = require('../helpers/tradeZoneHelper')
const citySDK = require('./citysdk')
const cartography = require('./cartography')

const methods = {

    getTradeZoneCartography : (state, center, isCity, callback) => {
        console.log('Firing')
        let d =  (isCity ? 0.402 : 0.804);
        let points = getBoundaries(center, d)
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

    getTradeZoneStats : (center, isCity, callback) => {
        console.log('Firing')
        let radius = (isCity ? 0.402 : 0.804);
        let points = getBoundaries(center, radius)
        points.push(center)
        filterTracts(points, 
            collection => 
                getZoneStats(collection, 
                    stats => 
                        callback(stats)
                )
        )  
    }


    }
    const getBoundaries = (center, distance) => {
        return tradeZonehelper.getPoints(center, distance)
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
                    callback(collection)
                }
                
            })
        });
    }

    const filterTracts = (points, callback) => {
        let collection = []
        let tracts = []
        points.forEach((e, i)=> {
            citySDK.getTract(e.lat, e.lng, (data) => {
                let tract = data[0].tract
                points.shift()
                if (!tracts.includes(tract)) {
                    ('TEST', i, tract, points.length)
                    tracts.push(tract)
                    collection.push(e)
                }
                if (points.length == 0) {
                    callback(collection)
                }
            })
        });
    }

    const getZoneCart = (state, tracts, callback) => {
        console.log('Balloon', tracts.length, tracts)
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

    const getZoneStats = (points, callback) => {
        console.log('Balloon', points.length, points)
        let collection = []
        points.forEach(e => {
        /*
            citySDK.getBasic('tract', e.lat, e.lng, (data) => {
                points.shift()
                collection.push(data)

                if (points.length == 0) {
                    callback(aggregateZoneStats(collection))
                }
            })
        */
       citySDK.get
        })
    }

    const aggregateZoneStats = (data) => {
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
        result.median_age = result.median_age.toFixed(2)
        result.median_income = median_incomeTotal / data.length
        result.median_income = result.median_income.toFixed(2)

        console.log(result)

        return result
    }

module.exports = methods