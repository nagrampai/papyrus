'use strict';
/* eslint-disable no-alert */
const { startConnection, runDBQuery } = require('./js/db');

const masterSearchForm = document.querySelector('#master-search-form');
masterSearchForm.addEventListener('submit', getSearchQueryHandler);

/**
 * Event handler for main search form
 *
 * @param {Object} event
 */

function getSearchQueryHandler(event) {
	event.preventDefault();
	const masterSearchTerm = masterSearchForm.elements['book-or-member'].value;

	if (masterSearchTerm.length > 5) {
		// eslint-disable-next-line no-alert, no-undef
		alert('Please enter a valid book ID or member ID');
		return;
	}

	//startConnection();

	// Detect if query is book ID / code or Member flat number
	let sqlQuery = '';
	if (
		// If the query is a member flat number
		masterSearchTerm.length === 5 &&
		['A', 'B', 'C', 'D'].includes(masterSearchTerm[0].toUpperCase())
	) {
		// convert flat number to member ID. eg. D0703 to 60703
		const memberID = getMemberIDFromFlatNumber(
			masterSearchTerm.toUpperCase()
		);
		sqlQuery = `SELECT * FROM members WHERE member_id=${memberID};`;
		runDBQuery(sqlQuery, displayMemberDetails);
	} else if (
		(masterSearchTerm.length === 5 &&
			masterSearchTerm[0].toUpperCase() === 'G') ||
		masterSearchTerm[0].toUpperCase() === 'K'
	) {
		sqlQuery =
			'SELECT * FROM books WHERE book_code= "' +
			masterSearchTerm.toUpperCase() +
			'";';
		runDBQuery(sqlQuery, displayBookResult);
	} else {
		sqlQuery =
			'SELECT * FROM books WHERE book_id=' + masterSearchTerm + ';';
		runDBQuery(sqlQuery, displayBookResult);
	}
}

// Member section begins here

/**
 * Query and display member details
 *
 * @param {Array} memberData
 */
function displayMemberDetails(memberData) {
	if (memberData.length === 0) {
		// eslint-disable-next-line no-alert, no-undef
		alert('Member not found. Is that an Athenian?!');
		return;
	}

	const leftColumn = document.querySelector('#left-column');
	const memberDetails = `
    <div id='member-details' class='mb-5'>
      <h2 class='text-2xl font-bold mb-5'>Member Details</h2>
      Member ID: ${memberData[0].member_id} <br />
      Name     : ${memberData[0].name} <br />
      Remarks  : ${memberData[0].remarks} <br />
    </div>`;

	leftColumn.innerHTML = memberDetails;

	const memberBooksQuery =
		'SELECT transactions.doi, transactions.dor, books.book_id, books.title, books.author' +
		' FROM transactions INNER JOIN books ON transactions.book_id=books.book_id WHERE transactions.member_id=' +
		memberData[0].member_id +
		' ORDER BY doi DESC LIMIT 10;';


	runDBQuery(memberBooksQuery, renderMemberBooks);
}

/**
 * Renders the book issue history of a member
 *
 * @param {Array} memberBooks
 */
function renderMemberBooks(memberBooks) {
	const rightColumn = document.querySelector('#right-column');
	const memberBooksTable = document.createElement('table');
	memberBooksTable.classList.add(
		'border',
		'border-solid',
		'border-black',
		'w-full',
		'mt-5'
	);

	const tableHeader = document.createElement('tr');
	tableHeader.classList.add('border', 'border-solid', 'border-black');

	const doiHeader = document.createElement('th');
	doiHeader.innerHTML = 'Issued';
	doiHeader.classList.add(
		'border',
		'border-solid',
		'border-black',
		'p-2',
		'text-center'
	);
	tableHeader.appendChild(doiHeader);

	const dorHeader = document.createElement('th');
	dorHeader.innerHTML = 'Returned';
	dorHeader.classList.add(
		'border',
		'border-solid',
		'border-black',
		'p-2',
		'text-center'
	);
	tableHeader.appendChild(dorHeader);

	const bookCodeHeader = document.createElement('th');
	bookCodeHeader.innerHTML = 'Book Code';
	bookCodeHeader.classList.add(
		'border',
		'border-solid',
		'border-black',
		'p-2',
		'text-center'
	);
	tableHeader.appendChild(bookCodeHeader);

	const titleHeader = document.createElement('th');
	titleHeader.innerHTML = 'Title';
	titleHeader.classList.add(
		'border',
		'border-solid',
		'border-black',
		'p-2',
		'text-center'
	);
	tableHeader.appendChild(titleHeader);

	const authorHeader = document.createElement('th');
	authorHeader.innerHTML = 'Author';
	authorHeader.classList.add(
		'border',
		'border-solid',
		'border-black',
		'p-2',
		'text-center'
	);
	tableHeader.appendChild(authorHeader);

	memberBooksTable.appendChild(tableHeader);

	// add rows to member history table
	memberBooks.forEach((book) => {
		const row = document.createElement('tr');
		row.classList.add('border', 'border-solid', 'border-black');

		showDate(book.doi, row);
		showDate(book.dor, row);

		const bookCode = document.createElement('td');
		bookCode.innerHTML = book.book_id;
		bookCode.classList.add(
			'border',
			'border-solid',
			'border-black',
			'p-2',
			'text-center'
		);
		row.appendChild(bookCode);

		const title = document.createElement('td');
		title.innerHTML = book.title;
		title.classList.add(
			'border',
			'border-solid',
			'border-black',
			'p-2',
			'text-center'
		);
		row.appendChild(title);

		const author = document.createElement('td');
		author.innerHTML = book.author;
		author.classList.add(
			'border',
			'border-solid',
			'border-black',
			'p-2',
			'text-center'
		);
		row.appendChild(author);

		memberBooksTable.appendChild(row);
		rightColumn.innerHTML = '';
		rightColumn.appendChild(memberBooksTable);
	});
}

