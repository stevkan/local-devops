const resetOrderButton = document.getElementById( 'resetOrder' );

function reorderTableRows(tdSortedArray, selectSortedArray) {
  const tableBody = table.querySelector('tbody');
  const rows = Array.from(tableBody.querySelectorAll('tr.rowSelector'));

  // Sort the rows alphanumerically by .col-4 value
  rows.sort((a, b) => {
    if (a.querySelector('.col-4') !== null) {
      const aCol4Value = tdSortedArray.indexOf(a.querySelector('.col-4').textContent);
      const bCol4Value = tdSortedArray.indexOf(b.querySelector('.col-4').textContent);
      return aCol4Value - bCol4Value;
    }
  });

  // Group the rows by the .col-4 value
  const groupedRows = rows.reduce((acc, row) => {
    if (row.querySelector('.col-4') !== null) {
      const col4Value = row.querySelector('.col-4').textContent;
      if (!acc[col4Value]) {
        acc[col4Value] = [];
      }
      acc[col4Value].push(row);
    }
    return acc;
  }, {});

  // Sort each group by the .col-1 (ID) value in descending order
  Object.values(groupedRows).forEach(group => {
    group.sort((a, b) => {
      // Use if secondary columns numbers and are not select fields
      const aValue = parseInt(a.querySelector('.col-2').innerText, 10);
      const bValue = parseInt(b.querySelector('.col-2').innerText, 10);
      
      // // Use if secondary columns are select fields
      // if (a.querySelector('.col-1 select') !== null) {
      //   const aValue = selectSortedArray.indexOf(a.querySelector('.col-1 select').value);
      //   const bValue = selectSortedArray.indexOf(b.querySelector('.col-1 select').value);
      // }
        return aValue - bValue; // Descending order
    });
  });

  // Clear the table body
  tableBody.innerHTML = '';

  // Append the sorted rows to the table body
  Object.values(groupedRows)
    .flatMap(group => group)
    .forEach(row => tableBody.appendChild(row));
}

const alphanumericCompare = (a, b) => {
  const aA = a.replace(/[^a-zA-Z]/g, "");
  const bA = b.replace(/[^a-zA-Z]/g, "");

  if (aA === bA) {
    const aN = parseInt(a.replace(/[^0-9]/g, ""), 10);
    const bN = parseInt(b.replace(/[^0-9]/g, ""), 10);

    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA > bA ? 1 : -1;
  }
};

const alphanumericSort = (a, b) => {
  const reA = /[^a-zA-Z]/g;
  const reN = /[^0-9]/g;

  const aA = a.replace(reA, "");
  const bA = b.replace(reA, "");

  // Check if either string starts with 'i'
  const aStartsWithI = aA.startsWith('IcM');
  const bStartsWithI = bA.startsWith('IcM');

  // If both start with 'i', sort them alphanumerically
  if (aStartsWithI && bStartsWithI) {
    return alphanumericCompare(a, b);
  }
  // If 'a' starts with 'i', put it before 'b'
  else if (aStartsWithI) {
    return -1;
  }
  // If 'b' starts with 'i', put it before 'a'
  else if (bStartsWithI) {
    return 1;
  }
  // If neither starts with 'i', sort them alphanumerically
  else {
    return alphanumericCompare(a, b);
  }
};

const setDefaultOrder = () => {
  const primaryCol = document.querySelectorAll('.rowSelector .col-4');
  const primaryColValues = [];
  primaryCol.forEach(val => primaryColValues.push(val.innerText));

  const secondaryCol = document.querySelectorAll('.rowSelector .col-2');
  const secondaryColValues = [];
  secondaryCol.forEach(val => secondaryColValues.push(val.innerText));

  // // Use if column has select fields
  // const secondaryCol = document.querySelectorAll('.rowSelector .col-1 select');
  // const secondaryCoValues = [];
  // secondaryCol.forEach(select => secondaryCoValues.push(select.value));

  primaryColValues.sort(alphanumericSort);
  secondaryColValues.sort(alphanumericSort);
  reorderTableRows(primaryColValues, secondaryColValues);
};

