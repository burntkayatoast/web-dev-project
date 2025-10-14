// var http = require('http')
// var url = require('url')
// var fs = require('fs')


// function search() {
//     var query = document.getElementById('query').value
//     if (!query) {
//         alert('Please enter a movie name')
//         return
//     }   
    
// }

async function fetchMovies(endPoint, containerId) {
    try {
        const response = await fetch(endPoint);
        const movies = await response.json();
        displayMovies(movies, containerId)
    } catch (error) {
        console.error(error)
    }
}

async function displayMovies(movies, containerId) {
    try {
        const container = document.getElementById(containerId)
        container.innerHTML = movies.map(movie => `
            <div class="movie">
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('movies').innerHTML = 'Error loading movies.';
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

fetchMovies('/api/popular', 'popular')
fetchMovies('/api/popular/all', 'allPopular')
fetchMovies('/api/free', 'free')
fetchMovies('/api/free/all', 'allFree')


