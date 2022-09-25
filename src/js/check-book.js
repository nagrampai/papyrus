var connection = require('./js/db');

const bookSearchForm = document.querySelector('form');

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
 

  const resultDiv = document.querySelector('#resultDiv');
  connection.query(sqlQuery, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    results.forEach( result => {resultDiv.innerHTML = result['title'] + '<br/>';} );
  });
  
}

bookSearchForm.addEventListener('submit', getBookId);