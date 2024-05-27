const resetOrderButton = document.getElementById( 'resetOrder' );

/**
 * Reorders the table rows based on the provided sorting arrays.
 *
 * @param {Array} tdSortedArray - The array used to sort the rows by .col-4 value.
 * @param {Array} selectSortedArray - The array used to sort the rows by .col-1 select value.
 */
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
    .forEach(row => {
      tableBody.appendChild(row)
    });
}

/**
 * Compares two strings in an alphanumeric manner.
 *
 * @param {string} a - The first string to compare.
 * @param {string} b - The second string to compare.
 * @returns {number} - Returns 0 if the strings are equal, 1 if `a` is greater than `b`, and -1 if `a` is less than `b`.
 */
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

/**
 * Sorts an array of strings alphanumerically, with special handling for strings starting with 'IcM'.
 *
 * @param {string} a - The first string to compare.
 * @param {string} b - The second string to compare.
 * @returns {number} - A negative number if `a` should be sorted before `b`, a positive number if `b` should be sorted before `a`, or 0 if they are equal.
 */
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

/**
 * Sets the default order of the table rows by sorting the values in the primary and secondary columns.
 * 
 * This function first selects all the elements with the class 'rowSelector .col-4' and 'rowSelector .col-6',
 * which represent the primary and secondary columns respectively. It then extracts the text content of these
 * elements and stores them in separate arrays.
 * 
 * The arrays are then sorted using the `alphanumericSort` function, which sorts the values in a natural order
 * (e.g. 'item1', 'item2', 'item10'). Finally, the `reorderTableRows` function is called with the sorted
 * primary and secondary column values to reorder the table rows accordingly.
 */
const setDefaultOrder = () => {
  const primaryCol = document.querySelectorAll('.rowSelector .col-4');
  const primaryColValues = [];
  primaryCol.forEach(val => primaryColValues.push(val.innerText));

  const secondaryCol = document.querySelectorAll('.rowSelector .col-6');
  const secondaryColValues = [];
  secondaryCol.forEach(val => secondaryColValues.push(val.innerText));

  primaryColValues.sort(alphanumericSort);
  secondaryColValues.sort(alphanumericSort);
  reorderTableRows(primaryColValues, secondaryColValues);
};

const loadButton = document.getElementById( 'loadButton' );

/**
 * Handles the click event of the load button, which opens a file browser and loads the selected CSV file.
 * 
 * This function first checks if the `forceDone` parameter is set to `true`, and if so, updates the `SettingsModal.showDone` flag accordingly.
 * It then calls the `openFileBrowser()` function to open the file browser, and sets up an interval to check the local storage for the selected file path.
 * Once a file path is found, it calls the `getData()` function to fetch the data from the selected file, and then calls the `openLastFile()` function to open the last opened file.
 * If there are any errors during the file loading process, appropriate error messages are displayed to the user.
 */
loadButton.addEventListener( 'click', async (forceDone) => {
  console.log('FORCE DONE ', SettingsModal.showDone, forceDone.returnValue)
  if (forceDone.returnValue === true) {
    SettingsModal.showDone = forceDone.returnValue;
  }
  console.log('SHOW DONE ', SettingsModal.showDone)
  await openFileBrowser()
    .then( ( res ) => {
      /**
       * This code sets up an interval that checks for a 'filepath' value in localStorage every 100 milliseconds.
       * If a 'filepath' value is found, it fetches data from the server and processes the response.
       * If the response is successful, it creates a new File object with the fetched data and calls the `openLastFile()` function.
       * If the response indicates an error, it displays an appropriate alert message. The interval is cleared once the file data has been processed.
       */
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
              console.error( 'The file you selected does not exist.' );
            } else {
              alert( response.statusText );
            }
            clearInterval( interval );
            return;
          }
          const data = await response.json();
          lastOpenedFile = data ? new File( [ data ], 'IssuesDb.csv', { type: 'text/csv' } ) : null;
          openLastFile();
          clearInterval( interval );
        }
      }, 100 );
    } );
} );

const mergeModal = document.getElementById( 'mergeModal' );
const openImportCsvBtn = document.getElementById( 'openImportCsvBtn' );
const closeMergeModal = document.getElementById( 'closeMergeModal' );
const mergeIframeContainer = document.getElementById( 'mergeIframeContainer' );

