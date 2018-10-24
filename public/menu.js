const card = document.getElementsByClassName('card');
const mask = document.getElementsByClassName('mask');

let basket = {};
let items = 0;
let addToBasket = function(){
  let attribute = this.getAttribute("class");
  let item = this.parentNode.innerHTML.match(/menuItems\/[a-z_]*\.png/)[0].replace(/menuItems\//, '').replace('.png', '')
  basket.hasOwnProperty(item) ? basket[item]++ : basket[item] = 1;
  items++
  alert(`${item} Added to basket \n You're basket now contains\n` + JSON.stringify(basket))
  let itemsInBasket = document.querySelector('#itemsInBasket')
  if(items > 0){
    itemsInBasket.innerHTML = items
  }
  localStorage.setItem('order', JSON.stringify(basket))
}

let showMask = function(){
  let attribute = this.getAttribute("class");
  this.querySelector('.mask').style.display = 'inline-block'
}

let hideMask = function(){
  let attribute = this.getAttribute("class");
  this.querySelector('.mask').style.display = 'none'
}

// Add event listeners to all of the cards to show the mask on hover
for(let i = 0; i<card.length; i++){
  card[i].addEventListener('mouseenter', showMask, false);
  card[i].addEventListener('mouseleave', hideMask, false);
}

// Add event listened to all of the masks to add to basket
for(let i = 0; i<mask.length; i++){
  mask[i].addEventListener('click', addToBasket, false);
}
