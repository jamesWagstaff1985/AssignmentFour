// Login/SignUp page form toggle
const login = document.querySelector('#login');
const signUp = document.querySelector('#signUp');
const loginForm = document.querySelector('#loginForm');
const signUpForm = document.querySelector('#signUpForm');

// Hide signUp form and login button
login.style.display = 'none';
signUpForm.style.display = 'none';

signUp.addEventListener('click', function(){
  loginForm.style.display = 'none';
  signUpForm.style.display = 'flex';
  login.style.display = 'block';
  signUp.style.display = 'none';
});

login.addEventListener('click', function(){
  loginForm.style.display = 'flex';
  signUpForm.style.display = 'none';
  login.style.display = 'none';
  signUp.style.display = 'block';
});