/**
 * Opens the merge modal and creates an iframe to display the merge modal content.
 * The merge modal is displayed when the user clicks the 'openImportCsvBtn' element.
 * The iframe is added to the 'mergeIframeContainer' element.
 */
openImportCsvBtn.addEventListener( 'click', () => {
  mergeModal.style.display = 'flex';
  const iframe = document.createElement( 'iframe' );
  iframe.id = 'mergeModalIframe';
  iframe.src = 'mergeModal.html'; // Replace with the desired URL
  iframe.style.width = '100%';
  iframe.style.height = '100%'; // Adjust the height as needed
  mergeIframeContainer.appendChild( iframe );
  // const theme = localStorage.getItem( 'theme' );
  // const link = document.createElement( 'link' );
  // link.rel = 'stylesheet';
  // link.type = 'text/css';
  // link.href = `./resources/css/${ theme }`; // Path to your CSS file
} );

// mergeIframeContainer.onload = () => {
//   const mergeButton = window.parent.document.querySelector('#mergeModal #mergeModalIframe').contentDocument.querySelector('#mergeButton');
//   console.log(mergeButton);
//   mergeButton.addEventListener('click', MergeModal.mergeCSV());
// };

/**
 * Closes the merge modal and removes the iframe from the DOM.
 */
closeMergeModal.addEventListener( 'click', () => {
  const iframe = document.getElementById( 'mergeModalIframe' );
  mergeModal.style.display = 'none';
  mergeIframeContainer.removeChild( iframe );
} );

const settingsModal = document.getElementById( 'settingsModal' );
const openSettingsBtn = document.getElementById( 'openSettingsBtn' );
const closeSettingsModal = document.getElementById( 'closeSettingsModal' );
const settingsIframeContainer = document.getElementById( 'settingsIframeContainer' );

/**
 * Adds an event listener to the openSettingsBtn element that displays the settings modal and creates an iframe to load the settingsModal.html file.
 * When the openSettingsBtn is clicked, the settings modal is displayed with a flex layout, and an iframe element is created and appended to the settingsIframeContainer.
 * The iframe's src attribute is set to 'settingsModal.html', and its width and height are set to 100% to fill the modal.
 */
openSettingsBtn.addEventListener( 'click', () => {
  settingsModal.style.display = 'flex';
  const iframe = document.createElement( 'iframe' );
  iframe.id = 'settingsModalIframe';
  iframe.src = 'settingsModal.html'; // Replace with the desired URL
  iframe.style.width = '100%';
  iframe.style.height = '100%'; // Adjust the height as needed
  settingsIframeContainer.appendChild( iframe );
} );

/**
 * Closes the settings modal and removes the iframe element from the DOM.
 */
closeSettingsModal.addEventListener( 'click', () => {
  const iframe = document.getElementById( 'settingsModalIframe' );
  settingsModal.style.display = 'none';
  settingsIframeContainer.removeChild( iframe );
} );

/**
 * Toggles the "comfy mode" setting for the application, which applies a CSS class to table header and body cells to change their appearance.
 * The current state of the "comfy mode" setting is stored in localStorage.
 */
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

/**
 * Toggles the theme of the application by cycling through the available themes.
 * The current theme index is stored in localStorage, and a new stylesheet link is
 * added to the document head to load the next theme.
 */
// function toggleThemeSetting () {
//   const head = document.head.children
//   if (localStorage.getItem('theme') === 'dark') {
//     for (let h of head) {
//       if(h.getAttribute('href') === './resources/css/darkTheme.css') {
//         h.setAttribute('href', './resources/css/lightTheme.css');
//         localStorage.setItem('theme', 'light');
//       }
//     }
//   }
//   else if (localStorage.getItem('theme') === 'light') {
//     for (let h of head) {
//       if(h.getAttribute('href') === './resources/css/lightTheme.css') {
//         h.setAttribute('href', './resources/css/darkTheme.css');
//         localStorage.setItem('theme', 'dark');
//       }
//     }
//   }
// }

/**
 * Toggles the display state of a row and updates the button text accordingly.
 *
 * @param {HTMLButtonElement} button - The button that triggered the toggle.
 * @param {HTMLTableRowElement} row - The row element to toggle the display of.
 */
function toggleDoneSetting(button, row) {
  button.textContent = row.style.display === 'none' ? 'Disable' : 'Enable';
};