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

async function loadMovies() {
    const response = await fetch('/api/movies');
    const movies = await response.json();
    console.log("showing movies")

    displayMovies(movies)
}

async function displayMovies(movies) {
    try {
        document.getElementById('movies').innerHTML = movies.map(movie => `
            <div class="movie">
                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>⭐ ${movie.vote_average}</p>
            </div>
        `).join('');
    } catch (error) {
        document.getElementById('movies').innerHTML = 'Error loading movies.';
        console.error(error);
    }
}

loadMovies();