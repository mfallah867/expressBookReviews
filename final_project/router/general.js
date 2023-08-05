const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;

const public_users = express.Router();

public_users.post('/register', (req, res) => {
	//Write your code here
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
	return res.status(200).send(JSON.stringify(books));
});

public_users.get('/async', async (req, res) => {
	try {
		const response = await axios({
			url: req.protocol + '://' + req.get('host'),
			method: 'get',
		});
		return res.status(200).json(response.data);
	} catch (err) {
		return res.status(500).json({ message: 'Something goes wrong!' });
	}
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
	//Write your code here
	const isbn = req.params.isbn;
	const book = books[isbn];

	if (!book) {
		return res.status(404).json({ error: 'Book not found!' });
	}
	return res.status(200).json(book);
});

public_users.get('/async/isbn/:isbn', async (req, res) => {
	const isbn = req.params.isbn;
	try {
		const response = await axios({
			url: `${req.protocol}://${req.get('host')}/isbn/${isbn}`,
			method: 'get',
		});
		return res.status(200).json(response.data);
	} catch (err) {
		return res.status(500).json({ message: 'Something goes wrong!' });
	}
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
	const author = req.params.author;
	const booksList = Object.values(books);

	const searchedBooks = booksList.filter(book => book['author'] === author);
	if (!searchedBooks) {
		return res
			.status(404)
			.json({ error: 'No book found for this author!' });
	}
	return res.status(200).json(searchedBooks);
});

public_users.get('/async/author/:author', async (req, res) => {
	const author = req.params.author;
	try {
		const response = await axios({
			url: `${req.protocol}://${req.get('host')}/author/${author}`,
			method: 'get',
		});
		return res.status(200).json(response.data);
	} catch (err) {
		return res.status(500).json({ message: 'Something goes wrong!' });
	}
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
	//Write your code here
	const title = req.params.title;
	const booksList = Object.values(books);
	const book = booksList.find(book => book['title'] === title);

	if (!book) {
		return res.status(404).json({ error: 'Book not found!' });
	}
	return res.status(200).json(book);
});

public_users.get('/async/title/:title', async (req, res) => {
	const title = req.params.title;
	try {
		const response = await axios({
			url: `${req.protocol}://${req.get('host')}/title/${title}`,
			method: 'get',
		});
		return res.status(200).json(response.data);
	} catch (err) {
		return res.status(500).json({ message: 'Something goes wrong!' });
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
