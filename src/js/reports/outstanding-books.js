const { runDBQuery } = require( '../../js/db.js' );
const { getFlatNumberFromMemberID } = require( '../../js/members' );
const { exportCSV } = require( '../../js/utils/csv-export' );

const outstandingBooksTable = document.getElementById( 'outstanding-books-table' );

const exportLink = document.querySelector( '.csv-export' );

// Count of issued books and overdue books
const issuedBooksQuery = `
    SELECT COUNT(*) 
    FROM library.books 
    WHERE books.available = 0;
    `;
runDBQuery( issuedBooksQuery, ( result ) => {
    console.log( result[0]['COUNT(*)'] );
    const issuedBooksCountDiv = document.querySelector( '.issued-books-count' );
    issuedBooksCountDiv.innerHTML = result[0]['COUNT(*)'];

    // Once the first query completes, execute the second query
    const overdueBooksQuery = `
        SELECT COUNT(*)
        FROM library.books
        INNER JOIN library.transactions ON library.books.book_id = library.transactions.book_id
        INNER JOIN library.members ON library.members.member_id = library.transactions.member_id 
        WHERE ISNULL( library.transactions.dor) 
        AND DATEDIFF(CURRENT_DATE(), library.transactions.doi ) > 15;
        `;

    runDBQuery( overdueBooksQuery, ( result ) => {
            const overdueBooksCountDiv = document.querySelector( '.overdue-books-count' );
            overdueBooksCountDiv.innerHTML = result[0]['COUNT(*)'];
        } 
    );
    renderOutstandingBooks( );
} 
);

function renderOutstandingBooks( ){
    const tableBody = document.createElement( 'table' );
    tableBody.classList.add( 'border', 'border-solid', 'border-black', 'w-full', 'mt-5' );

    const tableHeaderRows = [ 'Flat Number', 'Member Name', 'Book Title', 'Book Author', 'Issued on', 'Overdue (days)'];

    tableHeaderRows.forEach( ( headerName ) => {
        const tableHeader = document.createElement( 'th' );
        tableHeader.innerHTML = headerName;
        tableHeader.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );   
        tableBody.appendChild( tableHeader );
    } );

    const outstandingBooksQuery = `
        SELECT 
            library.members.member_id, 
            library.members.name, 
            library.books.title, 
            library.books.author, 
            library.transactions.doi, 
            ( DATEDIFF(CURRENT_DATE(), library.transactions.doi ) - 15 ) AS overdue
        FROM 
            library.books
        INNER JOIN 
            library.transactions 
            ON 
            library.books.book_id = library.transactions.book_id
        INNER JOIN 
            library.members 
            ON 
            library.members.member_id = library.transactions.member_id
        WHERE 
            ISNULL( library.transactions.dor)
            AND 
            DATEDIFF(CURRENT_DATE(), library.transactions.doi ) > 15;
    `;

    const tableData = [];

    runDBQuery( outstandingBooksQuery, ( result ) => {
        result.forEach( ( row ) => {
            const tableRow = document.createElement( 'tr' );
            tableRow.classList.add( 'border', 'border-solid', 'border-black' );

            const flatNumber = document.createElement( 'td' );
            flatNumber.innerHTML = getFlatNumberFromMemberID( row.member_id.toString() );
            flatNumber.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );
            tableRow.appendChild( flatNumber );

            const memberName = document.createElement( 'td' );
            memberName.innerHTML = row.name;
            memberName.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );
            tableRow.appendChild( memberName );

            const bookTitle = document.createElement( 'td' );
            bookTitle.innerHTML = row.title;
            bookTitle.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );
            tableRow.appendChild( bookTitle );

            const bookAuthor = document.createElement( 'td' );
            bookAuthor.innerHTML = row.author;
            bookAuthor.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );
            tableRow.appendChild( bookAuthor );

            const issuedOn = document.createElement( 'td' );
            issuedOn.innerHTML = row.doi.toDateString();
            issuedOn.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );
            tableRow.appendChild( issuedOn );

            const overdue = document.createElement( 'td' );
            overdue.innerHTML = row.overdue;
            overdue.classList.add( 'border', 'border-solid', 'border-black', 'p-2', 'text-center' );
            tableRow.appendChild( overdue );

            tableBody.appendChild( tableRow );
        } );
        tableData.push( result );
    } );

    outstandingBooksTable.appendChild( tableBody );
    exportLink.hidden = false;
    exportLink.addEventListener( 'click', ( ) => {
            exportCSV( tableData[0], tableHeaderRows, 'outstanding-books' );
        }
    );
}
