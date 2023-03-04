const { runDBQuery } = require( '../js/db.js' );
const {
    displayMemberDetails,
    getMemberIDFromFlatNumber,
} = require( '../js/members' );
const { displayBookResult } = require( '../js/display-books' );

const masterSearchForm = document.querySelector( '#master-search-form' );
masterSearchForm.addEventListener( 'submit', getSearchQueryHandler );

/**
 * Event handler for main search form
 *
 * @param {Object} event
 */

function getSearchQueryHandler( event ) {
    event.preventDefault();
    const masterSearchTerm = masterSearchForm.elements['book-or-member'].value;

    if ( masterSearchTerm.length > 5 ) {
        // eslint-disable-next-line no-alert, no-undef
        alert( 'Please enter a valid book ID or member ID' );
        return;
    }

    // Detect if query is book ID / code or Member flat number
    let sqlQuery = '';
    if (
        // If the query is a member flat number
        masterSearchTerm.length === 5 &&
        ['A', 'B', 'C', 'D'].includes( masterSearchTerm[0].toUpperCase() )
    ) {
        // convert flat number to member ID. eg. D0703 to 60703
        const memberID = getMemberIDFromFlatNumber(
            masterSearchTerm.toUpperCase()
        );
        sqlQuery = `SELECT * FROM members WHERE member_id=${memberID};`;
        runDBQuery( sqlQuery, displayMemberDetails );
    } else if (
        // Check for legacy book ID that starts with G or K.
        ( masterSearchTerm.length === 5 &&
            masterSearchTerm[0].toUpperCase() === 'G' ) ||
        masterSearchTerm[0].toUpperCase() === 'K'
    ) {
        sqlQuery =
            'SELECT * FROM books WHERE book_code= "' +
            masterSearchTerm.toUpperCase() +
            '";';
        runDBQuery( sqlQuery, displayBookResult );
    } else {
        sqlQuery =
            'SELECT * FROM books WHERE book_id=' + masterSearchTerm + ';';
        runDBQuery( sqlQuery, displayBookResult );
    }
}
