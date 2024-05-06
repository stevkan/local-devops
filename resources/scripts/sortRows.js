/**
 * Compares two rows in a table based on the specified column and sorting order.
 *
 * @param {string} column - The name of the column to sort by.
 * @param {number} columnIndex - The index of the column to sort by.
 * @param {HTMLElement} rowA - The first row to compare.
 * @param {HTMLElement} rowB - The second row to compare.
 * @param {HTMLElement} cell - The table cell containing the sorting order.
 * @returns {number} - A negative value if rowA should come before rowB, a positive value if rowA should come after rowB, or zero if they are equal.
 */
const sortRows = ( column, columnIndex, rowA, rowB, cell ) => {
  let result;
  if ( columnIndex === 0 ) {
    var keyA1 = rowA.children[ columnIndex ].children[ 0 ].id.replace( ' ', '-' ).toLowerCase();
    var keyB1 = rowB.children[ columnIndex ].children[ 0 ].id.replace( ' ', '-' ).toLowerCase();
  }
  else {
    var keyA1 = rowA.children[ columnIndex ].textContent.toUpperCase();
    var keyB1 = rowB.children[ columnIndex ].textContent.toUpperCase();
  }
  
  if (columnIndex === 1 || columnIndex === 2) {
    if ( cell.dataset.order === 'asc' ) {
      result = keyA1.localeCompare( keyB1, undefined, { numeric: true } );
    }
    if ( cell.dataset.order === 'desc' ) {
      result = keyB1.localeCompare( keyA1, undefined, { numeric: true } );
    }
    return result;
  }
  else {
    if ( cell.dataset.order === 'asc' ) {
      result = keyA1.localeCompare( keyB1, undefined, { numeric: false } );
    }
    if ( cell.dataset.order === 'desc' ) {
      result = keyB1.localeCompare( keyA1, undefined, { numeric: false } );
    }
    return result;
  }
};