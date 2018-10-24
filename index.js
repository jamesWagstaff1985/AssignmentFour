/*
  Primary file for API
*/

// Dependencies
const server = require('./.lib/server');
const workers = require('./.lib/workers');
const cli = require('./.lib/cli');
// Container for the app
let app = {};

// Init function
app.init = () => {
  // Start the server
  server.init();
  // Start the workers
  workers.init();
  // Start the cli
  setTimeout(()=>{
    cli.init();
  }, 50);
};

// Self executing
app.init();
