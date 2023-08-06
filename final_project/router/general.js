const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

/*
Please note that I kept synchronous route for retrieve books based on
a criteria, but add a new route for retrieve books asynchronously
(associated with task from 10 to 13)
*/

const public_users = express.Router();

public_users.post('/register', (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res
			.status(400)
			.json({ error: 'Username and password are required.' });
	}

	if (password.trim().length < 8) {
		return res.status(400).json({ error: 'Minimum password length is 8' });
	}

	if (!isValid(username)) {
		return res.status(404).json({ error: 'This user already exist!' });
	}

	users.push({ username, password });
	return res.status(201).json({ message: 'User successfuly added.' });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
	return res.status(200).json(books);
});

// Simulate an external resource or API and send a request to retrieve data using axios
public_users.get('/async', async (req, res) => {
	try {
		const response = await axios.get(
			req.protocol + '://' + req.get('host')
		);
		return res.status(200).json(response.data);
	} catch (err) {
		return res.status(500).json({ message: 'Something goes wrong!' });
	}
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
	const isbn = req.params.isbn;
	const book = books[isbn];

	if (!book) {
		return res.status(404).json({ error: 'Book not found!' });
	}
	return res.status(200).json(book);
});

// Search all books by ISBN and return a promise
const getBookByISBN = function (isbn) {
	return new Promise((resolve, reject) => {
		const book = books[isbn];

		if (book) {
			resolve(book);
		} else {
			reject('Book not found!');
		}
	});
};

// Retrieves and returns a book asynchronously based on ISBN
public_users.get('/async/isbn/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	getBookByISBN(isbn)
		.then(book => res.status(200).json(book))
		.catch(err => res.status(404).json({ error: err }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
	const author = req.params.author;
	const booksList = Object.values(books);

	const searchedBooks = booksList.filter(
		book => book['author'].toLowerCase() === author.toLowerCase()
	);
	if (searchedBooks.length === 0) {
		return res
			.status(404)
			.json({ error: 'No books found for this author!' });
	}
	return res.status(200).json(searchedBooks);
});

// Search all books based on author and return a promise object
const getBooksByAutor = function (author) {
	return new Promise((resolve, reject) => {
		const booksList = Object.values(books);

		const searchedBooks = booksList.filter(
			book => book['author'].toLowerCase() === author.toLowerCase()
		);
		if (searchedBooks.length > 0) {
			resolve(searchedBooks);
		} else {
			reject('No books found for this author!');
		}
	});
};

// Retrieves and returns all books asynchronously based on author using async await
public_users.get('/async/author/:author', async (req, res) => {
	const author = req.params.author;
	try {
		const books = await getBooksByAutor(author);
		return res.status(200).json(books);
	} catch (err) {
		return res.status(404).json({ error: err });
	}
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
	const title = req.params.title.toLowerCase();
	const booksList = Object.values(books);
	const searchedBooks = booksList.filter(book =>
		book['title'].toLowerCase().includes(title)
	);

	if (searchedBooks.length === 0) {
		return res.status(404).json({ error: 'No books found!' });
	}
	return res.status(200).json(searchedBooks);
});

// Search all books based on title and return a promise object
const getBooksByTitle = function (title) {
	return new Promise((resolve, reject) => {
		const booksList = Object.values(books);
		const searchedbooks = booksList.filter(book =>
			book['title'].toLowerCase().includes(title)
		);

		if (searchedbooks.length > 0) {
			resolve(searchedbooks);
		} else {
			reject('No books found!');
		}
	});
};

// Retrieves and returns all books asynchronously based on title using async await
public_users.get('/async/title/:title', async (req, res) => {
	const title = req.params.title.toLowerCase();
	try {
		const books = await getBooksByTitle(title);
		return res.status(200).json(books);
	} catch (err) {
		return res.status(404).json({ error: err });
	}
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
	//Write your code here
	const isbn = req.params.isbn;
	const book = books[isbn];
	if (!book) {
		return res.status(404).json({ error: 'Book not found!' });
	}
	return res.status(200).json(book['reviews']);
});

module.exports.general = public_users;
