/*
  Helper functions for various tasks
*/
// Dependencies
const config = require('./config');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

// Object to keep all of the funcitons
let helpers = {};

// Parse a string to an object without throwing an error
helpers.parseJsonToObject = (str) => {
  try{
    const obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
};

// hash a password to sha256
helpers.hashPassword = (str) => {
  return typeof(str) == 'string' && str.length > 0 ? crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex') : false;
}

// Create a random string of requested size
helpers.createRandomString = (num) => {
  num = typeof(num) == 'number' && num > 0 ? num : false;
  if(num){
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let buffer = '';
    for(let i = 0; i<num; i++){
      buffer += chars[Math.floor(Math.random()*chars.length)];
    }
    return buffer;
  }else{
    return false;
  }
}

// Get the string content of a template, use provided data for string interpolation
helpers.getTemplate = (templateName, data, callback) => {
  templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
  data = typeof(data) === 'object' && data !== null ? data : {};
  if(templateName){
    const templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(templatesDir + templateName + '.html', 'utf8', (err, str) => {
      if(!err && str){
        // Do interpolation of the string
        const finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      }else{
        callback('No template could be found');
      }
    })
  }else{
    callback('A valid template was not specified');
  }
}

// Add the universal header and footer to the string, and pass provided data object to header and footer for interpolation
helpers.addUniversalTemplates = (str, data, callback) => {
  str = typeof(str) == 'string' && str.length > 0 ? str : false;
  data = typeof(data) == 'object' && data !== null ? data : {};
  // Get the header
  helpers.getTemplate('_header', data, (err, headerString) => {
    if(!err && headerString){
      // Get the footer
      helpers.getTemplate('_footer', data, (err, footerString) => {
        if(!err && footerString){
          // Add them together
          const fullString = headerString + str + footerString;
          callback(false, fullString);
        }else{
          callback('Could not find the footer string');
        }
      })
    }else{
      callback('Could not find the header template');
    }
  })
}

// Take a given string and data object, find/replace all the keys within it
helpers.interpolate = (str, data) => {
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};

  // Add the template globals to the data object, prepending their key name with 'global.'
  for(keyName in config.templateGlobals){
    if(config.templateGlobals.hasOwnProperty(keyName)){
      data['global'+keyName] = config.templateGlobals[keyName];
    }
  }
  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for(key in data){
    if(data.hasOwnProperty(key) && typeof(data[key]) == 'string'){
      let replace = data[key];
      let find = '{'+key+'}'
      str = str.replace(find, replace);
    }
  }
  return str;
}

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
  fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
  if(fileName){
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(publicDir+fileName, (err, data) => {
      if(!err && data){
        callback(false, data);
      }else{
        callback('No file could be found');
      }
    })
  }else{
    callback('A valid filename was not specified');
  }
}

// Charge to an account using Stripe
helpers.stripe = function(email, amount,currency,description,source,callback){
  // Configure the request payload
  var payload = {
    'amount' : amount,
    'currency' : currency,
    'description' : description,
    'source' : source,
  }

  // Stringify the payload
  var stringPayload = querystring.stringify(payload);

  // Configure the request details
  var requestDetails = {
    'protocol' : 'https:',
    'hostname' : 'api.stripe.com',
    'method' : 'POST',
    'auth' : config.stripe.secretKey,
    'path' : '/v1/charges',
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' : Buffer.byteLength(stringPayload)
    }
}
// Instantiate the request object
  var req = https.request(requestDetails,function(res){
    // Grab the status of the sent request
    var status = res.statusCode;
    // Callback successfully if the request went through
    if(status==200 || status==201){
      callback(false);
    } else {
      callback('Status code return was '+status);
    }
  });

  // Bind to the error event so it doesn't get the thrown
  req.on('error',function(e){
    callback(e);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
}

// Send confirmation email using MailGun
// Send the email by mailgun API
helpers.mailgun = function(to, text,callback){
  // Configure the request payload
  const payload = {
    'from' : config.mailgun.sender,
    'to' : to,
    'subject' : 'Order confirmation',
    'text' : text
  }

  // Stringify the payload
  const stringPayload = querystring.stringify(payload);

  // Configure the request details
  const requestDetails = {
    'protocol' : 'https:',
    'hostname' : 'api.mailgun.net',
    'method' : 'POST',
    'auth' : config.mailgun.apiKey,
    'path' : '/v3/'+config.mailgun.domainName,
    'headers' : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' : Buffer.byteLength(stringPayload)
    }
  }

  // Instantiate the request object
  const req = https.request(requestDetails,function(res){
    // Grab the status of the sent request
    const status = res.statusCode;
    // Callback successfully if the request went through
    if(status==200 || status==201){
      callback(false);
    } else {
      callback('Status code return was '+status);
    }
  });

  // Bind to the error event so it doesn't get the thrown
  req.on('error',function(e){
    callback(e);
  });

  // Add the payload
  req.write(stringPayload);

  // End the request
  req.end();
}


// Export the module
module.exports = helpers;
