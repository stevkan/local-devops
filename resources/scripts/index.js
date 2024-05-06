let data = [];
const table = document.querySelector( '#data' );
let lastOpenedFile = null; // Variable to store the last opened File object
let rowSelected = null; // Variable to store the selected row for highlighting
const defaultOrder = [ 1, 1, 1 ];
localStorage.setItem( 'defaultOrder', `[${ defaultOrder }]` );
let order = Array.from(localStorage.getItem( 'customOrder' )).flat().filter(item => !isNaN(item))
let columnIndex = null;
let isComfy = localStorage.getItem( 'comfyMode' ) !== null ? localStorage.getItem( 'comfyMode' ) : false;
const theme = localStorage.getItem( 'themeIndex' ) === '1' ? 'darkTheme.css' : 'lightTheme.css';
localStorage.setItem( 'theme', theme );
let themeIndex = [ 'lightTheme.css', 'darkTheme.css' ].indexOf( theme );
localStorage.setItem( 'themeIndex', themeIndex );

/**
 * Provides a public API for accessing the `table` property.
 * @namespace ParentProperties
 * @property {object} table - The table object.
 */
window.ParentProperties = (function () {
  'use strict;'

  const publicAPIs = {
    table: table
  };

  return publicAPIs;
})();

const reader = new FileReader();

/**
 * Opens a file browser dialog and stores the selected file path in localStorage.
 * This function is used to allow the user to select a file to be processed by the application.
 */
const openFileBrowser = async () => {
  const input = localStorage.getItem( 'filepath' );
  const fileChooser = document.createElement( 'input' );
  if ( input === '' || input === null ) {
    fileChooser.type = 'file';
    fileChooser.onchange = e => {
      const file = e.target.files[ 0 ];
      const fileName = file.name;
      reader.onload = function ( event ) {
        localStorage.setItem( 'filepath', fileName ); // Store the file path in localStorage
      };
      reader.readAsText( file );
    };
    fileChooser.click();
  }
};

/**
 * Attempts to open the last opened file and render its contents.
 * 
 * If a last opened file is available in localStorage, this function will:
 * 1. Read the file contents as text using the provided `reader` object.
 * 2. Parse the CSV data using the `Papa.parse` library.
 * 3. Store the parsed data in the `data` variable.
 * 4. Call the `render()` function to display the data.
 * 5. Call the `setDefaultOrder()` function to set the initial sort order.
 * 
 * If no last opened file is available, the function will return `false`.
 */
const openLastFile = () => {
  if ( lastOpenedFile ) {
    reader.onload = function ( event ) {
      const csvData = Papa.parse( event.target.result, { header: true } ).data;
      data = csvData;
      render();
      setDefaultOrder();
    };
    reader.readAsText( lastOpenedFile );
  } else {
    return false;
  }
};

/**
 * Asynchronously fetches data from the server using the provided file path.
 * 
 * @returns {Promise<Response|string>} - A Promise that resolves to the server response or the response text if the request was successful, or the response object if the request failed.
 */
const getData = async () => {
  const myHeaders = new Headers();
  myHeaders.append( "Content-Type", "application/json" );

  const raw = JSON.stringify( {
    "filePath": localStorage.getItem( 'filepath' )
  } );

  const requestOptions = {
    method: "POST",
    mode: "cors",
    credentials: 'include',
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch( 'http://localhost:6550/file', requestOptions );
  if ( response.ok ) {
    if ( response.status === 204 ) {
      return response;
    }
    const text = await response;
    return text;
  } else {
    return response;
  }
};

/**
 * Saves the current data to the server.
 * 
 * This function creates a JSON payload with the current file path and data, and sends it to the server
 * using a POST request. If the save is successful, it removes the 'unsaved' class from any rows that
 * were previously marked as unsaved, and then clicks the loadButton to refresh the data.
 * 
 * If the save fails, it displays an error alert.
 */
const saveData = async () => {
  const myHeaders = new Headers();
  myHeaders.append( "Content-Type", "application/json" );

  const raw = JSON.stringify( {
    "filePath": localStorage.getItem( 'filepath' ),
    data
  } );

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch( 'http://localhost:6550/save', requestOptions );
  if ( response.ok ) {
    const unsavedRows = table.querySelectorAll( '.unsaved' );
    unsavedRows.forEach( row => {
      row.classList.remove( 'unsaved' );
    } );
    // alert( 'Data saved successfully!' );
    await loadButton.click(true);
  } else {
    alert( 'Error saving data' );
  }
};

window.onload = async () => {
  toggleComfySetting();
  SettingsModal.onload();
  loadButton.click(true);
};

const issueCount = document.querySelector( '#issueCount');
const icmCountElement = document.getElementById( 'icmCount' );
const ghCountElement = document.getElementById( 'ghCount' );
const soCountElement = document.getElementById('soCount' );

/**
 * Listens for the 'onRendered' event on the table element and updates the count of issues for different issue types.
 * 
 * This function is responsible for counting the number of issues for each issue type (ICM, GitHub, and StackOverflow) and updating the corresponding count elements on the page.
 * 
 * It first waits for the SettingsModal to be toggled as 'done', then iterates through all the rows in the table. For each row, it checks the status of the issue and the issue type,
 * and increments the corresponding count variable.
 * 
 * Finally, it updates the innerHTML of the icmCountElement, ghCountElement, and soCountElement with the calculated counts.
 */
table.addEventListener('onRendered', async (e) => {
  await SettingsModal.toggleDone();

  let icmCount = 0;
  let ghCount = 0;
  let soCount = 0;
  table.querySelectorAll( '.rowSelector' ).forEach( row => {
    if (row.children[0].children[0].value !== 'Done') {
      if (row.children[3].innerHTML.toLowerCase() === 'icm') {
        icmCount++;
      } else if (row.children[3].innerHTML.toLowerCase().startsWith('botbuilder') || row.children[3].innerHTML.toLowerCase().startsWith('botframework')) {
        ghCount++;
      } else if (row.children[3].innerHTML.toLowerCase() === 'stackoverflow') {
        soCount++;
      };
    }
  });
  icmCountElement.innerHTML = `IcM: ${icmCount}`;
  ghCountElement.innerHTML = `GitHub: ${ghCount}`;
  soCountElement.innerHTML = `StackOverflow: ${soCount}`;
});

/**
 * Adds event listeners to the `issueCount` element to show and hide the count elements for different issue types (ICM, GitHub, and StackOverflow) on hover.
 * 
 * When the `issueCount` element is hovered over, the `icmCountElement`, `ghCountElement`, and `soCountElement` have their `hidden` attribute removed, making them visible.
 * When the `issueCount` element is no longer hovered over, the `icmCountElement`, `ghCountElement`, and `soCountElement` have their `hidden` attribute set to `true`, hiding them.
 */
issueCount.addEventListener('mouseover', (e) => {
  icmCountElement.removeAttribute('hidden');
  ghCountElement.removeAttribute('hidden');
  soCountElement.removeAttribute('hidden');
});

/**
 * Hides the count elements for different issue types (ICM, GitHub, and StackOverflow) when the `issueCount` element is no longer hovered over.
 * 
 * This event listener is responsible for setting the `hidden` attribute of the `icmCountElement`, `ghCountElement`, and `soCountElement` to `true` when the `issueCount` element is no longer hovered over. This effectively hides the count elements.
 */
issueCount.addEventListener('mouseout', (e) => {
  icmCountElement.setAttribute('hidden', true);
  ghCountElement.setAttribute('hidden', true);
  soCountElement.setAttribute('hidden', true);
});