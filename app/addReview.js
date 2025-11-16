console.log("addReview.js loaded")

let loadedMovie = null

// Stop if page doesn't have review form
const form = document.getElementById("submitReview")
if (form) {

    const { tmdb_id, media_type, api_key } = window.reviewData

    // Load movie info
    async function loadMovieInfo() {
        const url = media_type === "movie"
            ? `https://api.themoviedb.org/3/movie/${tmdb_id}?api_key=${api_key}`
            : `https://api.themoviedb.org/3/tv/${tmdb_id}?api_key=${api_key}`

        const res = await fetch(url)
        const data = await res.json()

        loadedMovie = data

        document.getElementById("movieTitle").textContent = data.title || data.name
    }

    loadMovieInfo()

    // Submit form
    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        if (!loadedMovie) {
            alert("Movie info not loaded yet!")
            return
        }

        const reviewData = {
            tmdb_id,
            media_type,
            rating: document.getElementById("rating").value,
            review_text: document.getElementById("reviewText").value,

            // REQUIRED FOR BACKEND
            title: loadedMovie.title || loadedMovie.name,
            poster_path: loadedMovie.poster_path,
            release_date: loadedMovie.release_date || loadedMovie.first_air_date,
            vote_average: loadedMovie.vote_average
        }

        const res = await fetch("/api/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData)
        })

        if (res.ok) {
            window.location.href = "/reviews"
        } else {
            alert("Failed to submit review.")
        }
    })

}
