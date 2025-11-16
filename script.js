require('dotenv').config()
console.log('TMDB key loaded:', process.env.TMDB_API_KEY ? 'yes' : 'no')

const express = require('express') // includes express library
const session = require('express-session') // for login/session

const app = express() // creates an express app
const axios = require('axios')
const pool = require("./db")

async function initDatabase() {
  try {
    console.log("Checking & creating tables if missing...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firstname VARCHAR(20),
        lastname VARCHAR(20),
        username VARCHAR(25),
        email VARCHAR(50) UNIQUE NOT NULL,
        profile_picture VARCHAR(500) DEFAULT '/images/default.jpg',
        password VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        tmdb_id INTEGER NOT NULL,
        title VARCHAR(500) NOT NULL,
        poster_path VARCHAR(500),
        release_date DATE,
        vote_average DECIMAL(3,1),
        media_type VARCHAR(20) CHECK (media_type IN ('movie','tv')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tmdb_id, media_type)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_movies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        media_type VARCHAR(10) NOT NULL,
        rating INTEGER CHECK (rating BETWEEN 1 AND 10),
        review_text TEXT,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id)
      );
    `);

    console.log("Database is ready ✔️");
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}

app.set('view engine', 'ejs') // sets the view engine to ejs

app.use(express.static('views')) // Allow access to views folder
app.use(express.static('public')) // Allow access to public folder
app.use(express.static('app')) // Allow access to app folder
app.use(express.static('models')) // Allow access to models folder

// so default image is there
app.use('/images', express.static('images'))

app.use(session({
  secret: 'scene-it-super-secret-key-lol',
  resave: true,
  saveUninitialized: true,
  cookie: {
  secure: false,
  httpOnly: true
  },
  store: new (require('express-session').MemoryStore)()

}))


//allows the extraction of an incoming request object and makes it available using req.body
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json()) 

// at top (already have dotenv/express set up)
const API_KEY = process.env.TMDB_API_KEY

// authentication 
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next()
  } else {
    res.redirect('/login')
  }
}

// make login status available 
app.use((req, res, next) => {
  res.locals.login = !!req.session.userId;
  res.locals.user = req.session.user || null;
  next()
})

// home page
app.get('/', (req, res) => {
  res.render("home")
  console.log('the home page is loaded')
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

// all users section
app.get('/allUsers', async (req, res) => {
  try {
  const result = await pool.query("SELECT * FROM users")
  const users = result.rows;

  res.render("allUsers", { users })
  console.log("the all users page is loaded")
  } catch (err) {
  console.error(err)
  res.send("Error loading users")
  }
})

// logout section
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err)
    }
    res.redirect("/")
  })
})

// register section
app.get('/register', (req, res) => {
  res.render("register")
  console.log('the register page is loaded')
})

app.post("/register", async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users (firstname, lastname, username, email, password)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [firstname, lastname, username, email, password]
    );

    req.session.userId = result.rows[0].id;
    res.redirect("/profile");

  } catch (err) {
    console.error("Register error:", err);

    let message = "Registration failed.";

    // Duplicate email
    if (err.code === "23505") {
      message = "This email is already registered.";
    }

    // Too long for column
    if (err.code === "22001") {
      message = "One of the fields is too long.";
    }

    // Default fallback
    res.render("register", { error: message });
  }
});



// login section
app.get('/login', (req, res) => {
  res.render("login")
  console.log('the login page is loaded')
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
  const result = await pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username]
  )

  if (result.rows.length === 0) {
    return res.render("login", { 
      error: "User not found"
    })
  }

  const user = result.rows[0];

  if (user.password !== password) {
    return res.render("login", { 
      error: "Incorrect password"
    })
  }

  // Set session data
  req.session.userId = user.id;
  req.session.user = {
    id: user.id,
    username: user.username,
    email: user.email
  };

  res.redirect("/")
  } catch (err) {
  console.error(err)
  res.render("login", { 
    error: "Login error"
  })
  }
})

app.get("/edit-profile", requireAuth, async (req, res) => {
  res.render("editProfile", { user: req.session.user, error: null})
  console.log('the edit profile page is loaded')
})

app.post("/edit-profile", async (req, res) => {
  const { firstname, lastname, username, email } = req.body;
  const user_id = req.session.userId;

  try {
  const result = await pool.query(
    `UPDATE users 
     SET firstname = $1, lastname = $2, username = $3, email = $4
     WHERE id = $5
     RETURNING *`,
    [firstname, lastname, username, email, user_id]
  )

  // update session data too
  req.session.user = result.rows[0];

  res.redirect("/profile")
  } catch (err) {
  console.error("Error updating profile:", err)
  res.render("editProfile", { 
    user: req.session.user,
    error: "Could not update profile"
  })
  }
})

app.post("/delete-account", requireAuth, async (req, res) => {
  try {
  const user_id = req.session.userId;

  // Removes user and all related data (thanks to ON DELETE CASCADE)
  await pool.query(`DELETE FROM users WHERE id = $1`, [user_id])

  req.session.destroy((err) => {
    if (err) {
    console.error("Session destroy failed:", err)
    }
    res.redirect("/") 
  })

  } catch (err) {
  console.error("Error deleting account:", err)

  res.render("editProfile", { 
    user: req.session.user,
    error: "Failed to delete account. Please try again."
  })
  }
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


// WATCHLIST ROUTES
app.post('/api/watchlist', requireAuth, async (req, res) => {
  try {
  const { tmdb_id, media_type, title, poster_path, release_date, vote_average } = req.body;
  const user_id = req.session.userId;

  // checks if movie exists in movies table, if it doesn't, insert
  const movieResult = await pool.query(
    `INSERT INTO movies (tmdb_id, title, poster_path, release_date, vote_average, media_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (tmdb_id, media_type) DO UPDATE SET title = EXCLUDED.title
    RETURNING id`,
    [tmdb_id, title, poster_path, release_date, vote_average, media_type]
  )
  
  const movie_id = movieResult.rows[0].id;

  // add to user_movies table
  await pool.query(
    `INSERT INTO user_movies (user_id, movie_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, movie_id) DO NOTHING`,
    [user_id, movie_id]
  )
  
  res.json({ success: true })
  } catch (error) {
  console.error('error adding to watchlist:', error)
  res.status(500).json({ error: 'failed to add to watchlist' })
  }
})

app.get('/api/watchlist', requireAuth, async (req, res) => {
  try {
  const user_id = req.session.userId;
  
  const result = await pool.query(
    `SELECT m.*, um.added_at 
    FROM user_movies um
    JOIN movies m ON um.movie_id = m.id
    WHERE um.user_id = $1
    ORDER BY um.added_at DESC`,
    [user_id]
  )
  
  res.json(result.rows)
  } catch (error) {
  console.error('error getting watchlist:', error)
  res.status(500).json({ error: 'failed to get watchlist' })
  }
})

app.get('/api/watchlist/check/:tmdb_id/:media_type', requireAuth, async (req, res) => {
  try {
  const user_id = req.session.userId;
  const { tmdb_id, media_type } = req.params;
  
  const result = await pool.query(
    `SELECT um.* 
    FROM user_movies um
    JOIN movies m ON um.movie_id = m.id
    WHERE um.user_id = $1 AND m.tmdb_id = $2 AND m.media_type = $3`,
    [user_id, tmdb_id, media_type]
  )
  
  res.json({ inWatchlist: result.rows.length > 0 })
  } catch (error) {
  console.error('error checking watchlist:', error)
  res.status(500).json({ error: 'failure with watchlist' })
  }
})

app.delete('/api/watchlist/:tmdb_id/:media_type', requireAuth, async (req, res) => {
  try {
  const user_id = req.session.userId;
  const { tmdb_id, media_type } = req.params;
  
  await pool.query(
    `DELETE FROM user_movies 
    WHERE user_id = $1 
    AND movie_id IN (SELECT id FROM movies WHERE tmdb_id = $2 AND media_type = $3)`,
    [user_id, tmdb_id, media_type]
  )
  
  res.json({ success: true })
  } catch (error) {
  console.error('error removing from watchlist:', error)
  res.status(500).json({ error: 'failed to remove from watchlist' })
  }
})

app.get('/watchlist', requireAuth, (req, res) => {
  res.render('watchlist')
  console.log('the watchlist page is loaded')
})

// REVIEWS
app.get('/reviews', requireAuth, (req, res) => {
  res.render('reviews')
  console.log('the reviews page is loaded')
})

app.get('/addReview/:movie_id', requireAuth, (req, res) => {
  const { movie_id } = req.params;
  const media_type = req.query.type;

  res.render("addReview", {
  movie_id,
  media_type
  })
})


app.post("/api/reviews", requireAuth, async (req, res) => {
  const { tmdb_id, media_type, rating, review_text, title, poster_path, release_date, vote_average } = req.body;

  const user_id = req.session.userId;

  try {
  // 1. Insert movie if not exists (same as watchlist)
  const movieResult = await pool.query(
    `INSERT INTO movies (tmdb_id, title, poster_path, release_date, vote_average, media_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (tmdb_id, media_type) DO UPDATE SET title = EXCLUDED.title
     RETURNING id`,
    [tmdb_id, title, poster_path, release_date, vote_average, media_type]
  )

  const movie_id = movieResult.rows[0].id;

  // 2. Insert review
  const reviewResult = await pool.query(
    `INSERT INTO user_reviews (user_id, movie_id, media_type, rating, review_text)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, movie_id, media_type, rating, review_text]
  )

  res.json({ success: true, review: reviewResult.rows[0] })

  } catch (error) {
  console.error("error adding review:", error)
  res.status(500).json({ error: "failed to add review" })
  }
})


