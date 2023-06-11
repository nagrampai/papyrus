const { runDBQuery } = require( '../../js/db.js' );
const { getFlatNumberFromMemberID } = require( '../../js/members' );
const { exportCSV } = require( '../../js/utils/csv-export' );
const { createTableRow } = require( '../../js/utils/create-table-row' );

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

    const tableHeaderRows = [ 'Flat Number', 'Member Name', 'Book Title', 'Book Author', 'Book ID', 'Issued on', 'Overdue (days)'];

    tableHeaderRows.forEach( ( headerName ) => {
        createTableRow( headerName, tableBody, true );   
    } );

    const outstandingBooksQuery = `
        SELECT 
            library.members.member_id, 
            library.members.name, 
            library.books.title, 
            library.books.author, 
            library.books.book_id,
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

            //convert every field to string with required value
            row[ 'member_id' ] = getFlatNumberFromMemberID( row[ 'member_id' ].toString() );
            row[ 'doi' ] = row[ 'doi' ] === null ? '----' : `${ row[ 'doi' ].toDateString().substring( 3 )}`;

            const outstandingBookFields = [ 'member_id', 'name', 'title', 'author', 'book_id', 'doi', 'overdue' ];

            outstandingBookFields.forEach( ( field ) => {
                createTableRow( row[ field ], tableRow, false );
            } );

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
