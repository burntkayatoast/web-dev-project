console.log('watchlist page loaded');

class WatchlistManager {

  // check if movie is in user's watchlist
  async isInWatchlist(tmdbId, mediaType) {
    try {
      const response = await fetch(`/api/watchlist/check/${tmdbId}/${mediaType}`);
      const data = await response.json();
      return data.inWatchlist;
    } catch (error) {
      console.error('error checking watchlist:', error);
      return false;
    }
  }

  // add movie to watchlist
  async addToWatchlist(movieData) {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movieData) 
      });
      
      return response.ok;
    } catch (error) {
      console.error('error adding to watchlist:', error);
      return false;
    }
  }

  // remove movie from watchlist
  async removeFromWatchlist(tmdbId, mediaType) {
    try {
      const response = await fetch(`/api/watchlist/${tmdbId}/${mediaType}`, {
          method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error('error removing from watchlist:', error);
      return false;
    }
  }

  // toggle movie in watchlist
  async toggleMovie(movieData) {
    const isInWatchlist = await this.isInWatchlist(movieData.tmdb_id, movieData.media_type);
    
    if (isInWatchlist) {
      await this.removeFromWatchlist(movieData.tmdb_id, movieData.media_type);
      return { added: false };
    } else {
      await this.addToWatchlist(movieData);
      return { added: true };
    }
  }

  // get user's watchlist
  async getWatchlist() {
    try {
      const response = await fetch('/api/watchlist');
      return await response.json();
    } catch (error) {
      console.error('error getting watchlist:', error);
      return [];
    }
  }
}

const watchlistManager = new WatchlistManager();

// update the appearance of the watchlist button on movie details pages
async function updateWatchlistButton(button, tmdbId, mediaType) {
  const isInWatchlist = await watchlistManager.isInWatchlist(tmdbId, mediaType);
  
  button.classList.toggle('added', isInWatchlist);
  button.innerHTML = isInWatchlist ? 
    `<i class="bi bi-x-circle"></i> Remove from Watchlist` :
    `<i class="bi bi-plus-circle"></i> Add to Watchlist`;
}

// handle click events on the watchlist button
async function handleWatchlistClick(button) {
  const movieData = {
    tmdb_id: parseInt(button.dataset.movieId),
    media_type: button.dataset.movieType,
    title: button.dataset.movieTitle || 'Unknown Title',
    poster_path: button.dataset.posterPath || '',
    release_date: button.dataset.releaseDate || '',
    vote_average: parseFloat(button.dataset.voteAverage) || 0
  };
  
  await watchlistManager.toggleMovie(movieData);
  await updateWatchlistButton(button, movieData.tmdb_id, movieData.media_type);
}

// render the watchlist page with clickable posters
async function renderWatchlist() {
  const container = document.getElementById('watchlist-content');
  if (!container) return;

  const watchlist = await watchlistManager.getWatchlist();
  
  if (watchlist.length === 0) {
    container.innerHTML = `
      <div class="empty-watchlist">
        <div class="empty-watchlist-icon">📺</div>
        <h3>Your watchlist is empty</h3>
        <p>Start adding movies and TV shows you want to watch!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="watchlist-grid">
      ${watchlist.map(item => `
        <div class="watchlist-item" onclick="goToDetails(${item.tmdb_id}, '${item.media_type}')">
        <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${item.title}">
        </div>
      `).join('')}
    </div>
  `;
}

// navigate to movie or tv show details page
function goToDetails(tmdbId, mediaType) {
  if (mediaType === 'movie') {
    window.location.href = `/movies/${tmdbId}`;
  } else {
    window.location.href = `/tv_shows/${tmdbId}`;
  }
}

// initialize watchlist when page loads
document.addEventListener('DOMContentLoaded', async () => {
  // set up watchlist buttons on movie details pages
  const buttons = document.querySelectorAll('.watchlist-btn');
  
  for (const btn of buttons) {
    const tmdbId = parseInt(btn.dataset.movieId);
    const mediaType = btn.dataset.movieType;
    
    await updateWatchlistButton(btn, tmdbId, mediaType);
    btn.addEventListener('click', () => handleWatchlistClick(btn));
  }
  
  // render watchlist page if we're on the watchlist page
  await renderWatchlist();
});

// make functions available for global use
window.goToDetails = goToDetails;