/**
 * Create a formatted date cell
 * 
 * @param {date} date 
 * @param {node} row 
 */
function showDate(date, row) {
	// Function to format date Cells
	const dateEntry = document.createElement('td');
	dateEntry.innerHTML =
		date === null ? '----' : `${date.toDateString().substring(3)}`;
	dateEntry.classList.add(
		'border',
		'border-solid',
		'border-black',
		'p-2',
		'text-center'
	);
	row.appendChild(dateEntry);
}

/**
 * Get flat number in the format D0703 from member ID
 *
 * @param {number} memberID
 * @return {string} Flat number - eg D0703
 */

function getFlatNumberFromMemberID(memberID) {
	// Converts member ID to wing and flat number. Eg. - D703)
	if (memberID.length !== 5) return;

	const wingNumber = memberID[0];
	const flatNumber = memberID.split('').slice(1).join('');

	switch (wingNumber) {
		case '3':
			return `A${flatNumber}`;

		case '4':
			return `B${flatNumber}`;

		case '5':
			return `C${flatNumber}`;

		case '6':
			return `D${flatNumber}`;

		default:
			return null;
	}
}

/**
 * Convert Wing and flat number to member ID ( number )
 *
 * @param {string} Flat Number
 * @return {number} member ID
 */

function getMemberIDFromFlatNumber(flatNumber) {
	// Converts wing and flat number to member ID. Eg. - D0703 to 60703
	if (flatNumber.length !== 5) return;

	const wingNumber = flatNumber[0].toUpperCase();
	const flatNumberOnly = flatNumber.split('').slice(1).join('');

	switch (wingNumber) {
		case 'A':
			return Number(`3${flatNumberOnly}`);

		case 'B':
			return Number(`4${flatNumberOnly}`);

		case 'C':
			return Number(`5${flatNumberOnly}`);

		case 'D':
			return Number(`6${flatNumberOnly}`);

		default:
			return null;
	}
}
/* ----------------Member Section ends ---------------- */

/* -----------------Books Section begins ----------------- */
/**
 * Parses details of books from raw data received from DB query
 *
 * @param {Array} bookData
 */

