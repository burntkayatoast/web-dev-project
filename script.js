require('dotenv').config();
console.log('TMDB key loaded:', process.env.TMDB_API_KEY ? 'yes' : 'no');

const express = require('express') // includes express library
const app = express() // creates an express app
app.set('view engine', 'ejs') // sets the view engine to ejs

app.use(express.static('views')) // Allow access to views folder
app.use(express.static('public')) // Allow access to public folder
app.use(express.static('app')) // Allow access to app folder

//allows the extraction of an incoming request object and makes it available using req.body
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

// at top (already have dotenv/express set up)
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// home page
app.get('/', (req, res) => {
  res.render("home")
  console.log('the home page is loaded')
})

// search page
app.get('/search', (req, res) => {
  res.render("search")
  console.log('the search page is loaded')
})

// requirements to start the server
app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
  console.log("Server is running... YAYYYY!");
})