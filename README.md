# Papyrus - A simple Library Management System

This software is originally made for a community library in an apartment block. It is still WIP and made using Electron and MySQL. It is designed to be installed on a device that has no internet connection.

### Getting started

1. Install MySQL database on your system. and create a database with the name - library.
2. Import the sample DB into it
3. clone the repo and run `npm install` and then `npm start` to get the app running
4. Please make sure the correct database credentials are added in ./src/js/db.js

The software is purely experimental and is presented on an as-is basis for anyone to play with.

The software is customized for my housing society and accepts flat numbers either as 5 digit numbers or - Wing + 4digit flat number eg: A0123 ( Accepts only A, B, C and D wing). [Logic here](https://github.com/nagrampai/papyrus/blob/main/src/js/check-book.js#L28)
