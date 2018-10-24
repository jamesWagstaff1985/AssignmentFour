/*
  All of the handlers for the pizza api
*/

// Dependencies
const _data = require('./.data');
const helpers = require('./helpers');
// Container for all of the handlers
let handlers = {};

// Index
handlers.index = (data, callback) => {
  const templateData = {};
  // Reject any request that isn't a GET
  if(data.method === 'get'){
    // Read in a template as a string
    helpers.getTemplate('index', templateData, (err, str) => {
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str){
            // Return that page as HTML
            callback(200, str, 'html');
          }else{
            callback(500, undefined, 'html');
          }
        })
      }else{
        callback(405, undefined, 'html');
      }
    })
  }else{
    callback(405, undefined, 'html');
  }
}

// Menu
handlers.menuItems = (data, callback) => {
  const templateData = {};
  // Reject any request that isn't a GET
  if(data.method === 'get'){
    // Read in a template as a string
    helpers.getTemplate('menu', templateData, (err, str) => {
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str){
            // Return that page as HTML
            callback(200, str, 'html');
          }else{
            callback(500, undefined, 'html');
          }
        })
      }else{
        callback(405, undefined, 'html');
      }
    })
  }else{
    callback(405, undefined, 'html');
  }
}

// Login/sign up page
handlers.login_signup = (data, callback) => {
  const templateData = {};
  // Reject any request that isn't a GET
  if(data.method === 'get'){
    // Read in a template as a string
    helpers.getTemplate('login_signup', templateData, (err, str) => {
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str){
            // Return that page as HTML
            callback(200, str, 'html');
          }else{
            callback(500, undefined, 'html');
          }
        })
      }else{
        callback(405, undefined, 'html');
      }
    })
  }else{
    callback(405, undefined, 'html');
  }
}

// Basket
handlers.basket = (data, callback) => {
  const templateData = {};
  // Reject any request that isn't a GET
  if(data.method === 'get'){
    // Read in a template as a string
    helpers.getTemplate('basket', templateData, (err, str) => {
      if(!err && str){
        // Add the universal header and footer
        helpers.addUniversalTemplates(str, templateData, (err, str) => {
          if(!err && str){
            // Return that page as HTML
            callback(200, str, 'html');
          }else{
            callback(500, undefined, 'html');
          }
        })
      }else{
        callback(405, undefined, 'html');
      }
    })
  }else{
    callback(405, undefined, 'html');
  }
}

// Public assets
handlers.public = (data, callback) => {
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Get the filename being requested
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if(trimmedAssetName.length > 0){
      // Read in the assets data
      helpers.getStaticAsset(trimmedAssetName, (err, data) => {
        if(!err && data){
          // Determine the content type, default to plain text
          let contentType = 'plain'

          if(trimmedAssetName.indexOf('.css') > -1){
            contentType = 'css';
          }
          if(trimmedAssetName.indexOf('.png') > -1){
            contentType = 'png';
          }
          if(trimmedAssetName.indexOf('.jpg') > -1){
            contentType = 'jpg';
          }
          if(trimmedAssetName.indexOf('.ico') > -1){
            contentType = 'favicon';
          }
          // Callback the data
          callback(200, data, contentType);
        }else{
          callback(404);
        }
      })
    }else{
      callback(405);
    }
  }else{
    callback(405);
  }
}

// Determine which handler to direct the router to
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  const handler = typeof(data.method) == 'string' && acceptableMethods.indexOf(data.method) > -1 ? data.method : false;

  if(handler){
    handlers._users[handler](data, callback);
  }else{
    handlers.notFound(undefined, callback);
  }
}

// Container for the users functions CRUD
handlers._users = {}

// Create user handler
// Required data: name, email address street address, password
// Optional data: none
handlers._users.post = (data, callback) => {
  // Check required information is there
  const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
  const emailAddress = typeof(data.payload.emailAddress) == 'string' && data.payload.emailAddress.trim().length > 0 ? data.payload.emailAddress : false;
  const streetAddress = typeof(data.payload.streetAddress) == 'object' && data.payload.streetAddress !== null ? data.payload.streetAddress : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
  if(name && emailAddress && streetAddress && password){
    let dataToSave = {
      'name' : name,
      'emailAddress' : emailAddress,
      'streetAddress': streetAddress,
      'password': helpers.hashPassword(password),
      'time' : Date.now()
    }
    // Create new user
    _data.create('users', name, dataToSave, err=>{
      if(!err){
        callback(200, {'Success':'New user created'})
      }else{
        callback(500, {'Error':err})
      }
    })
  }else{
    callback(400, {'Error':'Missing required fields'})
  }
}

