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
      
      var PORT = process.env.port || 8080;

      app.listen(PORT, () => {
        console.log('Express server is running on', PORT)
    }
  );


}