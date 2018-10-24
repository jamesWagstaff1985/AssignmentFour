/*
  functions for file manipulation
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for all of the data functions
let lib = {}

// Base director of data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// prepare the filename with the path and extension
lib.fileName = (dir, file) => {
  return lib.baseDir+'.'+dir+'/'+file.replace(' ', '_')+'.json'
}

// Create a file
lib.create = (dir, file, data, callback) => {
  // Open file for writing
  fs.open(lib.fileName(dir, file), 'wx', (err, fileDescriptor)=>{
    if(!err && fileDescriptor){
      // Convert data to string
      const stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, err=>{
        if(!err){
          fs.close(fileDescriptor, err=>{
            if(!err){
              callback(false);
            }else{
              callback('Error closing file');
            }
          })
        }else{
          callback('Error writing the file')
        }
      })
    }else{
      callback('Could not create new file, it may already exist');
    }
  })
}

// Read from a file
lib.read = (dir, file, callback) => {
  // Open the file for reading
  fs.readFile(lib.fileName(dir, file), 'utf8', (err, data)=> {
    if(!err && data){
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    }else{
      callback(err, data);
    }
  })
}

// Update a file
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(lib.fileName(dir, file), 'r+', (err, fileDescriptor)=>{
    if(!err && fileDescriptor){
      // Convert data to string
      const stringData = JSON.stringify(data);

      // Truncate the file
      fs.ftruncate(fileDescriptor, err=>{
        if(!err){
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData, err=>{
            if(!err){
              fs.close(fileDescriptor, err=>{
                if(!err){
                  callback(false)
                }else{
                  callback('Error closing file')
                }
              })
            }else{
              callback('Error closing file')
            }
          })
        }else{
          callback('Error truncating the file')
        }
      });
    }else{
      callback('Could not open file for truncating, it may not exist');
    }
  })
}

// Delete a file
lib.delete=(dir, file, callback)=>{
  // Unlink the file from the file system
  fs.unlink(lib.fileName(dir, file), err=>{
    callback(err)
  });
};

// List all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(lib.baseDir+dir+'/', (err, data)=> {
    if(!err && data && data.length > 0){
      let trimmedFileNames = [];
      data.forEach(filename=> {
        trimmedFileNames.push(filename.replace('.json', ''));
      })
      callback(false, trimmedFileNames);
    }else{
      callback(err, data);
    }
  })
}
// Export the module
module.exports = lib;
