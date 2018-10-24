/*
CLI related tasks
*/

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
var e = new _events();
const _data = require('./.data');
const helpers = require('./helpers');

// Instantiate the CLI module object
let cli = {};

// Input handlers
e.on('menu items', str => {
  cli.responders.menuItems();
});
e.on('recent orders', str => {
  cli.responders.recentOrders();
});
e.on('check a specific order', str => {
  cli.responders.checkSpecificOrder(str);
});
e.on('view new users', str => {
  cli.responders.viewNewUsers();
});
e.on('more details on user', str => {
  cli.responders.moreDetailsOnUser(str);
});
e.on('exit', str => {
  cli.responders.exit();
});
e.on('help', str => {
  cli.responders.help();
});


// Response object
cli.responders = {};

// Responders
cli.responders.help = _ => {
  const commands = {
  "menu items" : "Show all items available in the menu",
  "recent orders" : "Show all recent orders",
  "check a specific order --{orderId}" : "Check a specified order ",
  "view new users" : "Show all new users in that have signed up within the last 24 hrs",
  "more details on user --{userName}" : "Give more information on a specified user",
  "help" : "Display this help page",
  "exit" : "Exit the application"
  }

  // Show a header for the help page, as wide as the screen
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each comman, followed by its explanation in white and yellow respectively
  for(var key in commands){
    if(commands.hasOwnProperty(key)){
      let value = commands[key];
      let line = `\x1b[33m${key}\x1b[0m`;
        let padding = 60 - line.length;
        for(let i = 0; i<padding; i++){
          line += ' ';
        }
        line += value;
        console.log(line);
        cli.verticalSpace();
    }
  }
  cli.verticalSpace();
  cli.horizontalLine();
}
// Styling helpers
cli.verticalSpace = (lines) => {
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for(let i = 0; i<lines; i++){
    console.log('');
  }
}
cli.horizontalLine = _ => {
  // Get the available screen size
  const width = process.stdout.columns;

  let line = '';
  for(let i = 0; i<width; i++){
    line+='-';
  }
  console.log(line);
}
cli.centered = str => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';
  const width = process.stdout.columns;
  const leftPadding = Math.floor((width - str.length)/2);
  let line = '';
  for(let i = 0; i<leftPadding; i++){
    line+=' ';
  }
  line+=str;
  console.log(line);
}

cli.responders.menuItems = _ => {
  _data.read('inventory', 'menu', (err, menuData)=>{
    cli.verticalSpace();
    cli.horizontalLine();
    cli.centered('Menu items');
    cli.horizontalLine();
    if(!err && menuData){
        for(key in menuData){
          console.log(`\x1b[33m${key}\x1b[0m ${menuData[key]}`);
        }
    }else{
      console.log("error retrieving menu items")
    }
    cli.horizontalLine();
  })
}

cli.responders.recentOrders = _ => {
  cli.verticalSpace();
  _data.list('.orders', (err, orderData) => {
    if(!err && orderData){
      for(order of orderData){
        // Read each file and check order was placed within the last 24 hours
        _data.read('orders', order, (err, orderFile) => {
          if(!err && orderFile && Date.now() - new Date(orderFile.time).valueOf() < 1000*60*60*24){
            console.log(orderFile)
          }
        })
      }
    }
  })
}
cli.responders.checkSpecificOrder = str => {
  let orderToCheck = str.split('--')[1];
  _data.read('orders', orderToCheck, (err, orderDetails) => {
    cli.verticalSpace();
    cli.horizontalLine();
    cli.centered('Order: '+orderToCheck);
    cli.horizontalLine();
    if(!err && orderDetails){
      for(key in orderDetails){
        console.log(`\x1b[33m${key}\x1b[0m ${orderDetails[key]}`);
      }
    }
    cli.horizontalLine();
  })
}
cli.responders.viewNewUsers = _ => {
  _data.list('.users', (err, userIds) => {
    if(!err && userIds && userIds.length > 0){
      cli.verticalSpace();
      cli.horizontalLine();
      cli.centered('New users (last 24 hrs)');
      userIds.forEach(userId=>{
        _data.read('users', userId, (err, userData) => {
          if(!err && userData && userData.time - Date.now() < 1000 * 60 * 60 * 24){
            let line = 'Name: '+userData.name+'\nSignup date: '+new Date(userData.time);
            console.log(line)
            cli.horizontalLine();
          }
        })
      })
    }
  })
}
cli.responders.moreDetailsOnUser = str => {
  let string = str.split('--');

  _data.read('users', string[1], (err, userData) => {
    cli.verticalSpace()
    if(!err && userData){
      delete userData.password;
      let line = '';
      for(key in userData){
        if(typeof(userData[key]) !== 'object' && key !== 'time'){
        console.log(`\x1b[33m${key}\x1b[0m ${userData[key]}`)
      }else if(key == 'time'){
        console.log(`\x1b[33m${key}\x1b[0m ${new Date(userData[key])}`)
      }else{
        console.log(`\x1b[33m${key}\x1b[0m ${userData[key].street}`)
        console.log(`\x1b[33m${key}\x1b[0m # ${userData[key].number}`)
      }
      }
    }else{
      console.log("Could not find user");
    }
  })
}
cli.responders.exit = _ => {
  process.exit(0);
}


// Input processor
cli.processInput = str => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

  // Only process the input if the user actually wrote something, Otherwise ignore it.
  if(str){
      // Codify the unique strings that identify the unique questions allowed to be asked
      var uniqueInputs = [
        "menu items",
        "recent orders",
        "check a specific order",
        "view new users",
        "more details on user",
        "help",
        "exit"
      ];

      // Go through the possible inputs and emit an event when a match is found
      let matchFound = false;
      let counter = 0;
      uniqueInputs.some(input => {
        if(str.toLowerCase().indexOf(input) > -1){
          matchFound = true;
          // Emit an event matching the unique input and include the full string given by the user
          e.emit(input, str);
          return true;
        }
      });
      // If no match is found, tell the user to try again
      if(!matchFound){
        console.log("Sorry, try again");
      }
  }
};

// Init script
cli.init = () => {
  // Send the start message to console in dark blue
  console.log("\x1b[34m%s\x1b[0m", "The CLI is running");

  // Start the interface
  let _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>'
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', str => {
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });
  // If the users stops the CLI, kill the associated process
  _interface.on('close', _ => {
    process.exit(0);
  });

};

// Export the module
module.exports = cli;
