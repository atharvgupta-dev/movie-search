// API_KEY comes from config.js
const BASE_URL = "https://api.themoviedb.org/3"
const IMG_URL  = "https://image.tmdb.org/t/p/w500"

const genres = [
    { id: 28,    name: "Action"    },
    { id: 35,    name: "Comedy"    },
    { id: 18,    name: "Drama"     },
    { id: 27,    name: "Horror"    },
    { id: 878,   name: "Sci-Fi"    },
    { id: 10749, name: "Romance"   },
    { id: 16,    name: "Animation" },
    { id: 53,    name: "Thriller"  }
]

// ── TRENDING ──────────────────────────────────────────────────────────────────

async function loadTrendingMovies() {
    const grid = document.getElementById("trendingGrid")
    try {
        const res  = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}`)
        const data = await res.json()
        grid.innerHTML = ""
        data.results.slice(0, 10).forEach(movie => {
            grid.appendChild(buildMovieCard(movie))
        })
    } catch {
        grid.textContent = "Failed to load trending movies."
    }
}

// ── GENRE TABS ────────────────────────────────────────────────────────────────

function buildGenreTabs() {
    const tabsContainer = document.getElementById("genreTabs")
    genres.forEach((genre, index) => {
        const tab = document.createElement("div")
        tab.classList.add("genre-tab")
        tab.textContent = genre.name
        tab.onclick = () => {
            currentPage  = 1
            currentGenre = genre.id
            loadGenreMovies(genre.id, tab, 1)
        }
        tabsContainer.appendChild(tab)
        if (index === 0) {
            tab.classList.add("active")
            loadGenreMovies(genre.id, tab, 1)
        }
    })
}

let currentGenre = null
let currentPage  = 1

async function loadGenreMovies(genreId, clickedTab, page = 1) {
    currentGenre = genreId
    currentPage  = page

    // Update active tab
    document.querySelectorAll(".genre-tab").forEach(t => t.classList.remove("active"))
    clickedTab.classList.add("active")

    const grid = document.getElementById("moviesGrid")

    // Only clear + show loading on first page
    if (page === 1) {
        grid.innerHTML = "Loading movies..."
    }

    // Remove existing Load More button before fetching
    document.getElementById("loadMoreBtn")?.remove()

    try {
        const res  = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
        )
        const data = await res.json()

        if (page === 1) grid.innerHTML = ""

        data.results.forEach(movie => {
            grid.appendChild(buildMovieCard(movie))
        })

        // Add Load More button once, after loop
        const loadMoreBtn = document.createElement("button")
        loadMoreBtn.id          = "loadMoreBtn"
        loadMoreBtn.textContent = `More ${clickedTab.textContent} →`
        loadMoreBtn.onclick = () => {
            loadGenreMovies(currentGenre, clickedTab, currentPage + 1)
        }
        grid.parentElement.appendChild(loadMoreBtn)

    } catch {
        grid.textContent = "Failed to load movies."
    }
}

// ── MOVIE CARD (shared builder) ───────────────────────────────────────────────

function buildMovieCard(movie) {
    const card = document.createElement("div")
    card.classList.add("movie-card")
    card.innerHTML = `
        <img
            src="${movie.poster_path ? IMG_URL + movie.poster_path : 'https://via.placeholder.com/160x240?text=No+Image'}"
            alt="${movie.title}"
            loading="lazy"
        >
        <div class="movie-card-info">
            <h4>${movie.title}</h4>
            <p>⭐ ${movie.vote_average.toFixed(1)}</p>
        </div>
    `
    card.addEventListener("click", () => showMovieDetails(movie.id))
    return card
}

// ── MOVIE DETAILS ─────────────────────────────────────────────────────────────

async function showMovieDetails(movieId) {
    const resultDiv = document.getElementById("searchResult")
    resultDiv.style.display = "block"
    resultDiv.innerHTML = "Loading movie details..."
    resultDiv.scrollIntoView({ behavior: "smooth" })

    try {
        const res    = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
        const detail = await res.json()

        resultDiv.innerHTML = `
            <div class="result-card">
                <img
                    src="${detail.poster_path ? IMG_URL + detail.poster_path : 'https://via.placeholder.com/200x300?text=No+Image'}"
                    alt="${detail.title}"
                >
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
    } catch {
        resultDiv.innerHTML = "Failed to load movie details."
    }
}

function getStars(rating) {
    return "⭐".repeat(Math.round(rating / 2))
}

// ── SEARCH ────────────────────────────────────────────────────────────────────

async function searchMovie() {
    const userInput = document.getElementById("movieInput").value.trim()
    if (!userInput) return   // guard BEFORE any fetch

    const resultDiv = document.getElementById("searchResult")
    resultDiv.style.display = "block"
    resultDiv.innerHTML = "Searching..."

    try {
        const res  = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(userInput)}`)
        const data = await res.json()

        if (!data.results || data.results.length === 0) {
            resultDiv.innerHTML = `No results found for "<strong>${userInput}</strong>". Try a different title.`
            return
        }

        // showMovieDetails already renders the full card; no need to duplicate
        showMovieDetails(data.results[0].id)
    } catch {
        resultDiv.innerHTML = "Something went wrong. Please try again."
    }
}

// Enter key support
document.addEventListener("keydown", e => {
    if (e.key === "Enter") searchMovie()
})

// ── THEME ─────────────────────────────────────────────────────────────────────

const themeToggle = document.getElementById("themeToggle")

if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light-theme")
    themeToggle.textContent = "☀️"
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-theme")
    const isLight = document.body.classList.contains("light-theme")
    localStorage.setItem("theme", isLight ? "light" : "dark")
    themeToggle.textContent = isLight ? "☀️" : "🌙"
})

// ── INIT ──────────────────────────────────────────────────────────────────────

buildGenreTabs()
loadTrendingMovies()