function displayBookResult(bookData) {
	if (bookData[0] === undefined) {
		alert( `Whoopsie! Are you sure that\'s the correct code?
				Try adding a new book / member?` );
		masterSearchForm.reset();
		return;
	}
	const leftColumn = document.querySelector('#left-column');
	let booksContent = `
          <div id="book-details" class='mb-5'>
		  <h2 class='text-2xl font-bold mb-5'>Book Details</h2>
		  Book ID  : ${bookData[0].book_id} <br />
		  Book Code: ${bookData[0].book_code} <br />
		  Title    : ${bookData[0].title} <br />
		  Author   : ${bookData[0].author} <br />
          </div>`;
		  
	bookIssueDetails(bookData[0].book_id);

	if (bookData[0].available === 1) {
		booksContent += 'The book is currently available for issue!';

		const issueBook = `
        <div id='issue-book' class="mt-5 " >
          <form id="book-issue-form" action="" target="_top">
            <input type="text" name="issue-flat-number" id="issue-flat-number" placeholder="Flat No." required class="py-2 px-4 border-2 w-6/12" min="30101" max="62704">
            <input type="submit" value="Issue Book" class="group  w-4/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-5">
          </form>
        </div>`;

		booksContent += issueBook;
		leftColumn.innerHTML = booksContent;

		const issueBookForm = document.querySelector('#book-issue-form');
		issueBookForm.addEventListener('submit', issueBookHandler);

		function issueBookHandler(e) {
			e.preventDefault();
			const flatNumber =
				document.querySelector('#issue-flat-number').value;
			const memberID = getMemberIDFromFlatNumber(flatNumber);
			const bookID = bookData[0].book_id;

			if (memberID === null) {
				// eslint-disable-next-line no-undef
				alert('Invalid Flat Number');
				return;
			}

			const updateBookAvailablilityQuery = `UPDATE books
       SET  books.available = 0
       WHERE books.book_id = ${bookID};`;

			runDBQuery(updateBookAvailablilityQuery, () => {
				// eslint-disable-next-line no-console
				console.log('Book availability updated');
			});

			const issueBookQuery = `INSERT INTO transactions (book_id, member_id, doi) VALUES (${bookID}, ${memberID}, NOW());`;

			runDBQuery(issueBookQuery, (result) => {
				if (result === null) {
					// eslint-disable-next-line no-undef
					alert('Could not issue book');
					return;
				}
				// eslint-disable-next-line no-undef
				alert('Book issued successfully');
				const refreshBookStatusQuery = `SELECT * FROM books WHERE book_id = ${bookID};`;
				runDBQuery(refreshBookStatusQuery, displayBookResult);
			});
		}
	} else {
		booksContent += `The book is currently issued and not available <br/><br/>
    <b> Record Return: </b><br/>`;

		const returnForm = `
      <form id='return-book-form' >
        <input type="text" name="member-flat-number" id="member-flat-number" placeholder="Confirm flat no." required class="py-2 px-4 border-2 w-8/12  " min="30101" max="62704">
        <input type="submit" value="Return" class="group  w-3/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-2">
      <form>`;

		booksContent += returnForm;
		leftColumn.innerHTML = booksContent;

		const returnBookForm = document.querySelector('#return-book-form');
		returnBookForm.addEventListener('submit', returnBookHandler);

		/**
		 * Handle return book form submission
		 *
		 * @param {Object} e
		 */
		function returnBookHandler(e) {
			e.preventDefault();
			const submittedFlatNumber =
				returnBookForm.elements['member-flat-number'].value;
			const submittedMemberID = getMemberIDFromFlatNumber(submittedFlatNumber);
			const bookID = bookData[0].book_id;

			const returnBookQuery = `UPDATE books, transactions
      SET books.available = 1, transactions.dor = NOW()
      WHERE books.book_id = ${bookID} AND transactions.book_id = ${bookID} AND transactions.member_id = ${submittedMemberID} AND transactions.dor IS NULL;`;

			runDBQuery(returnBookQuery, (result) => {
				if (result === null) {
					// eslint-disable-next-line no-undef
					alert('Error returning book');
					return;
				}
				// eslint-disable-next-line no-undef
				alert('Book returned successfully');

				const refreshBookStatusQuery = `SELECT * FROM books WHERE book_id = ${bookID};`;
				runDBQuery(refreshBookStatusQuery, displayBookResult);
			});
		}
	}

}

/**
 * Query for book issue history
 *
 * @param {number} bookID
 */

function bookIssueDetails(bookID) {
	const bookHistoryQuery =
		'SELECT transactions.doi, transactions.dor, members.name, members.member_id FROM transactions INNER JOIN members ON transactions.member_id=members.member_id WHERE transactions.book_id=' +
		bookID +
		' ORDER BY transactions.transaction_id DESC LIMIT 10;';

	runDBQuery(bookHistoryQuery, renderBookHistory);
}

/**
 * Renders the book issue history
 *
 * @param {Array} bookHistory
 */

function renderBookHistory(bookHistory) {
	const rightColumn = document.querySelector('#right-column');
	if (bookHistory.length === 0) {
		rightColumn.innerHTML = '<p> The book has no issue history</p>';
		return;
	}

	const bookHistoryTable = document.createElement('table');
	//bookHistoryTable.className = 'table-auto';
	bookHistoryTable.classList.add(
		'border',
		'border-collapse',
		'border-gray-600'
	);
	bookHistoryTable.innerHTML = `
      <thead>
        <tr>
          <th class='border border-gray-600'>Issued on</th>
          <th class='border border-gray-600'>Returned</th>
          <th class='border border-gray-600'>Member - Apartment</th>
        </tr>
      </thead>
    `;

	bookHistory.forEach((record) => {
		const memberName = record.name;
		const memberID = record.member_id.toString();
		const dateOfIssue = record.doi;
		const dateOfReturn = record.dor;

		const row = document.createElement('tr');

		showDate(dateOfIssue, row);
		showDate(dateOfReturn, row);

		const memberDetails = document.createElement('td');
		memberDetails.innerHTML = `${memberName} - ${getFlatNumberFromMemberID(
			memberID
		)}`;
		memberDetails.classList.add(
			'border',
			'border-solid',
			'border-black',
			'p-2',
			'text-center'
		);
		row.appendChild(memberDetails);

		bookHistoryTable.appendChild(row);
	});
	rightColumn.innerHTML = '';
	rightColumn.appendChild(bookHistoryTable);
}

module.getMemberIDFromFlatNumber = getMemberIDFromFlatNumber;