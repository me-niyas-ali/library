const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const BOOKS_FILE = path.join(__dirname, 'books.json');
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; // Change this!

function readBooks() {
  return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf-8'));
}

function writeBooks(data) {
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(data, null, 2));
}

// API: Get all books
app.get('/books', (req, res) => {
  res.json(readBooks());
});

// API: Request a book
app.post('/request', (req, res) => {
  const { serial } = req.body;
  const books = readBooks();
  const book = books.find(b => b.serial === serial);

  if (!book) return res.status(404).json({ error: 'Book not found' });
  if (book.status !== 'Available') return res.status(400).json({ error: 'Book not available' });

  book.status = 'Requested';
  writeBooks(books);
  res.json({ message: 'Book requested', book });
});

// API: Return a book
app.post('/return', (req, res) => {
  const { serial } = req.body;
  const books = readBooks();
  const book = books.find(b => b.serial === serial);

  if (!book) return res.status(404).json({ error: 'Book not found' });

  book.status = 'Available';
  writeBooks(books);
  res.json({ message: 'Book returned', book });
});

// API: Checkout a book
app.post('/checkout', (req, res) => {
  const { serial } = req.body;
  const books = readBooks();
  const book = books.find(b => b.serial === serial);

  if (!book) return res.status(404).json({ error: 'Book not found' });

  book.status = 'Checked Out';
  writeBooks(books);
  res.json({ message: 'Book checked out', book });
});

// Admin login (simple, not secure for production)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
