const repositories = [ 'botbuilder-dotnet', 'botbuilder-js', 'botbuilder-python', 'botbuilder-java', 'botbuilder-tools', 'botbuilder-samples', 'botframework-emulator', 'botframework-cli', 'botframework-directlinejs', 'botframework-webchat', 'botframework-composer', 'botframework-components', 'botframework-sdk' ];
// Get filter input
const filter = document.getElementById( 'filter' );
// Add event listener 
filter.addEventListener( 'keyup', filterRows );


/**
 * Filters the rows in a table based on the value entered in the filter input.
 * 
 * This function is called whenever the 'keyup' event is triggered on the filter input.
 * It loops through all the rows in the table and checks if the text content of each cell
 * contains the filter value. If a row has at least one cell that contains the filter value,
 * the row is displayed, otherwise it is hidden.
 * 
 * If the filter value is empty, the 'loadButton' is clicked to load the full table.
 * @returns {Promise<void>} A promise that resolves once the filtering is complete.
 */
async function filterRows () {
  // Get value to filter by
  const value = filter.value.toLowerCase();

  if (value === '') {
    loadButton.click();
  }

  // Loop through table rows
  const rows = document.querySelectorAll( '#data tbody .rowSelector' );
  rows.forEach( row => {
    const cells = row.querySelectorAll( 'td' );
    cells.forEach( cell => {
      var rowVisible = null;
      let cellText = '';
      if ( cell.className.includes('state') ) {
        cellText = cell.children[ 0 ].value.toLowerCase();
      }
      else cellText = cell.textContent.toLowerCase();
      
      const valueWords = value.split(' ');
      const cellTextWords = cellText.split(' ');
      
      // Check if all words in the filter value are present in the cell text
      // rowVisible = valueWords.every(word => cellTextWords.some(cellWord => cellWord.includes(word)));
      // const visible = valueWords.some(word => cellText.includes(word));
      // Exit the loop if the row is visible
      if (!!valueWords.every(word => cellTextWords.some(cellWord => cellWord.includes(word)))) {
        console.log(!!valueWords.every(word => cellTextWords.some(cellWord => cellWord.includes(word))))
        row.setAttribute('style', 'display: table-cell');
        console.log('ROW VISIBLE 1', rowVisible, row);
      };
      // console.log('CELLS 0 ', cells);
      // Show or hide the row based on whether any cell contains the filter value
      // row.style.display = rowVisible ? '' : 'none';
      // console.log('ROW VISIBLE 2', rowVisible, row);
    });
  
  } );
}