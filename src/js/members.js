const { default: Swal } = require('sweetalert2');
const { getQueryData } = require( './db' );
const { createTableRow } = require( './utils/create-table-row' );

/**
 * Query and display member details
 *
 * @param { Array } memberData
 */

function displayMemberDetails( memberData ) {
    if ( memberData.length === 0 ) {
        Swal.fire( {
            icon: 'error',
            title: 'Member not found',
            text: 'Is that an Athenian?!',
            button: 'OK',
        } );

        return;
    }
   
    const leftColumn = document.querySelector( '#left-column' );
    const memberDetails = `
    <div id='member-details' class='mb-5'>
      <h2 class='text-2xl font-bold mb-5'>Member Details</h2>
      Member ID: ${memberData[0].member_id} <br />
      Name     : ${memberData[0].name} <br />
      Mobile   : ${memberData[0].mobile} <br />
      Remarks  : ${memberData[0].remarks} <br />
    </div>`;

    const issueBook = `
    <div id='issue-book' class="mt-5 " >
        <form id="book-issue-form" action="" target="_top">
            <input type="text" name="issue-book-code" id="issue-book-code" placeholder="Book Code" required class="py-2 px-4 border-2 w-9/12" maxlength="5"><br />
            <input type="submit" value="Issue Book" class="group  w-6/12 justify-center rounded-md border border-transparent bg-indigo-600 py-1 px-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-2">
        </form>
    </div>`;
    leftColumn.innerHTML = memberDetails + issueBook;

    const issueBookForm = document.querySelector( '#book-issue-form' );
    issueBookForm.addEventListener( 'submit', ( event ) => {
        event.preventDefault();
        const bookSearchTerm = document.querySelector( '#issue-book-code' ).value;
        issueMemberBookHandler( event, memberData[0].member_id, bookSearchTerm );
    } );

    renderMemberBooksHistory( memberData[0].member_id );
}

function renderMemberBooksHistory( memberID ) {
    const memberBooksQuery =
        'SELECT transactions.doi, transactions.dor, books.book_id, books.title, books.author' +
        ' FROM transactions INNER JOIN books ON transactions.book_id=books.book_id WHERE transactions.member_id=' +
        memberID +
        ' ORDER BY doi DESC LIMIT 30;';

    getQueryData( memberBooksQuery ).then( ( result ) => {
        renderMemberBooks( result );
    } ).catch( ( err ) => {
        throw err;
    } );
}

function issueMemberBookHandler( event, memberID, bookSearchTerm ) {
	event.preventDefault();

    let bookSearchField = "book_id";

    if( bookSearchTerm.length === 5 && bookSearchTerm[0].toUpperCase() === 'G' || bookSearchTerm[0].toUpperCase() === 'K' ) {
        bookSearchField = "book_code";
    }
    
    const bookAvailabilityQuery = `SELECT * FROM books WHERE ${bookSearchField} = "${bookSearchTerm.toUpperCase()}";`;

    
	async function issueBook() {
        try {
            const bookData = await getQueryData(bookAvailabilityQuery);
        
            if (bookData[0].available === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Book not available',
                    text: 'This book is already issued',
                    button: 'OK',
                });
                return;
            } else {
                const bookTitle = bookData[0].title;
                const bookAuthor = bookData[0].author;
                
                const bookIssueConfirmation = await Swal.fire({
                    icon: 'question',
                    title: 'Confirm book issue',
                    text: `Issue ${bookTitle} by ${bookAuthor}?`,
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No',
                });
                
                if (!bookIssueConfirmation.isConfirmed) {
                    return;
                }
                
                const bookID = bookData[0].book_id;
                const issueBookQuery = `INSERT INTO transactions (book_id, member_id, doi) VALUES (${bookID}, ${memberID}, NOW());`;
                const updateBookAvailablilityQuery = `UPDATE books
                SET  books.available = 0
                WHERE books.book_id = ${bookID};`;
                
                const result1 = await getQueryData(issueBookQuery);
			    const result2 = await getQueryData(updateBookAvailablilityQuery);

			    renderMemberBooksHistory(memberID);

                Swal.fire({
                    icon: 'success',
                    title: 'Book Issued',
                    text: `Book issued successfully`,
                    button: 'OK',
                });
            } 
        } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error issuing book',
                    button: 'OK',
                });
                throw error;
        }
    }	
	issueBook();
}

