const express = require('express');
const bodyParser = require('body-parser');
const pino = require('express-pino-logger')();
const google = require('./Services/google')
const city = require('./Services/citysdk')
const cartography = require('./Services/cartography')
var path = require('path');
var root = path.dirname(require.main.filename);
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const cors = require('cors')
const tradeZone = require('./Services/tradeZone')
// const ORIGIN = 'https://project-landmark-1558482476955.appspot.com'
const ORIGIN = "http://localhost:3000"

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    // init config
      const app = express();
      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(pino);
      app.disable('etag');
      app.use(cors())
      app.all('/api/test', function(req, res) {res.send('process ' + process.pid + ' says hello!').end();})
      var PORT = process.env.port || 8080;

      app.listen(PORT, () => {
        console.log('Express server is running on', PORT)
    }
  );

  // geocode
  app.get('/api/geocode/:location', (req, res) => {
    var f_address = req.params.address.toString().replace('+', / /g)
    google.geoCode(f_address, (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data);
    })
  })

  // nearby places endpoint
  app.get('/api/places/:lat/:lng/:search/:type/:distance', (req, res) => {
    google.getNearBy(req.params.lat, req.params.lng, req.params.search, req.params.type, Number(req.params.distance), (data) => {
          
        res.setHeader('Content-Type', 'application/json');
        res.header("Access-Control-Allow-Origin", ORIGIN)
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
        res.set('Pragma', data.next_page_token)
        res.send(data.results);
    })
  })

  // next page end point
  app.get('/api/places/:token', (req, res) => {
    google.getNearByNextPage(req.params.token, (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.set('Pragma', data.next_page_token)
      res.send(data.results);
    })
  })

  // get photo endpoint
  app.get('/api/photos/:ref/:width/:height', (req, res) => {
    google.getPhoto(req.params.ref, req.params.width, req.params.height, (data) => {
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data)
    })
  })

  ////////////////// Demographics ////////////////////

  // get population //40.8581292 //-74.2053012
  app.get('/api/demo/population/:lat/:lng', (req, res) => {
    city.getPopulation(req.params.lat, req.params.lng, (data) => {
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    })
  })

  // get age info
  app.get('/api/demo/age/:range/:lat/:lng', (req, res) => {
    city.getAge( req.params.range, req.params.lat, req.params.lng, (data) => {
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    })
  })

  // get income 
  app.get('/api/demo/income/:range/:lat/:lng', (req, res) => {
    city.getIncome(req.params.range, req.params.lat, req.params.lng,  (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data);
    })
  })

  // get social
  app.get('/api/demo/social/:range/:lat/:lng', (req, res) => {
    city.getSocial(req.params.range, req.params.lat, req.params.lng, (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data);
    })
  })

  // get tract
  app.get('/api/demo/tract/:lat/:lng', (req, res) => {
    city.getTract(req.params.lat, req.params.lng, (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data);
    })
  })

  app.get('/api/population', (req, res) => {
    let data;
      city.getCityPopulation(40.8581292, -74.2053012, (data) => {
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data)
    })
  })


  ////////////////// Cartography ////////////////////
  app.get('/api/cartography/zip/:state/:zip', (req, res) => {
    console.log(root)
    cartography.getZipCartograpahy(req.params.state, req.params.zip, (data) => {
      res.setHeader('Content-Type', 'application/json') 
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data)
    })
  })

  app.get('/api/cartography/tract/:state/:tract', (req, res) => {
    console.log(root)
    cartography.getTractCart(req.params.state, req.params.tract, (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data)
    })
  })

  app.get('/api/cartography/tradezone/:state/:lat/:lng', (req, res) => {
    console.log('hit endpoint')
      let center = {}
      center.lat = req.params.lat
      center.lng = req.params.lng
      let state = req.params.state
      let isCity = req.params.isCity

      city.getCityPopulation(center.lat , center.lng, (data) => { 
        let isCity = data.population > 1000000    

        cartography.getTradeZoneCartography(state, center, isCity, (data) => {
          res.setHeader('Content-Type', 'application/json')
          res.header("Access-Control-Allow-Origin", ORIGIN)
          res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
          res.send(data)
        })
      })
  })

  app.get('/api/citysdk/cartography/tract/:tract', (req, res) => {
    console.log(root)
    cartography.getCartographicGeoJSON(req.params.tract, (error, data) => {
      console.log(error)
      res.setHeader('Content-Type', 'application/json')
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data)
    })
  })

  ////////////////////////////// Trade Zone //////////////////////////////////////////

 //getTradeZoneStats
 app.get('/api/tradezone/stats/:type/:lat/:lng/', async (req, res) => {
  let center = {}
  center.lat = req.params.lat
  center.lng = req.params.lng
  let type = req.params.type

  city.getCityPopulation(center.lat , center.lng, (data) => { 
    let isCity = data.population > 1000000

    tradeZone.getTradeZoneStats(center, isCity, type, (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.header("Access-Control-Allow-Origin", ORIGIN)
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
      res.send(data)
    })
  })  
})
  
    // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.send('Invalid Endpoint')
  });
}