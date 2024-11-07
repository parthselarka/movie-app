const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;
require('dotenv').config();


const api_key = process.env.API_KEY;
console.log(api_key)

// Predefined list of genres with their corresponding IDs from TMDB
const genres = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to the first page if no page is specified
  const query = req.query.search || '';
  const moviesPerPage = 20;

  try {
    let response;
    let totalMovies;
    let lastPage;

    if (query) {
      // Check if the query matches a genre
      const genre = genres.find(g => g.name.toLowerCase() === query.toLowerCase());

      if (genre) {
        response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
          params: {
            api_key: api_key,
            with_genres: genre.id,
            page: page,
          }
        });
      } else {
        response = await axios.get('https://api.themoviedb.org/3/search/movie', {
          params: {
            api_key: api_key,
            query: query,
            page: page,
          }
        });
      }
    } else {
      // Fetch popular movies by default
      response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
        params: {
          api_key: api_key,
          page: page,
        }
      });
    }

    // Calculate total pages
    totalMovies = response.data.total_results;
    lastPage = Math.ceil(totalMovies / moviesPerPage);

    res.render('index', { movies: response.data.results, page: page, lastPage: lastPage, search: query });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching movie data');
  }
});

app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
      params: {
        api_key: api_key,
      }
    });

    res.render('movie-detail', { movie: response.data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching movie data');
  }
});

app.get('/search', async (req, res) => {
  const query = req.query.query;

  try {
    let response;

    // Check if the query matches a genre
    const genre = genres.find(g => g.name.toLowerCase() === query.toLowerCase());

    if (genre) {
      response = await axios.get('https://api.themoviedb.org/3/discover/movie', {
        params: {
          api_key: api_key,
          with_genres: genre.id,
        }
      });
    } else {
      response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: api_key,
          query: query,
        }
      });
    }

    res.json({ movies: response.data.results });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching movie data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
  
