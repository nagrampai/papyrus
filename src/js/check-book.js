var { connection, getQueryData, startConnection, runDBQuery } = require("./js/db");

const masterSearchForm = document.querySelector("#master-search-form");
const leftColumn = document.querySelector("#left-column");
const rightColumn = document.querySelector("#right-column");

function getSearchQuery(event) {
  event.preventDefault();
  const searchQuery = masterSearchForm.elements["book-or-member"].value;

  startConnection();

  // Detect if query is book ID / code or Member flat number
  let sqlQuery = "";
  if( // If the query is a member flat number
      searchQuery.length === 5 &&
      ['A','B','C','D'].includes( searchQuery[0].toUpperCase() )
    ){
      // convert flat number to member ID. eg. D0703 to 60703
      const memberID = convertFlatToMemberID( searchQuery.toUpperCase );

  } else if (
   searchQuery.length === 5 &&
     searchQuery[0].toUpperCase() === "G" || searchQuery[0].toUpperCase() === "K"
     )
   {
     sqlQuery =
       'SELECT * FROM books WHERE book_code= "' +
       searchQuery.toUpperCase() +
       '";';
    runDBQuery( sqlQuery, displayBookResult );
   } else {
    sqlQuery = "SELECT * FROM books WHERE book_id=" + searchQuery + ";"
    runDBQuery( sqlQuery, displayBookResult );
  };
}

masterSearchForm.addEventListener( "submit", getSearchQuery );

function getFlatNumberFromMemberID(memberID) {// Converts member ID to wing and flat number. Eg. - D703)
  if (memberID.length !== 5) return;

  const wingNumber = memberID[0];
  const flatNumber = memberID.split("").slice(1).join("");

  switch (wingNumber) {
    case "3":
      return `A${flatNumber}`;

    case "4":
      return `B${flatNumber}`;

    case "5":
      return `C${flatNumber}`;

    case "6":
      return `D${flatNumber}`;

    default:
      return;
  }
}

function displayBookResult(bookData) {
  console.log(bookData);
  const leftColumn = document.querySelector("#left-column");
  let booksContent = `
          <div id="book-details" class='mb-5'>
            <h2 class='text-2xl font-bold mb-5'>Book Details</h2>
            Book ID  : ${bookData[0]["book_id"]} <br />
            Book Code: ${bookData[0]["book_code"]} <br />
            Title    : ${bookData[0]["title"]} <br />
            Author   : ${bookData[0]["author"]} <br />
          </div>`;

  if (bookData[0]["available"] === 1) {
    booksContent += "The book is currently available for issue!";

    const issueBook = `
        <div id='issue-book' class="mt-20 " >
          <form id="book-issue-form" action="" target="_top">
            <input type="number" name="book-id" id="book-id" required class="py-2 px-4 border-2 w-6/12" min="30101" max="62704">
            <input type="submit" value="Issue Book" class="group  w-4/12 justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ml-5">
          </form>
        </div>`;

    booksContent += issueBook;
    leftColumn.innerHTML = booksContent;
  } else {
    booksContent += " The book is currently issued and not available";
    leftColumn.innerHTML = booksContent;
  }

  bookIssueDetails(bookData[0]["book_id"]);
}

function bookIssueDetails(bookID) {
  console.log(bookID);
  const bookHistoryQuery =
    "SELECT transactions.doi, transactions.dor, members.name, members.member_id FROM transactions INNER JOIN members ON transactions.member_id=members.member_id WHERE transactions.book_id=" +
    bookID +
    " ORDER BY doi DESC LIMIT 10;";

  console.log(bookHistoryQuery);

  runDBQuery( bookHistoryQuery, renderBookHistory );

}

function renderBookHistory(bookHistory) {
  const rightColumn = document.querySelector("#right-column");
  if (bookHistory.length === 0) {
    rightColumn.innerHTML = "<p> The book has no issue history</p>";
    return;
  }

  const bookHistoryTable = document.createElement("table");
  //bookHistoryTable.className = 'table-auto';
  bookHistoryTable.classList.add(
    "border",
    "border-collapse",
    "border-gray-600"
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

  bookHistory.forEach((record) => {
    const memberName = record["name"];
    const memberID = record["member_id"].toString();
    const dateOfIssue = record["doi"];
    const dateOfReturn = record["dor"];

    const row = document.createElement("tr");

    function showDate( date ) { // Function to format date Cells
      const dateEntry = document.createElement("td");
      dateEntry.innerHTML =
        date === null
          ? "----"
          : `${date.toDateString().substring(3)}`;
      dateEntry.classList.add(
        "border",
        "border-solid",
        "border-red-600",
        "p-2",
        "text-center"
      );
      row.appendChild(dateEntry);
    }

    showDate( dateOfIssue );
    showDate( dateOfReturn );

    const memberDetails = document.createElement("td");
    memberDetails.innerHTML = `${memberName} - ${getFlatNumberFromMemberID( memberID )}`;
    memberDetails.classList.add(
      "border",
      "border-solid",
      "border-red-600",
      "p-2",
      "text-center"
    );
    row.appendChild(memberDetails);

    bookHistoryTable.appendChild(row);
  });
  rightColumn.innerHTML = "";
  rightColumn.appendChild(bookHistoryTable);
}
