const tradeZonehelper = require('../helpers/tradeZoneHelper')
const citySDK = require('./citysdk')
const cartography = require('./cartography')

const methods = {

    getTradeZoneStats : (center, isCity, type, callback) => {
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

const getZoneStats = async (points, type, callback) => {
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
        let keyPairs = Object.entries(keyPair.value).map(([key, value]) => ({key,value}))
        keyPairs.forEach(nestedKeyPair => {
            if (aggregateSet[keyPair.key][nestedKeyPair.key] !== undefined && nestedKeyPair.value !== undefined)
                checkForNestedData(aggregateSet[keyPair.key], nestedKeyPair)
            })
    } else {
            aggregateSet[keyPair.key] += keyPair.value
    }
}

const aggregateZoneStats = (data) => {
    let aggregateSet = data[0]
/*
    if (aggregateSet.city !== null)
        delete(aggregateSet.city)
    else if (aggregateSet.tract !== null)
        delete(aggregateset.city)
*/
    for (let i=1; i < data.length; i++) {
        delete(data[i].city)
        let keyPairs = Object.entries(data[i]).map(([key, value]) => ({key,value}))
        keyPairs.forEach(keyPair => {
            if (aggregateSet[keyPair.key] !== undefined && keyPair.value !== undefined)
                checkForNestedData(aggregateSet, keyPair)
            })
    }

    let keyPairs = Object.entries(aggregateSet).map(([key, value]) => ({key,value}))
    keyPairs.forEach(keyPair => {
        if (keyPair.key.includes('median')) {
            aggregateSet[keyPair.key] = (aggregateSet[keyPair.key] / data.length).toFixed(2)
        }
    })
    console.log('results', aggregateSet)
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