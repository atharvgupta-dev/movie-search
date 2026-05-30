async function sendMovieData() {
    let userInput = document.getElementById("movieInput").value.trim().toLowerCase()
    if (!userInput) {
        document.getElementById("movieResult").innerHTML =
            "Please enter a movie name"
        return
    }
    try {
        let response = await fetch(`https://www.omdbapi.com/?t=${userInput}&apikey=trilogy`)
        let data = await response.json()
        if (data.Response === "True") {
            document.getElementById("movieResult").innerHTML = "Loading..."
            document.getElementById("movieResult").innerHTML = `
            <div class = "card">
                <img src="${data.Poster}" alt="${data.Title} poster" class="movie-poster">
                <p>Title: ${data.Title}</p> 
                <p>Year: ${data.Year}</p>
                <p>Rated: ${data.Rated}</p>
                <p>Released: ${data.Released}</p>
                <p>Runtime: ${data.Runtime}</p>   
                <p>Genre: ${data.Genre}</p>
                <p>Director: ${data.Director}</p>
                <p>Actors: ${data.Actors}</p>
                <p>Plot: ${data.Plot}</p>
                <p>IMDB Rating: ${data.imdbRating}</p>
                <p>Box Office: ${data.BoxOffice}</p>
            </div>
            `
        } else {
            document.getElementById("movieResult").innerHTML = "Movie not found."
        }
    } catch (error) {
        document.getElementById("movieResult").innerHTML ="Failed to fetch data"
    }
}


document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMovieData()
    }   
})
