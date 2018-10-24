/*
  Config file for various variables used
*/

// Container for the environments
const environments = {}

// Staging environment
environments.staging = {
  'httpPort' : 5000,
  'httpsPort' : 5001,
  'hashingSecret' : 'sheSellsSeaShells',
  'stripe' : {
    'secretKey' : "*********"
  },
  'mailgun' : {
    'domainName' : '*********',
    'apiKey' : '*********',
    'sender' : '*********'
}
}

const environmentToExport = environments.staging;

// Export the module
module.exports = environmentToExport;