/**
 * Renders the book issue history of a member
 *
 * @param {Array} memberBooks
 */
function renderMemberBooks( memberBooks ) {
    const memberBooksTableHeaders = [
        'Issued',
        'Returned',
        'Book Code',
        'Title',
        'Author',
    ];

    const rightColumn = document.querySelector( '#right-column' );
    const memberBooksTable = document.createElement( 'table' );
    memberBooksTable.classList.add(
        'border',
        'border-solid',
        'border-black',
        'w-full',
        'mt-5'
    );

    const tableHeader = document.createElement( 'tr' );
    tableHeader.classList.add( 'border', 'border-solid', 'border-black' );
    
    memberBooksTableHeaders.forEach( ( headerName ) => {
        createTableRow( headerName, tableHeader, true );
    } );

    memberBooksTable.appendChild( tableHeader );

    // In member history show issued books first
    const memberIssuedBooks = memberBooks.filter( ( book ) => book.dor === null );  
    const memberReturnedBooks = memberBooks.filter( ( book ) => book.dor !== null );    
    // add rows to member history table
   function addBooksToTable( Books ){ 
        Books.forEach( ( book ) => {
            const row = document.createElement( 'tr' );
            row.classList.add( 'border', 'border-solid', 'border-black' );

            showDate( book.doi, row );
            showDate( book.dor, row );

            const bookColumnNames = [ 'book_id', 'title', 'author' ];
            bookColumnNames.forEach( ( columnName ) => {
                createTableRow( book[columnName], row );
            } );

            memberBooksTable.appendChild( row );
            rightColumn.innerHTML = '';
            rightColumn.appendChild( memberBooksTable );
        } );
    }
    addBooksToTable( memberIssuedBooks );
    addBooksToTable( memberReturnedBooks );
}

/**
 * Create a formatted date cell
 *
 * @param {Date}        date
 * @param {HTMLElement} row
 */
function showDate( date, row ) {
    // Function to format date Cells
    const dateEntry = document.createElement( 'td' );
    dateEntry.innerHTML =
        date === null ? '----' : `${date.toDateString().substring( 3 )}`;
    dateEntry.classList.add(
        'border',
        'border-solid',
        'border-black',
        'p-2',
        'text-center'
    );
    row.appendChild( dateEntry );
}

/**
 * Get flat number in the format D0703 from member ID
 *
 * @param {number} memberID
 * @return {string} Flat number - eg D0703
 */

function getFlatNumberFromMemberID( memberID ) {
    // Converts member ID to wing and flat number. Eg. - D703)
    if ( memberID.length !== 5 ) {
        return;
    }

    const wingNumber = memberID[0];
    const flatNumber = memberID.split( '' ).slice( 1 ).join( '' );

    switch ( wingNumber ) {
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

function getMemberIDFromFlatNumber( flatNumber ) {
    // Converts wing and flat number to member ID. Eg. - D0703 to 60703
    if ( flatNumber.length !== 5 ) {
        return;
    }

    const wingNumber = flatNumber[0].toUpperCase();
    const flatNumberOnly = flatNumber.split( '' ).slice( 1 ).join( '' );

    switch ( wingNumber ) {
        case 'A':
            return Number( `3${flatNumberOnly}` );

        case 'B':
            return Number( `4${flatNumberOnly}` );

        case 'C':
            return Number( `5${flatNumberOnly}` );

        case 'D':
            return Number( `6${flatNumberOnly}` );

        default:
            return null;
    }
}

exports.getMemberIDFromFlatNumber = getMemberIDFromFlatNumber;
exports.getFlatNumberFromMemberID = getFlatNumberFromMemberID;
exports.displayMemberDetails = displayMemberDetails;
exports.showDate = showDate;