// Read user handler
// Required data: name, password
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check necessary data is there
  const name = typeof(data.queryStringObject.name) == 'string' && data.queryStringObject.name.trim().length > 0 ? data.queryStringObject.name : false;
  const password = typeof(data.queryStringObject.password) == 'string' && data.queryStringObject.password.trim().length > 0 ? data.queryStringObject.password : false;

  if(name && password){
    // construct data object
    const dataCheck = {
      'name':name,
      'password':password
    }
    _data.read('users', name, (err, data)=> {
      if(!err&&data){
        callback(200, data)
      }else{
        callback(404)
      }
    })
  }else{
    callback(400, {'error':'Missing required fields'});
  }
}

// Update user handler
// Required data: name, password
// Optional data: email address, street address, password
handlers._users.put = (data, callback) => {
  callback(200, {'success':'we are good on put'})
}

// Delete user handler
// Required data: name, password
// Optional data: none
handlers._users.delete = (data, callback) => {
  callback(200, {'success':'we are good on delete'})
}


// Direct the router to the correct function
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  // Check the method is valid
  const handler = typeof(data.method) == 'string' && acceptableMethods.indexOf(data.method) > -1 ? data.method : false;
  // Route to the specified handler
  handler ? handlers._tokens[handler](data, callback) : handlers.notFound(undefined, callback);
}

// Container for all of the token methods
handlers._tokens = {}

// Create a token
// Required data: name, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

  if(name && password){
    // Read users file and check passwords match
    _data.read('users', name, (err, userData) => {
      if(!err && userData){
        if(helpers.hashPassword(password) === userData.password){
          // Create a token
          const token   = helpers.createRandomString(20);
          // Set to expire in 1 hour from now
          const expires = Date.now() + 1000 * 60 * 60;
          // Create object to store in file
          const userTokenObject = {
            'name':name,
            'token':token,
            'expires':expires
          }
          // Create token file for user
          _data.create('tokens', token, userTokenObject, err=>{
            if(!err){
              callback(200, {'Success':userTokenObject});
            }else{
              callback(500, {'Error':'Token could not be created'});
            }
          })
        }else{
          callback(400, {'Error':'Password is incorrect'});
        }
      }else{
        callback(400, {'Error':'Could not find user'});
      }
    })
  }else{
    callback(400, {'Error':'Missing required fields'})
  }
}

// Read a token
// Required data: name, tokenId
// Optional data: none
handlers._tokens.get = (data, callback) => {
  const name = typeof(data.queryStringObject.name) == 'string' && data.queryStringObject.name.trim().length > 0 ? data.queryStringObject.name : false;
  const tokenId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id : false;

  if(name && tokenId){
    // Read token file
    _data.read('tokens', tokenId, (err, tokenData)=> {
      if(!err && tokenData){
        callback(200, tokenData)
      }else{
        callback(500, {'Error':'Could not read token data'});
      }
    })
  }else{
    callback(400, {'Error':'Missing required fields'});
  }
}

// Update a token
// Required data: tokenId, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.length === 20 ? data.payload.tokenId : false;
  const extend = typeof(data.payload.extend) == 'boolean' ? data.payload.extend : false;
  if(tokenId && extend){
    // Read file and update the expires field
    _data.read('tokens', tokenId, (err, tokenData) => {
      if(!err && tokenData){
        tokenData.expires = Date.now() + 1000 * 60 * 60;
        _data.update('tokens', tokenId, tokenData, err=>{
          if(!err){
            callback(200, {'Success':'Your token has been extended'});
          }else{
            callback(500, {'Error':'Could not update the token'});
          }
        })
      }else{
        callback(400, {'Error':'Token could not be found'});
      }
    })
  }else{
    callback(400, {'Error':'Missing required fields'});
  }
}

// Delete a token
// Required data: tokenId
// Optional data: none
handlers._tokens.delete = (data, callback) => {

  const tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.length === 20 ? data.payload.tokenId : false;

  if(tokenId){
    // Lookup the token
    _data.read('tokens', tokenId, (err, tokenData)=> {
      if(!err && tokenData){
        _data.delete('tokens', tokenId, err=> {
          if(!err){
            callback(200, {'Success': 'Token deleted'});
          }else{
            callback(500, {'Error':'Could not delete token'});
          }
        })
      }else{
        callback(400, {'Error':'Could not find the specified token'});
      }
    })
  }else{
    callback(400, {'Error':'Missing required fields'});
  }
}

