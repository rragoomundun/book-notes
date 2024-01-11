import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config({ path: './config/config.env' });

const app = express();

const PORT = process.env.PORT;
const API_BASE = process.env.API_BASE;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

function getBookDate(book) {
  const date = new Date(book.date);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getBookURL(book) {
  return `/books/${book.id}/${book.title.toLowerCase().replaceAll(' ', '-')}`;
}

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
      book.date = getBookDate(book);
      book.url = getBookURL(book);
    }
  } catch (error) {
    console.log(error);
  }

  res.render('index.ejs', { nbPages, currentPage, order, books });
});

app.get('/books/:id/:title', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await axios.get(`${API_BASE}/books/${id}`);
    const book = result.data;

    book.date = getBookDate(book);
    book.url = getBookURL(book);

    res.render('book.ejs', book);
  } catch {
    res.render('book.ejs', { error: true });
  }
});

app.get('/books/add', async (req, res) => {
  const date = new Date();
  let month = String(date.getMonth() + 1),
    day = String(date.getDate());

  if (month.length === 1) {
    month = `0${month}`;
  }

  if (day.length === 1) {
    day = `0${day}`;
  }

  const maxDate = `${date.getFullYear()}-${month}-${day}`;

  res.render('addBook.ejs', { maxDate });
});

app.post('/books/add', async (req, res) => {
  try {
    const result = await axios.post(`${API_BASE}/books/add`, req.body);
    // TODO: Go to book page /books/:id/:title
  } catch {}

  res.send();
});

app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});
