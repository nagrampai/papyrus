var connection = require('./js/db');

const bookSearchForm = document.querySelector('form');
const resultDiv = document.querySelector('#resultDiv');

function getBookId(event){
  event.preventDefault();
  const bookNum = bookSearchForm.elements['book-id'].value;

  if( connection.state === 'disconnected' ){
  connection.connect( (error) => {
    if(error) throw error;
    console.log('connected');
  });}
 
  let sqlQuery = "";
  if( bookNum.length === 5 && (bookNum[0] === 'G' ||bookNum[0] === 'K' )){
    sqlQuery = 'SELECT * FROM books WHERE book_code= "' + bookNum + '";';
  }
   else sqlQuery = 'SELECT * FROM books WHERE book_id=' + bookNum + '\;';
 

   connection.query(sqlQuery, function (error, results, fields) {
     if (error) {
       handleError();
       throw error;
     } 
     else displayBookResult(results[0]);
    });
    
  }
  
function displayBookResult(bookData) {
    console.log( bookData );
    const booksContent = `
          Book ID: ${bookData['book_id']} <br />
          Book Code: ${bookData['book_code']} <br />
          Title: ${bookData["title"]} <br />
          Author: ${bookData["author"]} <br />`;

    resultDiv.innerHTML = booksContent;
  }

function handleError(){
  resultDiv.innerHTML = `<p>Unable to locate book in our records. Please check the ID</p>`;
}

bookSearchForm.addEventListener('submit', getBookId);