const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = username => {
	//returns boolean
	//write code to check is the username is valid
	const user = users.find(user => user['username'] === username);
	if (!user) {
		return true;
	}
	return false;
};

const authenticatedUser = (username, password) => {
	//returns boolean
	//write code to check if username and password match the one we have in records.
	const user = users.find(user => user['username'] === username);
	if (user['password'] !== password) {
		return false;
	}
	return true;
};

//only registered users can login
regd_users.post('/login', (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res
			.status(400)
			.json({ error: 'Username and password are required.' });
	}

	if (isValid(username)) {
		return res.status(404).json({ error: 'User does not exist!' });
	}

	if (!authenticatedUser(username, password)) {
		return res.status(403).json({ error: 'Password is not correct' });
	}

	const accessToken = jwt.sign(
		{
			data: password,
		},
		'MojtabaSecret',
		{ expiresIn: 60 * 60 }
	);

	req.session.authorization = {
		accessToken,
		username,
	};
	return res.status(200).json({ message: 'User successfuly logged in.' });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
	//Write your code here
	const isbn = req.params.isbn;
	const book = books[isbn];
	if (!book) {
		return res.status(404).json({ error: 'Book not found!' });
	}

	const { review } = req.body;
	const username = req.session.authorization['username'];
	if (review === undefined) {
		return res.status(400).json({ error: 'No review recived!' });
	}

	//If review doesn't exist
	if (!book.reviews[username]) {
		book.reviews[username] = review;
		return res
			.status(201)
			.json({ message: 'Review successfuly added/updated' });
	}

	//If review exist
	book.reviews[username] = review;
	return res.status(200).json({ message: 'Review successfuly updated.' });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
	const isbn = req.params.isbn;
	const book = books[isbn];
	if (!book) {
		return res.status(404).json({ error: 'Book not found!' });
	}

	const username = req.session.authorization['username'];
	if (!book.reviews[username]) {
		return res.status(404).json({
			error: 'There is no review from this user for this book!!',
		});
	}

	delete book.reviews[username];
	return res.status(200).json({ message: 'Review successfuly deleted' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
