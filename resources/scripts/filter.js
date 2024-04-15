const repositories = [ 'botbuilder-dotnet', 'botbuilder-js', 'botbuilder-python', 'botbuilder-java', 'botbuilder-tools', 'botbuilder-samples', 'botframework-emulator', 'botframework-cli', 'botframework-directlinejs', 'botframework-webchat', 'botframework-composer', 'botframework-components', 'botframework-sdk' ];
// Get filter input
const filter = document.getElementById( 'filter' );
// Add event listener 
filter.addEventListener( 'keyup', filterRows );
async function filterRows () {
  // Get value to filter by
  const value = filter.value.toLowerCase();

  if (value === '') {
    loadButton.click();
  }

  // Loop through table rows
  const rows = document.querySelectorAll( '#data tbody tr.rowSelector' );
  rows.forEach( row => {
    let rowVisible = false;
    const cells = row.querySelectorAll( 'td' );
    cells.forEach( cell => {
      let cellText = '';
      if ( cell.className === 'state' ) {
        cellText = cell.children[ 0 ].value.toLowerCase();
      }
      else cellText = cell.textContent.toLowerCase();

      const valueWords = value.split(' ');
      const cellTextWords = cellText.split(' ');

      // Check if all words in the filter value are present in the cell text
      rowVisible = valueWords.every(word => cellTextWords.some(cellWord => cellWord.includes(word)));

      // Exit the loop if the row is visible
      if (rowVisible) return;
    });

    // Show or hide the row based on whether any cell contains the filter value
    row.style.display = rowVisible ? '' : 'none';
  } );
}