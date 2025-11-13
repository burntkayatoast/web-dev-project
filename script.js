require('dotenv').config();
console.log('TMDB key loaded:', process.env.TMDB_API_KEY ? 'yes' : 'no');

const express = require('express') // includes express library
const app = express() // creates an express app
const axios = require('axios')
app.set('view engine', 'ejs') // sets the view engine to ejs

app.use(express.static('views')) // Allow access to views folder
app.use(express.static('public')) // Allow access to public folder
app.use(express.static('app')) // Allow access to app folder
app.use(express.static('models')) // Allow access to models folder

// so default image is there
app.use('/images', express.static('images'))

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
  const isMovie = Math.floor(Math.random() * (2))
  res.render("search", {isMovie})
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

// free movies
app.get('/popular_tv_shows', (req, res) => {
  res.render("p_tv_shows") 
  console.log('the trending tv shows page is loaded')
})

// movies page
app.get('/movies', (req, res) => {
  res.render("movies")
  console.log('the movies page is loaded')
})

// tv shows page
app.get('/tv_shows', (req, res) => {
  res.render("tv_shows")
  console.log('the tv shows page is loaded')
})

// about section
app.get('/about', (req, res) => {
  res.render("about")
  console.log('the about page is loaded')
})

// section to see the details of movie/tvshow
app.get('/movies/:id', async (req, res) => {
  const movieID = req.params.id

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieID}?api_key=${API_KEY}&language=en-US`
    )

    const movie = response.data
    const creditsResponse = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieID}/credits?api_key=${API_KEY}&language=en-US`
    )
    const credits = creditsResponse.data

    const director = credits.crew.find(person => person.job === 'Director')

    res.render("showPgDetails", { 
      movie: movie,
      director: director,
      creator: null
      })

  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading movie details'})
  }
})

// section to see the details of movie/tvshow
app.get('/tv_shows/:id', async (req, res) => {
  const tvID = req.params.id

  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/tv/${tvID}?api_key=${API_KEY}&language=en-US`
    )

    const tvShow = response.data
    const creators = tvShow.created_by || []


    res.render("showPgDetails", {
      movie: tvShow,
      director: null,
      creators: creators
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading tv show details'})
  }
})

// search results
app.get('/search/results', (req, res) => {
  res.render("searchResults")
  console.log('the search results page is loaded')
})

// fetching movies from api
app.get('/api/search/tv', async (req, res) => {
  const query = req.query.q

  if(!query) {
    return res.status(400).json({message: 'Please enter a search'})
  }
  
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
    )
    res.json(response.data.results)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error searching movies'})
  }
})

// fetching movies from api
app.get('/api/search/movies', async (req, res) => {
  const query = req.query.q

  if(!query) {
    return res.status(400).json({message: 'Please enter a search'})
  }
  
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
    )
    res.json(response.data.results)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error searching movies'})
  }
})

// fetching movies from api
app.get('/api/popular', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=en-US&page=1`
    )
    res.json(response.data.results)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading movies'})
  }
})

// fetching movies from api
app.get('/api/p_tv_show', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=en-US&page=1`
    )
    res.json(response.data.results)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading tv shows'})
  }
})

// fetching movies from api
app.get('/api/popular/all', async (req, res) => {
  try {
    const allMovies = []

    for (let page = 1; page <= 5; page++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=en-US&page=${page}`
      )
    
      allMovies.push(...response.data.results)
    }

    res.json(allMovies)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading movies'})
  }
})

// fetching movies from api
app.get('/api/p_tv_show/all', async (req, res) => {
  try {
    const allMovies = []

    for (let page = 1; page <= 5; page++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=en-US&page=${page}`
      )
    
      allMovies.push(...response.data.results)
    }

    res.json(allMovies)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading tv shows'})
  }
})

// fetching movies from api
app.get('/api/movies', async (req, res) => {
  try {
    const allMovies = []

    for (let page = 1; page <= 50; page++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=en-US&page=${page}`
      )
    
      allMovies.push(...response.data.results)
    }

    res.json(allMovies)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading movies'})
  }
})

// fetching movies from api
app.get('/api/tv_shows', async (req, res) => {
  try {
    const allTvShows = []

    for (let page = 1; page <= 50; page++) {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&page=${page}`
      )
    
      allTvShows.push(...response.data.results)
    }

    res.json(allTvShows)
  } catch (err) {
    console.error(err)
    res.status(500).json({message: 'Error loading tv shows'})
  }
})

// requirements to start the server
app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0', function() {
  console.log("Server is running... YAYYYY!");
})     