const API_KEY = "your_tmdb_key" // API_KEY comes from config.js
const BASE_URL = "https://api.themoviedb.org/3"
const IMG_URL = "https://image.tmdb.org/t/p/w500"

const genres = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 878, name: "Sci-Fi" },
    { id: 10749, name: "Romance" },
    { id: 16, name: "Animation" },
    { id: 53, name: "Thriller" }
]

async function loadTrendingMovies() {
    const grid = document.getElementById("trendingGrid")

    try {
        const res = await fetch(
            `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`
        )
        

        const data = await res.json()
        

        grid.innerHTML = ""

        data.results.slice(0, 10).forEach(movie => {

            const card = document.createElement("div")
            card.classList.add("movie-card")

            card.innerHTML = `
                <img
                    src="${
                        movie.poster_path
                            ? IMG_URL + movie.poster_path
                            : 'https://via.placeholder.com/160x240?text=No+Image'
                    }"
                    alt="${movie.title}"
                >

                <div class="movie-card-info">
                    <h4>${movie.title}</h4>
                    <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                </div>
            `

            card.style.cursor = "pointer"

            card.addEventListener("click", () => {
                showMovieDetails(movie.id)
            })

            grid.appendChild(card)
        })

    } catch(err) {
        grid.innerHTML = "Failed to load trending movies."
    }
}
// Build genre tabs
function buildGenreTabs() {
    const tabsContainer = document.getElementById("genreTabs")
    genres.forEach((genre, index) => {
        const tab = document.createElement("div")
        tab.classList.add("genre-tab")
        tab.textContent = genre.name
        tab.onclick = () => {
            currentPage = 1
            loadGenreMovies(genre.id, tab, 1)
        }
        tabsContainer.appendChild(tab)
        if (index === 0) {
            tab.classList.add("active")
            loadGenreMovies(genre.id, tab)
        }
    })
}

let currentGenre = null
let currentPage = 1
async function loadGenreMovies(genreId, clickedTab, page = 1) {
    currentGenre = genreId
    currentPage = page
    document.querySelectorAll(".genre-tab").forEach(t => t.classList.remove("active"))
    clickedTab.classList.add("active")
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)
    let data = await res.json()
    console.log(data)

    const grid = document.getElementById("moviesGrid")
    grid.innerHTML = "Loading movies..."

    try {
        let res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
        )
        let data = await res.json()
        
        if(page === 1){
            grid.innerHTML = ""
        }
        data.results.forEach(movie => {
            const card = document.createElement("div")
            card.classList.add("movie-card")
            card.innerHTML = `
                <img src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/160x240?text=No+Image'}" alt="${movie.title}">
                <div class="movie-card-info">
                    <h4>${movie.title}</h4>
                    <p>⭐ ${movie.vote_average.toFixed(1)}</p>
                </div>
            `
            card.style.cursor = "pointer"
            card.addEventListener("click", () => {
                showMovieDetails(movie.id)
            })
        let existingBtn = document.getElementById("loadMoreBtn")
        if(existingBtn){
            existingBtn.remove()
        }
        const loadMoreBtn = document.createElement("button")
        loadMoreBtn.id = "loadMoreBtn"
        loadMoreBtn.textContent = `View More ${clickedTab.textContent} Movies →`

        loadMoreBtn.onclick = () => {
            loadGenreMovies(currentGenre, clickedTab, currentPage + 1)
        }
        grid.parentElement.appendChild(loadMoreBtn)
        grid.appendChild(card)
            
        })
    } catch(err) {
        grid.innerHTML = "Failed to load movies"
    }
}

async function showMovieDetails(movieId) {
    const resultDiv = document.getElementById("searchResult")

    resultDiv.style.display = "block"
    resultDiv.innerHTML = "Loading movie details..."

    try {
        const detailRes = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
        )

        const detail = await detailRes.json()

        function getStars(rating) {
            const stars = Math.round(rating / 2)
            return "⭐".repeat(stars)
        }

        resultDiv.innerHTML = `
            <div class="result-card">
                <img
                    src="${
                        detail.poster_path
                            ? IMG_URL + detail.poster_path
                            : 'https://via.placeholder.com/200x300?text=No+Image'
                    }"
                    alt="${detail.title}"
                >

                <div class="result-details">
                    <h2>${detail.title}</h2>

                    <div class="rating">
                        ${getStars(detail.vote_average)}
                        ${detail.vote_average.toFixed(1)}/10
                    </div>

                    <p><strong>Release Date:</strong> ${detail.release_date}</p>
                    <p><strong>Runtime:</strong> ${detail.runtime} mins</p>

                    <p>
                        <strong>Genres:</strong>
                        ${detail.genres.map(g => g.name).join(", ")}
                    </p>

                    <p><strong>Overview:</strong> ${detail.overview}</p>

                    <p>
                        <strong>Budget:</strong>
                        $${detail.budget.toLocaleString()}
                    </p>

                    <p>
                        <strong>Revenue:</strong>
                        $${detail.revenue.toLocaleString()}
                    </p>
                </div>
            </div>
        `

        resultDiv.scrollIntoView({
            behavior: "smooth"
        })

    } catch (err) {
        resultDiv.innerHTML = "Failed to load movie details."
    }
}
// Search movie
async function searchMovie() {
    let userInput = document.getElementById("movieInput").value.trim()
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(userInput)}`)
    let data = await res.json()
    console.log(data)
    if (!userInput) return
    
    const resultDiv = document.getElementById("searchResult")
    resultDiv.style.display = "block"
    resultDiv.innerHTML = "Searching..."
    
    try {
        let res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(userInput)}`)
        let data = await res.json()

        if (data.results.length === 0) {
            resultDiv.innerHTML = "Movie not found."
            return
        }

        const movie = data.results[0]
        showMovieDetails(movie.id)
        
        // Get full details
        let detailRes = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`)
        let detail = await detailRes.json()

        function getStars(rating) {
            const stars = Math.round(rating / 2)
            return '⭐'.repeat(stars)
        }

        resultDiv.innerHTML = `
            <div class="result-card">
                <img src="${detail.poster_path ? IMG_URL + detail.poster_path : 'https://via.placeholder.com/200x300?text=No+Image'}" alt="${detail.title}">
                <div class="result-details">
                    <h2>${detail.title}</h2>
                    <div class="rating">${getStars(detail.vote_average)} ${detail.vote_average.toFixed(1)}/10</div>
                    <p><strong>Release Date:</strong> ${detail.release_date}</p>
                    <p><strong>Runtime:</strong> ${detail.runtime} mins</p>
                    <p><strong>Genres:</strong> ${detail.genres.map(g => g.name).join(", ")}</p>
                    <p><strong>Overview:</strong> ${detail.overview}</p>
                    <p><strong>Budget:</strong> $${detail.budget.toLocaleString()}</p>
                    <p><strong>Revenue:</strong> $${detail.revenue.toLocaleString()}</p>
                </div>
            </div>
        `
    } catch(err) {
        resultDiv.innerHTML = "Something went wrong."
    }
}

// Enter key support
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") searchMovie()
})


buildGenreTabs()
loadTrendingMovies("day")

const themeToggle = document.getElementById("themeToggle")

if(localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme")
    themeToggle.textContent = "☀️"
}

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light-theme")

    if(document.body.classList.contains("light-theme")) {

        localStorage.setItem("theme", "light")
        themeToggle.textContent = "☀️"

    } else {

        localStorage.setItem("theme", "dark")
        themeToggle.textContent = "🌙"
    }
})