app.get("/api/reviews", requireAuth, async (req, res) => {
  try {
  const user_id = req.session.userId;

  const result = await pool.query(
    `SELECT ur.*, m.title, m.poster_path, m.tmdb_id
     FROM user_reviews ur
     JOIN movies m ON ur.movie_id = m.id
     WHERE ur.user_id = $1
     ORDER BY ur.added_at DESC`,
    [user_id]
  )

  res.json(result.rows)

  } catch (error) {
  console.error(error)
  res.status(500).json({ error: "failed to get reviews" })
  }
})

app.get("/api/reviews/check/:tmdb_id/:media_type", requireAuth, async (req, res) => {
  const { tmdb_id, media_type } = req.params;
  const user_id = req.session.userId;

  try {
  const result = await pool.query(
    `SELECT ur.* 
     FROM user_reviews ur
     JOIN movies m ON ur.movie_id = m.id
     WHERE ur.user_id = $1
     AND m.tmdb_id = $2
     AND m.media_type = $3`,
    [user_id, tmdb_id, media_type]
  )

  res.json({ reviewed: result.rows.length > 0 })

  } catch (error) {
  console.error("error checking review:", error)
  res.status(500).json({ error: "failed to check review" })
  }
})

app.post("/delete-review", requireAuth, async (req, res) => {
  try {
    const {review_id} = req.body
    const user_id = req.session.userId

    // Removes user and all related data (thanks to ON DELETE CASCADE)
    await pool.query(`DELETE FROM user_reviews WHERE id = $1 and user_id = $2`, [review_id, user_id])

    res.redirect("/reviews")

  } catch (err) {
    console.error("Error deleting review:", err)

    res.status(500).json({ error: "Failed to delete review" })
  }
})


// requirements to start the server
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', function() {
    console.log("Server is running... YAYYYY!")
  })   
})