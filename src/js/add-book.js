'use strict';

const { runDBQuery } = require('./js/db');

const addBookForm = document.getElementById('add-book-form');


addBookForm.addEventListener('submit', addBookHandler);

function addBookHandler(e) {
    e.preventDefault();
    const bookFormData = e.target.elements;
    const bookTitle = bookFormData["book-title-textbox"].value;
    const bookAuthor = bookFormData["book-author-textbox"].value;
    const bookIsbn = bookFormData["isbn-textbox"].value;
    const bookShelf = bookFormData["shelf-textbox"].value;
    const bookGenre = bookFormData["genre-textbox"].value;
    const resultArea = document.getElementById('result-container');

    const addBookQuery = `INSERT INTO library.books (books.title, books.author, books.shelf, books.genre) VALUES ('${bookTitle}', '${bookAuthor}', '${bookShelf}', '${bookGenre}');`;

    runDBQuery(addBookQuery, (result) => {
        resultArea.innerHTML = `<p>Book ID - ${result.insertId} added successfully</p>`;

    });
}