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
                console.log(collection.length, stats)
                if (collection.length === points.length)
                    callback(aggregateZoneStats(collection))
            })
        })
    }

    const checkForNestedData = (aggregateSet, keyPair) => {
        if (Object.entries(aggregateSet[keyPair.key]).length > 1) {
          //  console.log('nested set', aggregateSet[keyPair.key])
            let keyPairs = Object.entries(keyPair.value).map(([key, value]) => ({key,value}))
            keyPairs.forEach(nestedKeyPair => {
                console.log('Keypair check', v)
                if (aggregateSet[keyPair.key] !== undefined && nestedKeyPair.value !== undefined)
                    checkForNestedData(aggregateSet[keyPair.key], nestedKeyPair)
              })
        } else {
                aggregateSet[keyPair.key] += keyPair.value
            console.log('FLAG', keyPair.key, aggregateSet[keyPair.key])

        }
    }

    const aggregateZoneStats = (data) => {
      
       let aggregateSet = data[0]
      // delete(aggregateSet.city) - 
        for (let i=1; i < data.length; i++) {
            delete(data[i].city)
            let keyPairs = Object.entries(data[i]).map(([key, value]) => ({key,value}))
            keyPairs.forEach(keyPair => {
                
            if (aggregateSet[keyPair.key] !== undefined && keyPair.value !== undefined)
                checkForNestedData(aggregateSet, keyPair)
           //   aggregateSet[keyPair.key] += keyPair.value
                
                
            })
        }

        let keyPairs = Object.entries(aggregateSet).map(([key, value]) => ({key,value}))
        keyPairs.forEach(keyPair => {
            if (keyPair.key.includes('median')) {
                console.log('contains median', keyPair)
                aggregateSet[keyPair.key] = (aggregateSet[keyPair.key] / data.length).toFixed(2)
            }
        })

        console.log(aggregateSet)
        return aggregateSet
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