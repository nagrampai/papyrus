var { connection, getQueryData, startConnection } = require( './js/db' );

const bookSearchForm = document.querySelector( 'form' );
const leftColumn = document.querySelector( '#left-column' );
const rightColumn = document.querySelector( '#right-column' );

function getBookId( event ){
  event.preventDefault();
  const bookNum = bookSearchForm.elements[ 'book-id' ].value;
  
  startConnection();
  
  // Fetch book details either by Book code or Book ID. 
  let sqlQuery = "";
  if( bookNum.length === 5 && ( bookNum[0].toUpperCase() === 'G' || bookNum[0].toUpperCase() === 'K' )){
    sqlQuery = 'SELECT * FROM books WHERE book_code= "' + bookNum.toUpperCase() + '";';
  }
  else sqlQuery = 'SELECT * FROM books WHERE book_id=' + bookNum + '\;';
  
  getQueryData(sqlQuery)
    .then((results) => {
      displayBookResult(results[0]);
    })
    .catch((err) =>
      setImmediate(() => {
        handleError();
        throw err;
      })
    );
    
    
  }
  
  function displayBookResult( bookData ) {
    
    let booksContent = `
          <h2 class='text-2xl font-bold mb-5'>Book Details</h2>
          <div id="book-details" class='mb-5'>
            Book ID  : ${bookData["book_id"]} <br />
            Book Code: ${bookData["book_code"]} <br />
            Title    : ${bookData["title"]} <br />
            Author   : ${bookData["author"]} <br />
          </div>`;

    if( bookData[ 'available' ] === 1 ) {
      booksContent += 'The book is currently available for issue';

      const issueBook = `
        <div id='issue-book' class="mt-20 " >
          <form id="book-issue-form" action="" target="_top">
            <input type="number" name="book-id" id="book-id" required class="py-2 px-4 border-2 w-4/12" min="30000" max="62704">
            <input type="submit" value="Issue Book" class="group  w-2/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-5">
          </form>
        </div>`;

        booksContent += issueBook;
    } else {
      booksContent += ' The book is currently not available';
    }

    leftColumn.innerHTML = booksContent;
   bookIssueDetails( bookData["book_id"] );
  }

function handleError() {
  leftColumn.innerHTML = `<p>Unable to locate book in our records. Please check the ID</p>`;
}

bookSearchForm.addEventListener( 'submit', getBookId );

function bookIssueDetails( bookID ) {
  console.log(bookID);
  const bookIssueQuery = 'SELECT transactions.doi, transactions.dor, members.name, members.member_id FROM transactions INNER JOIN members ON transactions.member_id=members.member_id WHERE transactions.book_id=' + bookID + ' ORDER BY doi DESC LIMIT 10;';

  console.log( bookIssueQuery );

 getQueryData(bookIssueQuery)
    .then((results) => {
      renderBookHistory(results);
    })
    .catch((err) =>
      setImmediate(() => {
        handleError();
        throw err;
      })
    );

    function renderBookHistory( bookHistory ) {

      if ( bookHistory.length === 0 ) {
        rightColumn.innerHTML = '';
        return;
      }
      
      const bookHistoryContent = document.createElement('table');
      bookHistoryContent.className = 'table-auto';
      bookHistoryContent.innerHTML = `
        <thead>
          <tr>
            <th>Issued on</th>
            <th>Returned</th>
            <th>Member - Apartment</th>
          </tr>
        </thead>
      `;

      bookHistory.forEach( ( record ) => {
        console.log( record );
        const row = document.createElement('tr');
        
        const doi = document.createElement('td');
        doi.innerHTML = record[ 'doi' ] === null ? '----' : `${record[ 'doi' ].toDateString().substring(3)}`;
        row.appendChild( doi );

        const dor = document.createElement('td');
        dor.innerHTML =  record[ 'dor' ] === null ? '----' : `${record[ 'dor' ].toDateString().substring(3)}`;
        row.appendChild( dor );

        const memberDetails = document.createElement('td');
        memberDetails.innerHTML = `${record["name"]} - ${record["member_id"]}`;
        row.appendChild( memberDetails );

        bookHistoryContent.appendChild(row);
      });
      rightColumn.innerHTML = '';
      rightColumn.appendChild(bookHistoryContent);
    }
}