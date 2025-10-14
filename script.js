require('dotenv').config();
console.log('TMDB key loaded:', process.env.TMDB_API_KEY ? 'yes' : 'no');

const express = require('express') // includes express library
const app = express() // creates an express app
const axios = require('axios')
app.set('view engine', 'ejs') // sets the view engine to ejs

app.use(express.static('views')) // Allow access to views folder
app.use(express.static('public')) // Allow access to public folder
app.use(express.static('app')) // Allow access to app folder

//allows the extraction of an incoming request object and makes it available using req.body
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

// at top (already have dotenv/express set up)
const API_KEY = process.env.TMDB_API_KEY;

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

// popular movies
app.get('/popular_movies', (req, res) => {
  res.render("popular_movies") 
  console.log('the popular movie page is loaded')
})

// profile
app.get('/profile', (req, res) => {
  res.render("profile")
  console.log('the profile page is loaded')
})

// fetching movies from api
app.get('/api/movies', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-Uk&page=1`
    )
    res.json(response.data.results)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading movies'})
  }
})


// requirements to start the server
app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
  console.log("Server is running... YAYYYY!");
})