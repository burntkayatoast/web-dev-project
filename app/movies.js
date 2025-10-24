document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  if (!searchBtn || !searchInput) {
    console.warn('Search elements not found — skipping search listeners');
    return;
  }

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      alert('Please enter a movie or TV show name');
      return;
    }

    // Clear previous results
    const container = document.getElementById('searchResults');
    if (container) container.innerHTML = '<div class="loader"></div>';

    // Run both movie + TV searches
    await fetchMovies(`/api/search/movies?q=${encodeURIComponent(query)}`, 'searchResults');
    await fetchMovies(`/api/search/tv?q=${encodeURIComponent(query)}`, 'searchResults');
  }
});


async function fetchMovies(endPoint, containerId, type) {
    try {
        const response = await fetch(endPoint);
        const movies = await response.json();
        if (type == 'movie') {
          displayMovies(movies, containerId)
        } else if (type == 'tv') {
          displayTvShows(movies, containerId)
        }
    } catch (error) {
        console.error(error)
    }
}

async function displayMovies(movies, containerId) {    
    try {
        const container = document.getElementById(containerId)
        if (!movies.length) {
            container.innerHTML = `<p>No movies found from that search</p>`
            return
        }
        container.innerHTML = movies.map(movie => `
            <div class="movie">
              <a href="/movies/${movie.id}">
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
              </a>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('movies').innerHTML = 'Error loading movies.';
        console.error(error);
    }
}

async function displayTvShows(tv, containerId) {    
    try {
        const container = document.getElementById(containerId)
        if (!tv.length) {
            container.innerHTML = `<p>No movies found from that search</p>`
            return
        }
        container.innerHTML = tv.map(show => `
            <div class="movie">
              <a href="/tv_shows/${show.id}">
                <img src="https://image.tmdb.org/t/p/w200${show.poster_path}" alt="${show.title}">
              </a>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('tv_shows').innerHTML = 'Error loading movies.';
        console.error(error);
    }
}

async function seeAll() {
    const seeAllBtn = document.querySelector('.see-all');
    const movieRow = document.getElementById('movies');
}

// this was in the display movies functions
// <h3>${movie.title}</h3>
//<p>⭐ ${movie.vote_average}</p>

fetchMovies('/api/popular', 'popular', 'movie')
fetchMovies('/api/popular/all', 'allPopular', 'movie')
fetchMovies('/api/p_tv_show', 'tvShows', 'tv')
fetchMovies('/api/p_tv_show/all', 'allTvShows', 'tv')
fetchMovies('/api/movies', 'allMovies', 'movie')
fetchMovies('/api/tv_shows', 'tv_shows', 'tv')