const loadButton = document.getElementById( 'loadButton' );
loadButton.addEventListener( 'click', async (forceDone) => {
  console.log('FORCE DONE ', SettingsModal.showDone, forceDone.returnValue)
  if (forceDone.returnValue === true) {
    SettingsModal.showDone = forceDone.returnValue;
  }
  console.log('SHOW DONE ', SettingsModal.showDone)
  await openFileBrowser()
    .then( ( res ) => {
      const interval = setInterval( async () => {
        const input = localStorage.getItem( 'filepath' );
        if ( input !== null ) {
          const response = await getData();
          if (response.status === 204) {
            alert( response.statusText );
            clearInterval( interval );
            return;
          }
          if (response.status >= 400 && response.status < 599) {
            if (response.status === 400) {
              alert( 'The file you selected is not a CSV file.' );
            } else if (response.status === 404) {
              alert( 'The file you selected does not exist.' );
            } else {
              alert( response.statusText );
            }
            clearInterval( interval );
            return;
          }
          const data = await response.json();
          lastOpenedFile = data ? new File( [ data ], 'DevOpsIssues.csv', { type: 'text/csv' } ) : null;
          openLastFile();
          clearInterval( interval );
        }
      }, 100 );
    } );
} );

// const saveButton = document.querySelector( '#saveButton' );
// saveButton.addEventListener('click', () => {
//   setTimeout(async () => {
//     await loadButton.click();
//   }, 500);
// });

const mergeModal = document.getElementById( 'mergeModal' );
const openImportCsvBtn = document.getElementById( 'openImportCsvBtn' );
const closeMergeModal = document.getElementById( 'closeMergeModal' );
const mergeIframeContainer = document.getElementById( 'mergeIframeContainer' );

openImportCsvBtn.addEventListener( 'click', () => {
  mergeModal.style.display = 'flex';
  const iframe = document.createElement( 'iframe' );
  iframe.id = 'mergeModalIframe';
  iframe.src = 'mergeModal.html'; // Replace with the desired URL
  iframe.style.width = '100%';
  iframe.style.height = '100%'; // Adjust the height as needed
  mergeIframeContainer.appendChild( iframe );
} );

closeMergeModal.addEventListener( 'click', () => {
  const iframe = document.getElementById( 'mergeModalIframe' );
  mergeModal.style.display = 'none';
  mergeIframeContainer.removeChild( iframe );
} );

const settingsModal = document.getElementById( 'settingsModal' );
const openSettingsBtn = document.getElementById( 'openSettingsBtn' );
const closeSettingsModal = document.getElementById( 'closeSettingsModal' );
const settingsIframeContainer = document.getElementById( 'settingsIframeContainer' );

openSettingsBtn.addEventListener( 'click', () => {
  settingsModal.style.display = 'flex';
  const iframe = document.createElement( 'iframe' );
  iframe.id = 'settingsModalIframe';
  iframe.src = 'settingsModal.html'; // Replace with the desired URL
  iframe.style.width = '100%';
  iframe.style.height = '100%'; // Adjust the height as needed
  settingsIframeContainer.appendChild( iframe );
} );

closeSettingsModal.addEventListener( 'click', () => {
  const iframe = document.getElementById( 'settingsModalIframe' );
  settingsModal.style.display = 'none';
  settingsIframeContainer.removeChild( iframe );
} );

function toggleComfySetting () {
  isComfy = !isComfy;
  localStorage.setItem( 'comfyMode', isComfy );

  const headerCells = document.querySelectorAll( '#data th' );
  const bodyCells = document.querySelectorAll( '#data td' );
  if ( isComfy ) {
    headerCells.forEach( cell => {
      cell.classList.add( 'comfy-mode' );
    } );
    bodyCells.forEach( cell => {
      cell.classList.add( 'comfy-mode' );
    } );
  } else {
    headerCells.forEach( cell => {
      cell.classList.remove( 'comfy-mode' );
    } );
    bodyCells.forEach( cell => {
      cell.classList.remove( 'comfy-mode' );
    } );
  }
}

const themes = [ 'lightTheme.css', 'darkTheme.css' ];
function toggleThemeSetting (button) {
  themeIndex++;
  const nextTheme = themes[ themeIndex - 1 ];
  const currentThemeIndex = themes.findIndex( theme => theme === nextTheme );
  themes.keys();
  localStorage.setItem( 'themeIndex', currentThemeIndex );
  const link = document.createElement( 'link' );
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = `./resources/css/${ nextTheme }`; // Path to your CSS file

  document.head.appendChild( link );
  if ( themeIndex > 1 ) {
    themeIndex = 0;
  }
  // console.log('THEME BUTTON ', button);
  // button.textContent = currentThemeIndex === 0? 'Enable Light Theme' : 'Enable Dark Theme';
}

function toggleDoneSetting(button, row) {
  button.textContent = row.style.display === 'none' ? 'Disable' : 'Enable';
};