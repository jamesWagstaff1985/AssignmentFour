// container for app functions
let app = {};

// Config
app.config = {
  'sessionToken' : false
}

// AJAX client
app.client = {};

// Interface for making API calls

app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
  // Set the defaults
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/';
  method = typeof(method) == 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  // For each querry string parameter sent, add it to the path
  let requestUrl = path + '?';
  let counter = 0;
  for(queryKey in queryStringObject){
    if(queryStringObject.hasOwnProperty(queryKey)){
      counter++
      // If at least one query string parameter has already been added, prepend new ones with ampersand
      if(counter > 1){
        requestUrl+='&';
      }
      // Add the key and value
      requestUrl+=queryKey+'='+queryStringObject[queryKey];
    }
  }
  // Form the http request as a JSON type
  let xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader('Content-type', 'application/json');

  // For each header sent, add it to the request
  for(headerKey in headers){
    if(headers.hasOwnProperty(headerKey)){
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // If there is a current session token set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader('id', app.config.sessionToken);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = () => {
    if(xhr.readyState == XMLHttpRequest.DONE){
      const statusCode = xhr.status;
      const responseReturned = xhr.responseText;

      // Callback if requested
      if(callback){
        try{
          const parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        }catch(e){
          callback(statusCode, false)
        }
      }
    }
  }

  // Send the paylaod as JSON
  const payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
}

app.bindForms = () => {
  if(document.querySelector('form')){
    let allForms = document.querySelectorAll('form');
    for(form of allForms){
      form.addEventListener("submit", function(e){
        e.preventDefault();
        const formId = this.id;
        const path = this.action;
        const method = this.method.toUpperCase();

        // Store inputs in a payload object
        let payload = {};

        let elements = this.elements
        if(formId == 'signUpForm'){
          payload.streetAddress = {}
        }
        for(element of elements){
          if(element.name == 'streetAddress'){
            payload.streetAddress.street = element.value;
          }
          else if(element.name == 'streetAddress2'){
            payload.streetAddress.number = element.value;
          }
          else if(element.type !== 'submit'){
            payload[element.name] = element.value
          }
        }
        // Check passowrds are sufficient and that they match
        if(formId === 'signUpForm' && payload.password === payload.repeatPassword){
          delete payload.repeatPassword
        }
        // If send order, format payload differently
        // required data: name, tokenId (as header), order(as object)
        const name = typeof(localStorage.getItem('name')) == 'string' ? localStorage.getItem('name') : false;
        const order = typeof(localStorage.getItem('order')) == 'string' ? JSON.parse(localStorage.getItem('order').replace(/pizza_|drinks_/g, '')) : false;
        if(name && app.config.sessionToken && order){
          payload.name = name;
          payload.order = order
        }
        // If the method is delete, the payload should be a queryStringObject instead
        const queryStringObject = method == 'DELETE' ? payload : {};
        // Call the API
        console.log(payload)
        app.client.request(undefined, path, method, queryStringObject, payload, (statusCode, responsePayload) => {
          if(statusCode !== 200){
            console.log("something went wrong")
          }else{
            // If successful, send to form response processor
            if(typeof(responsePayload.Success) !== 'undefined'){
            app.config.sessionToken = responsePayload.Success.token
            localStorage.setItem('tokenId', responsePayload.Success.token)
            localStorage.setItem('name', responsePayload.Success.name)
            window.location = 'menuItems';
            }
            if(typeof(responsePayload.Message) == 'string'){
              confirmOrder(responsePayload);
            }
          }
        });
      });
    }
  }
};

// Update logged in state in menu
app.loggedInState = () => {
  if(localStorage.getItem('tokenId')){
  app.config.sessionToken = localStorage.getItem('tokenId')
    document.querySelector('#loggedInState').innerHTML = 'Hello ' + localStorage.getItem('name');
  }
}

// Iniciate the app
window.onload = () => {
app.loggedInState()
if(typeof(localStorage.getItem('tokenId')) == 'string'){
  app.config.sessionToken = localStorage.getItem('tokenId')
}
app.bindForms()
}
