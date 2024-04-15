const sortRows = ( column, columnIndex, rowA, rowB, cell ) => {
  let result;
  // if ( column.className === 'col-1' ) {
  if ( columnIndex === 0 ) {
    var keyA1 = rowA.children[ columnIndex ].children[ 0 ].id.replace( ' ', '-' ).toLowerCase();
    var keyB1 = rowB.children[ columnIndex ].children[ 0 ].id.replace( ' ', '-' ).toLowerCase();
  }
  else {
    var keyA1 = rowA.children[ columnIndex ].textContent.toUpperCase();
    var keyB1 = rowB.children[ columnIndex ].textContent.toUpperCase();
  }
  if ( cell.dataset.order === 'asc' ) {
    result = keyA1.localeCompare( keyB1, undefined, { numeric: false } );
  }
  if ( cell.dataset.order === 'desc' ) {
    result = keyB1.localeCompare( keyA1, undefined, { numeric: false } );
  }
  return result;
};