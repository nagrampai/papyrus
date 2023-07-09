const { getQueryData } = require( './db' );
const {
    getFlatNumberFromMemberID,
    getMemberIDFromFlatNumber,
    showDate,
} = require( './members' );
const Swal = require( 'sweetalert2' );

const masterSearchForm = document.querySelector( '#master-search-form' );

/**
 * Parses details of books from raw data received from DB query
 *
 * @param {Array} bookData
 */

function displayBookResult( bookData ) {
    console.log( bookData );
    if ( ! bookData[0] ) {
        Swal.fire( {
            icon: 'error',
            title: 'No Book found',
            text: 'Please check the code / ID and try again',
            button: 'OK',
        } );

        masterSearchForm.reset();
        return;
    }
    const leftColumn = document.querySelector( '#left-column' );
    let booksContent = `
          <div id="book-details" class='mb-5'>
				<h2 class='text-2xl font-bold mb-5'>Book Details</h2>
				Book ID  : ${bookData[0].book_id} <br />
				Book Code: ${bookData[0].book_code} <br />
				Title    : ${bookData[0].title} <br />
				Author   : ${bookData[0].author} <br />
          </div>`;

    bookIssueDetails( bookData[0].book_id );

    if ( bookData[0].available === 1 ) {
        booksContent += 'The book is currently available for issue!';

        const issueBook = `
        <div id='issue-book' class="mt-5 " >
          <form id="book-issue-form" action="" target="_top">
            <input type="text" name="issue-flat-number" id="issue-flat-number" placeholder="Flat No." required class="py-2 px-4 border-2 w-6/12" min="30101" max="62704" maxlength="5">
            <input type="submit" value="Issue Book" class="group  w-4/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-5">
          </form>
        </div>`;

        booksContent += issueBook;
        leftColumn.innerHTML = booksContent;

        const issueBookForm = document.querySelector( '#book-issue-form' );
        issueBookForm.addEventListener( 'submit', issueBookHandler );

        function issueBookHandler( e ) {
            e.preventDefault();
            const flatNumber =
                document.querySelector( '#issue-flat-number' ).value;
            const memberID = getMemberIDFromFlatNumber( flatNumber );
            const bookID = bookData[0].book_id;

            if ( memberID === null ) {
                Swal.fire( {
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Invalid Flat Number',
                    button: 'OK',
                } );
                return;
            }

            const issueBookQuery = `INSERT INTO transactions (book_id, member_id, doi) VALUES (${bookID}, ${memberID}, NOW());`;
            const updateBookAvailablilityQuery = `UPDATE books
                SET  books.available = 0
                WHERE books.book_id = ${bookID};`;
            const refreshBookStatusQuery = `SELECT * FROM books WHERE book_id = ${bookID};`;
            
            async function issueBook() {
                try {
                        const result1 = await getQueryData(issueBookQuery);
                        console.log(result1);
                    
                        const result2 = await getQueryData(updateBookAvailablilityQuery);
                        console.log(result2);
                    
                        const result3 = await getQueryData(refreshBookStatusQuery);
                        console.log(result3);
                
                        displayBookResult(result3);
                        Swal.fire({
                            icon: 'success',
                            title: 'Book Issued',
                            text: `Book issued to ${flatNumber.toUpperCase()}`,
                            button: 'OK',
                        });
                } catch (error) {
                    console.log(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Could not issue book',
                        text: 'Please recheck the flat number (Alphabet + 4 digits), or if the member exists in Papyrus.',
                        button: 'OK',
                    });
                    throw error;    
                }
              }
              issueBook();
        }

    } else {
        booksContent += `The book is currently issued and not available <br/><br/>
        <button id="return-book" type="submit" value="Return" class="group  w-9/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-2">Return Book</button>
    <br/>`;

        leftColumn.innerHTML = booksContent;

        const returnBookButton = document.querySelector( '#return-book' );
        returnBookButton.addEventListener( 'click', ( event ) => {
            returnBookHandler( event, bookData[0].book_id );
        } ); 
    }
}

/**
         * Handle return book form submission
        *
        * @param {Object} e
        */
function returnBookHandler( e, bookID ) {
    e.preventDefault();
    const returnBookQuery = `UPDATE books, transactions
    SET books.available = 1, transactions.dor = NOW()
    WHERE books.book_id = ${bookID} AND transactions.book_id = ${bookID};`;
    const refreshBookStatusQuery = `SELECT * FROM books WHERE book_id = ${bookID};`;
    
     async function returnBook() {
         try {
             const result1 = await getQueryData(returnBookQuery);
         
             const result2 = await getQueryData(refreshBookStatusQuery)
         
             displayBookResult(result2);
             Swal.fire({
                 icon: 'success',
                 title: 'Book Returned',
                 text: 'Book returned successfully',
                 button: 'OK',
             });
         } catch (error) {
             Swal.fire({
                 icon: 'error',
                 title: 'Oops...',
                 text: 'Could not return book',
                 button: 'OK',
             });
             throw error;    
         }
     }
     returnBook();
 }


/**
 * Query for book issue history
 *
 * @param {number} bookID
 */

function bookIssueDetails( bookID ) {
    const bookHistoryQuery =
        'SELECT transactions.doi, transactions.dor, members.name, members.member_id FROM transactions INNER JOIN members ON transactions.member_id=members.member_id WHERE transactions.book_id=' +
        bookID +
        ' ORDER BY transactions.transaction_id DESC LIMIT 20;';

    getQueryData( bookHistoryQuery ).then( ( result ) => {
        renderBookHistory( result );
    } ).catch( ( err ) => {
        throw err;
    } );
}

/**
 * Renders the book issue history
 *
 * @param {Array} bookHistory
 */

function renderBookHistory( bookHistory ) {
    const rightColumn = document.querySelector( '#right-column' );
    if ( bookHistory.length === 0 ) {
        rightColumn.innerHTML = '<p> The book has no issue history</p>';
        return;
    }

    const bookHistoryTable = document.createElement( 'table' );
    
    bookHistoryTable.classList.add(
        'border',
        'border-collapse',
        'border-gray-600',
        'mt-5',
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

    
    bookHistory.forEach( ( record ) => {
        const memberName = record.name;
        const memberID = record.member_id.toString();
        const dateOfIssue = record.doi;
        const dateOfReturn = record.dor;

        const row = document.createElement( 'tr' );

        showDate( dateOfIssue, row );
        showDate( dateOfReturn, row );

        const memberDetails = document.createElement( 'td' );
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
        row.appendChild( memberDetails );

        bookHistoryTable.appendChild( row );
    } );
    rightColumn.innerHTML = '';
    rightColumn.appendChild( bookHistoryTable );
}

exports.displayBookResult = displayBookResult;
