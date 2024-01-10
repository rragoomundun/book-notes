import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const app = express();

const PORT = process.env.PORT;
const API_BASE = process.env.API_BASE;

app.use(express.static('public'));

app.get('/', async (req, res) => {
  let nbPages;
  let currentPage = 1;
  let order = 'ratingDesc';
  let books = [];

  try {
    const result = await axios.get(`${API_BASE}/pages/nb`);
    nbPages = result.data.nbPages;
  } catch (error) {
    console.log(error);
  }

  if (req.query.p) {
    currentPage = Number(req.query.p);
  }

  if (req.query.order) {
    order = req.query.order;
  }

  try {
    const result = await axios.get(`${API_BASE}/books/all`, { params: { p: currentPage, order } });
    books = result.data;

    // Set for each book the date in the appropriate format and the url
    for (const book of books) {
      const date = new Date(book.date);

      book.date = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      book.url = `/book/${book.id}/${book.title.toLowerCase().replaceAll(' ', '-')}`;
    }
  } catch (error) {
    console.log(error);
  }

  res.render('index.ejs', { nbPages, currentPage, order, books });
});

app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});
