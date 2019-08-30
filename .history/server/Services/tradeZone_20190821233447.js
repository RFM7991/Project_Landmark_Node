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

    getTradeZoneStats : (center, isCity, type, callback) => {
        console.log('Firing')
        let radius =  (isCity ? 0.402 : 0.804);
        let points = getBoundaries(center, radius)
        points.push(center)
        filterTracts(points, 
            collection => 
                getZoneStats(collection, type, stats => callback(stats))
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

    const getZoneStats = async (points, type, callback) => {
        console.log('Balloon', points.length, points)
        let collection = []
        // for all points get stats then aggregate
        points.forEach(point => {
            getCitySDKStats(type, point.lat, point.lng, (stats) => {
                collection.push(stats)

                if (collection.length === points.length)
                    callback(aggregateZoneStats2(collection))
            })
        })
    }

    const aggregateZoneStats2 = (data) => {
      
       let aggregateSet = data[0]
        for (let i=1; i < data.length; i++) {
            let keyPairs = Object.entries(data[i]).map(([key, value]) => ({key,value}))
            console.log(keyPairs) 
            keyPairs.forEach(keyPair => {
                let key = keyPair.key
                aggregateSet[key] += keyPair.value
            })
        }

     //   let keyPairs = Object.entries(aggregateSet).map(([key, value]) => ({key,value}))

        console.log(aggregateSet)
        return aggregateSet
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

    const getCitySDKStats = (type, lat, lng, callback) => {

        switch (type) {
            case 'social': 
                return citySDK.getSocial('tract', lat, lng, (data) => callback(data))
            case 'income':
                citySDK.getIncome('tract', lat, lng, (data) => new Promise((res, rej) =>  callback(data)))
                break;
            case 'age':
                citySDK.getAge('tract', lat, lng, (data) => new Promise((res, rej) =>  callback(data)))
                break;
            default:
                citySDK.getBasic('tract', lat, lng, (data) => new Promise((res, rej) =>  callback(data)))
                break;
        }
    }

module.exports = methods