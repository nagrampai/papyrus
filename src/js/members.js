const { runDBQuery } = require( './db' );
const { createTableRow } = require( './utils/create-table-row' );

/**
 * Query and display member details
 *
 * @param { Array } memberData
 */

function displayMemberDetails( memberData ) {
    if ( memberData.length === 0 ) {
        // eslint-disable-next-line no-alert, no-undef
        alert( 'Member not found. Is that an Athenian?!' );
        return;
    }

    const leftColumn = document.querySelector( '#left-column' );
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

    runDBQuery( memberBooksQuery, renderMemberBooks );
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

    // add rows to member history table
    memberBooks.forEach( ( book ) => {
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
