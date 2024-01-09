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
    currentPage = req.query.p;
  }

  if (req.query.order) {
    order = req.query.order;
  }

  try {
    const result = await axios.get(`${API_BASE}/books/all`, { params: { currentPage, order } });
    books = result.data;
  } catch (error) {
    console.log(error);
  }

  res.render('index.ejs', { nbPages, currentPage, order, books });
});

app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});