// Verify that a token is valid for a given user
handlers._tokens.verifyToken = (id, name, callback) => {
  // Lookup the token
  _data.read('tokens', id, (err, tokenData)=> {
    if(!err && tokenData){
      // Check the name corresponds with the token
      if(name === tokenData.name && tokenData.expires > Date.now()){
        // Add email to data object
        _data.read('users', name, (err, userData)=>{
          if(!err&&userData){
            callback(true, userData.emailAddress)
          }else{
            callback(false, 'Could not get email from user profile');
          }
        })
      }else{
        callback(false);
      }
    }else{
      callback(false)
    }
  })
}
// Direct the router to the correct _menu handler
handlers.menu = (data, callback) => {
  const acceptableMethods = ['post', 'get'];
  typeof(data.method) == 'string' && acceptableMethods.indexOf(data.method) > -1 ? handlers._menu[data.method](data, callback) : handlers.notFound(undefined, callback);
}
// Container for menu handlers
handlers._menu = {};

// Menu handler, post orders
// Required data: name, tokenId, order
// Optional data: none
handlers._menu.post = (data, callback) => {
  const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
  const tokenId = typeof(data.headers.id) == 'string' && data.headers.id.length == 20 ? data.headers.id : false;
  let order = typeof(data.payload.order) == 'object' && data.payload.order != null ? data.payload.order : false;
  order.orderNumber = helpers.createRandomString(8);

  if(name && tokenId && order){
    // Check the token is valid
    handlers._tokens.verifyToken(tokenId, name, (loggedIn, email)=>{
      if(loggedIn){
        // Calculate the total amount
        _data.read('inventory', 'menu', (err, prices) => {
          if(!err && prices){
            let total = 0;
            for(x in order){
              if(prices.hasOwnProperty(x)){
                total += parseFloat(prices[x].replace('$','')) * order[x];
              }
            }

              order.email = email;
              order.total = Math.round((total*100))/100;
              order.time = Date(Date.now());
              // Save order
              _data.create('orders', order.orderNumber, order, err => {});
              // Send order to orderProcessing handler
              handlers._menu.orderProcessing(data, (err, orderDetails)=>{
              if(!err && orderDetails){
                callback(200, orderDetails)
              }else{
                callback(500, err);
              }
              })
          }else{
            callback(500, {'Error':'Error retreiving menu'});
          }
        })
      }else{
        callback(400, {'Error':'Please log in before sending your order'});
      }
    })
  }else{
    callback(400, {'Error':'Missing required fields'});
  }
}

// Menu handler, Return menu items and prices
// Required data: none
// Optional data: none
handlers._menu.get = (data, callback) => {
  _data.read('inventory', 'menu', (err, menuData) => {
    if(!err && menuData){
      callback(200, menuData);
    }else{
      callback(500, {'Error':'Could not retreive menu'});
    }
  })
}

// Handler for processing the order, divert to payment and order confirmation
handlers._menu.orderProcessing = (data, callback) => {
  // Process the payment with stripe
  const name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
  const amount = typeof(data.payload.order.total) == 'number' && data.payload.order.total > 0 ? data.payload.order.total * 100 : false;
  let description = typeof(data.payload.order) == 'object' && data.payload.order !== null ? data.payload.order : false;
  if(name && amount && description){
    const paymentToken = 'tok_visa';
    const dateTime = Date(Date.now());
    // Create the data of payment
    const currency = 'usd';
    description = { 'Message':'Thank you for your order',
                    'Message':'Charge for '+name,
                    'Time':' - '+dateTime,
                    'Order':description}
    const email = data.email;
    helpers.stripe(email, amount, currency, description, paymentToken, err=>{
      if(!err){
        // Send confirmation email
        helpers.mailgun(email, description, err=>{
          if(!err){
            callback(false, description)
          }else{
            callback(true, 'Could not send confirmation e-mail');
          }
        })
      }else{
        callback(true, 'Error could not process the payment')
      }
    })
  }else{
    callback(true, 'Missing required data for payment');
  }
}



// Ping handler
// Function: sends a 200 callback so that the owner knows the site is up and running
handlers.ping = (undefined, callback) => {
  callback(200);
}


// notFound Handler
// Function: stop the api from crashing and alert the user that a wrong address has been entered
handlers.notFound = (_, callback) => {
  callback(404, {'Error' : 'Page not found'});
}




// Export the module
module.exports = handlers;
