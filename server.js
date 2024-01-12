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

function getMaxReleaseDate() {
  const date = new Date();
  let month = String(date.getMonth() + 1),
    day = String(date.getDate());

  if (month.length === 1) {
    month = `0${month}`;
  }

  if (day.length === 1) {
    day = `0${day}`;
  }

  return `${date.getFullYear()}-${month}-${day}`;
}

function getDateYYYYMMDD(d) {
  const date = new Date(d);
  let month = String(date.getMonth() + 1),
    day = String(date.getDate());

  if (month.length === 1) {
    month = `0${month}`;
  }

  if (day.length === 1) {
    day = `0${day}`;
  }

  return `${date.getFullYear()}-${month}-${day}`;
}

function getBookURL(book) {
  return `/books/${book.id}/${book.title.toLowerCase().replaceAll(' ', '-')}`;
}

async function getBook(id) {
  const result = await axios.get(`${API_BASE}/books/${id}`);
  const book = result.data;

  book.date = getDateYYYYMMDD(book.date);
  book.url = getBookURL(book);

  return book;
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
      book.date = getDateYYYYMMDD(book.date);
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
    const book = await getBook(id);

    res.render('book.ejs', book);
  } catch {
    res.render('book.ejs', { error: true });
  }
});

app.get('/books/add', async (req, res) => {
  res.render('addBook.ejs', { maxDate: getMaxReleaseDate() });
});

app.post('/books/add', async (req, res) => {
  try {
    const result = await axios.post(`${API_BASE}/books/add`, req.body);
    const book = result.data;
    const bookUrl = getBookURL(book);

    res.redirect(bookUrl);
  } catch {
    res.render('addBook.ejs', { ...req.body, maxDate: getMaxReleaseDate(), error: true });
  }
});

app.get('/books/:id/:title/edit', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await getBook(id);

    book.date = getDateYYYYMMDD(book.date);

    res.render('editBook.ejs', { ...book, maxDate: getMaxReleaseDate() });
  } catch {
    res.render('editBook.ejs', { errorNotFound: true });
  }
});

app.post('/books/:id/:title/edit', async (req, res) => {
  const { id } = req.params;

  try {
    await axios.put(`${API_BASE}/books/${id}/update`, req.body);
    res.redirect(getBookURL({ ...req.body, id }));
  } catch {
    const book = req.body;
    book.url = getBookURL({ ...req.body, id });

    res.render('editBook.ejs', { ...book, maxDate: getMaxReleaseDate(), errorISBN: true });
  }
});

app.listen(PORT, () => {
  console.log(`Server runnig on port ${PORT}`);
});
