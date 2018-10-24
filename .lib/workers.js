/*
  Worker functions
*/

// Dependencies
const fs = require('fs');
const _data = require('./.data');
const path = require('path');

// Container for workers
let workers = {}

// Delete expired tokens
workers.deleteExpiredTokens = () => {
  fs.readdir(path.join(__dirname, '../.data/.tokens'), (err, filenames)=>{
    if(!err && filenames){
      // Read files and check expire time
      filenames.forEach(file=>{
        _data.read('tokens', file.replace('.json', ''), (err, tokenData)=> {
          if(!err && tokenData && tokenData.expires < Date.now()){
            // Unlink the file from the system
            fs.unlink(path.join(__dirname, '/../.data/.tokens/')+file, err=>{
              if(!err){
                console.log("Tokens cleaned");
              }else{
                console.log(err)
              }
            })
          }
        })
      })
    }else{
      console.log(err)
    }
  })
}

workers.loop = () => {
  setInterval(()=>{
    workers.deleteExpiredTokens();
  }, 1000 * 60 * 60);
};

workers.init = () => {
  // Start the loop
  workers.loop();

  console.log("Background workers are running");
}
// Export module
module.exports = workers;
