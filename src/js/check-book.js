var connection = require( './js/db' );

const bookSearchForm = document.querySelector( 'form' );
const resultDiv = document.querySelector( '#resultDiv' );

function getBookId( event ){
  event.preventDefault();
  const bookNum = bookSearchForm.elements[ 'book-id' ].value;

  if( connection.state === 'disconnected' ){
  connection.connect( ( error ) => {
    if( error ) throw error;
    console.log( 'connected' );
  });}
 
  let sqlQuery = "";
  if( bookNum.length === 5 && ( bookNum[0].toUpperCase() === 'G' || bookNum[0].toUpperCase() === 'K' )){
    sqlQuery = 'SELECT * FROM books WHERE book_code= "' + bookNum.toUpperCase() + '";';
    console.log(sqlQuery);
  }
   else sqlQuery = 'SELECT * FROM books WHERE book_id=' + bookNum + '\;';
 

   connection.query( sqlQuery, function ( error, results, fields ) {
     if ( error ) {
       handleError();
       throw error;
     } 
     else displayBookResult( results[0] );
    } );
    
  }
  
function displayBookResult( bookData ) {
    console.log( bookData );
    let booksContent = `
          Book ID  : ${ bookData[ 'book_id' ] } <br />
          Book Code: ${ bookData[ 'book_code' ] } <br />
          Title    : ${ bookData[ "title" ] } <br />
          Author   : ${ bookData[ "author" ] } <br />`;

    if( bookData[ 'available' ] === 1 ) {
      booksContent += 'The book is currently available for issue';

      const issueBook = `
        <div id='issue-book' class="mt-20" >
          <form id="book-issue-form" action="" target="_top">
            <input type="number" name="book-id" id="book-id" required class="py-2 px-4 border-2 w-4/12" min="30000" max="62704">
            <input type="submit" value="Issue Book" class="group  w-2/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-5">
          </form>
        </div>`;

        booksContent += issueBook;
    } else {
      booksContent += ' The book is currently not available';
    }

    resultDiv.innerHTML = booksContent;
  }

function handleError(){
  resultDiv.innerHTML = `<p>Unable to locate book in our records. Please check the ID</p>`;
}

bookSearchForm.addEventListener( 'submit', getBookId );