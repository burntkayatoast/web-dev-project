console.log("reviews.js loaded");

// Load only on reviews page
async function loadReviews() {
    const container = document.getElementById("reviews-content");

    if (!container) return; // do nothing if NOT on reviews page

    try {
        const res = await fetch("/api/reviews");
        const reviews = await res.json();

        if (reviews.length === 0) {
            container.innerHTML = `
                <div class="empty-watchlist">
                    <div class="empty-watchlist-icon">✍️</div>
                    <h3>You haven't written any reviews yet</h3>
                    <p>Start reviewing movies and TV shows!</p>
                </div>
            `;
            return;
        }

        reviews.forEach(review => {
        const card = document.createElement("div");
        card.classList.add("review-wrapper");

        card.innerHTML = `
            <div class="review-card">
                <img class="review-card-poster"
                    src="https://image.tmdb.org/t/p/w300${review.poster_path}"
                    alt="${review.title}"
                >

                <div class="review-card-info">
                    <h2>${review.title}</h2>

                    <p class="review-deets">Your Rating: <strong>${review.rating}/10</strong></p>

                    <p class="review-deets">${review.review_text}</p>

                    <div class="review-actions">
                        <button class="details-btn"
                            onclick="window.location.href='/${review.media_type === "movie" ? "movies" : "tv_shows"}/${review.tmdb_id}'">
                            View Details
                        </button>

                        <form action="/delete-review" method="POST" class="delete-form">
                            <input type="hidden" name="review_id" value="${review.id}">
                            <button class="details-btn" onclick="return confirm('Delete this review?')">
                                Delete Review
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    } catch (error) {
        console.error("Error loading reviews:", error);
        container.innerHTML = `<p>Error loading reviews</p>`;
    }
}

document.addEventListener("DOMContentLoaded", loadReviews);
