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


// add these constants and variables at the top
const filterOptions = {
  all: 'all',
  movies: 'movie',
  tvShows: 'tv'
};

let currentFilter = filterOptions.all;
let currentSearch = '';

// filter function
function filterWatchlistItems(items) {
  return items.filter(item => {
    // check media type
    const typeMatch = currentFilter === filterOptions.all || item.media_type === currentFilter;
    
    // check search term
    const searchMatch = !currentSearch || item.title.toLowerCase().includes(currentSearch.toLowerCase());
    
    return typeMatch && searchMatch;
  });
}

// create search bar
function createSearchBar() {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  
  searchContainer.innerHTML = `
    <input type="text" 
    id="watchlist-search" 
    placeholder="search movies or tv shows..."
    value="${currentSearch}"> ${currentSearch ? `<button class="clear-search">✕</button>` : ''}
  `;
  
  const searchInput = searchContainer.querySelector('#watchlist-search');
  const clearButton = searchContainer.querySelector('.clear-search');
  
  // handle search input
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    
    // update clear button visibility
    if (clearButton) {
      clearButton.style.display = currentSearch ? 'block' : 'none';
    }
    
    renderWatchlist();
  });
  
  // handle clear button
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      clearButton.style.display = 'none';
      renderWatchlist();
    });
  }
  
  return searchContainer;
}

// create filter button
function createFilterButton() {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'filter-container';
  
  const filterButton = document.createElement('button');
  filterButton.className = 'filter-button';
  
  // set button text based on current filter
  if (currentFilter === filterOptions.all) {
    filterButton.textContent = 'all';
  } else if (currentFilter === filterOptions.movies) {
    filterButton.textContent = 'movies';
  } else {
    filterButton.textContent = 'tv shows';
  }
  
  // add dropdown menu
  const dropdown = document.createElement('div');
  dropdown.className = 'filter-dropdown';
  dropdown.innerHTML = `
    <div class="filter-option" data-filter="all">all</div>
    <div class="filter-option" data-filter="movie">movies</div>
    <div class="filter-option" data-filter="tv">tv shows</div>
  `;
  
  // toggle dropdown on click
  filterButton.addEventListener('click', () => {
    dropdown.classList.toggle('show');
  });
  
  // handle filter selection
  dropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-option')) {
      currentFilter = e.target.dataset.filter;
      
      // update button text
      if (currentFilter === 'all') {
        filterButton.textContent = 'all';
      } else if (currentFilter === 'movie') {
        filterButton.textContent = 'movies';
      } else {
        filterButton.textContent = 'tv shows';
      }
      
      dropdown.classList.remove('show');
      renderWatchlist();
    }
  });
  
  // close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!filterContainer.contains(e.target)) {
      dropdown.classList.remove('show');
    }
  });
  
  filterContainer.appendChild(filterButton);
  filterContainer.appendChild(dropdown);
  
  return filterContainer;
}

// update renderWatchlist function
async function renderWatchlist() {
  const container = document.getElementById('watchlist-content');
  if (!container) return;

  const watchlist = await watchlistManager.getWatchlist();
  const filteredItems = filterWatchlistItems(watchlist);
  
  // don't recreate controls if they already exist
  let controls = container.querySelector('.watchlist-bar');
  if (!controls) {
    // first time: create controls
    controls = document.createElement('div');
    controls.className = 'watchlist-bar';
    controls.appendChild(createSearchBar());
    controls.appendChild(createFilterButton());
    container.innerHTML = '';
    container.appendChild(controls);
  }
  
  // find or create content area
  let contentArea = container.querySelector('.watchlist-content-area');
  if (!contentArea) {
    contentArea = document.createElement('div');
    contentArea.className = 'watchlist-content-area';
    container.appendChild(contentArea);
  }
  
  // update only the content, not the controls
  contentArea.innerHTML = '';
  
  // show empty state or items
  if (filteredItems.length === 0) {
    let message = '';
    if (watchlist.length === 0) {
      message = `
        <div class="empty-watchlist">
          <h3>your watchlist is empty</h3>
          <p>add movies or tv shows to get started</p>
        </div>
      `;
    } else if (currentSearch) {
      message = `
        <div class="empty-watchlist">
          <h3>no results for "${currentSearch}"</h3>
          <p>try a different search</p>
          <button class="clear-search-btn" id="clear-search-btn">
            clear search
          </button>
        </div>
      `;
    } else if (currentFilter !== filterOptions.all) {
      message = `
        <div class="empty-watchlist">
          <h3>no ${currentFilter === 'movie' ? 'movies' : 'tv shows'} found</h3>
          <p>try changing the filter</p>
          <button id="show-all-btn">
            show all
          </button>
        </div>
      `;
    }
    
    contentArea.innerHTML = message;
    
    // add event listeners for buttons
    setTimeout(() => {
      const clearBtn = document.getElementById('clear-search-btn');
      const showAllBtn = document.getElementById('show-all-btn');
      
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          currentSearch = '';
          const searchInput = document.getElementById('watchlist-search');
          if (searchInput) searchInput.value = '';
          renderWatchlist();
        });
      }
      
      if (showAllBtn) {
        showAllBtn.addEventListener('click', () => {
          currentFilter = filterOptions.all;
          renderWatchlist();
        });
      }
    }, 0);
    
  } else {
    // show filtered items
    const grid = document.createElement('div');
    grid.className = 'watchlist-grid';
    
    grid.innerHTML = filteredItems.map(item => `
      <div class="watchlist-item" onclick="goToDetails(${item.tmdb_id}, '${item.media_type}')">
        <img src="https://image.tmdb.org/t/p/w300${item.poster_path}" alt="${item.title}">
      </div>
    `).join('');
    
    contentArea.appendChild(grid);
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