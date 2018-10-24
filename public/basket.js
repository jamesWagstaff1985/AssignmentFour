// Display ordered items fetched from localStorage
let order = JSON.parse(localStorage.getItem('order'))
let displayBasket = document.querySelector('#basket');
let currentItemsInBasket = document.getElementsByClassName('card');

displayOrder = (order) => {
  app.client.request(undefined, '/menu', 'get', undefined, undefined, (statusCode, menuData) => {
    if(statusCode === 200 && menuData){
      let orderedItemsHTML = ''
      let total = 0
      for(key in order){

        if(order[key] > 1){
          const itemToInsert = '<div class="card itemInBasket"><img src="public/menuItems/'+key+'.png" alt="'+key+'"><p>'+menuData[key.match(/_\w*$/).toString().replace('_', '')]+'</p></div>'
          orderedItemsHTML += itemToInsert.repeat(order[key])
        }else{
          orderedItemsHTML+='<div class="card itemInBasket"><img src="public/menuItems/'+key+'.png" alt="'+key+'"><p>'+menuData[key.match(/_\w*$/).toString().replace('_', '')]+'</p></div>'
        }
        total += Number(menuData[key.match(/_\w*$/).toString().replace('_', '')].replace('$', ''))
      }
      total = Math.round(total * 100) / 100
      displayBasket.innerHTML = orderedItemsHTML + '<h3 class="card">Total: $<span id="total">'+total+'</span></h3>'
    }else{
      console.log('Could not fetch menu data')
    }
  })
}


let removeFromBasket = function(){
  // Remove the item from basket and update local storage
  let itemToRemove = this.innerHTML.match(/menuItems\/[a-z_]*\.png/)[0].replace(/menuItems\//, '').replace('.png', '')
  let toDiscount = Number(this.innerHTML.slice(this.innerHTML.indexOf('<p>')+4, this.innerHTML.indexOf('</p>')))

  let total = document.querySelector('#total');
  // discount total
  total.innerHTML = Number(total.innerHTML) - toDiscount
  // Remove item from basket
  order[itemToRemove] --
  if(order[itemToRemove] < 1){
    delete order[itemToRemove]
  }
  localStorage.setItem('order', JSON.stringify(order))
  // Delete the card if amount is 0
  this.parentNode.removeChild(this);
}

// Show message after order has been sent
confirmOrder = (message) => {
  messageString = JSON.stringify(message).replace(/[{}"]/g, '')
  // message = message.replace(/[{}"]/g, '')
  let Message = messageString.slice(messageString.indexOf('Message') + 8, messageString.indexOf('Time')-1)
  let Time = messageString.slice(messageString.indexOf('Time') + 8, messageString.indexOf('Order') - 1)
  let Email = messageString.slice(messageString.indexOf('email'), messageString.indexOf('total') - 1)
  let Order = messageString.slice(messageString.indexOf('Order'), messageString.indexOf('orderNumber')-1)
  let OrderNumber = messageString.slice(messageString.indexOf('orderNumber'), messageString.indexOf('email')-1)
  let Total = messageString.slice(messageString.indexOf('total'), messageString.length)
  Total = Total.replace(/[:]/, ':$')

  let orderConfirmationMessage = '<p id="orderConfirmation" class="card">' + Message + '<br>' + Time + '<br>' + Email + '<br>' + Order + '<br>' + OrderNumber + '<br>' + Total + '</p>';
  document.querySelector('#basket').innerHTML = orderConfirmationMessage
  // Clear the order from storage
  localStorage.removeItem('order')
  // Hide the send order button
  document.getElementById('sendOrder').style.display = 'none';
}

displayOrder(order)
window.onload = () => {
// Add event listeners to all of the cards to remove from basket on click
for(let i = 0; i<currentItemsInBasket.length; i++){
  currentItemsInBasket[i].addEventListener('click', removeFromBasket, false);
}
if(typeof(localStorage.getItem('name')) == 'string'){
  document.getElementById('loggedInState').innerHTML = 'Hello ' + localStorage.getItem('name');
}
if(typeof(localStorage.getItem('tokenId')) == 'string'){
  app.config.sessionToken = localStorage.getItem('tokenId')
}
app.bindForms()
}
