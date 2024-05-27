let data = [];
const table = document.querySelector( '#data' );
let lastOpenedFile = null; // Variable to store the last opened File object
let rowSelected = null; // Variable to store the selected row for highlighting
const defaultOrder = [ 1, 1, 1 ];
localStorage.setItem( 'defaultOrder', `[${ defaultOrder }]` );
let order = Array.from(localStorage.getItem( 'customOrder' )).flat().filter(item => !isNaN(item))
let columnIndex = null;
let isComfy = localStorage.getItem( 'comfyMode' ) !== null ? localStorage.getItem( 'comfyMode' ) : false;

// const body = document.querySelector('body');
// const link = document.createElement( 'link' );
// link.rel = 'stylesheet';
// link.type = 'text/css';

// localStorage.getItem( 'theme' ) === 'light' ?
// (
//   link.href = `./resources/css/lightTheme.css`,
//   localStorage.setItem( 'theme', 'light')
// ) :
// (
//   link.href = `./resources/css/darkTheme.css`,
//   localStorage.setItem( 'theme', 'dark')
// );
// document.head.appendChild( link );

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

  const requestOptions = {
    method: "GET",
    mode: "cors",
    credentials: 'include',
    headers: myHeaders,
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

  const raw = JSON.stringify( { data } );

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

const mergeData = async (data) => {
  // Save merged data to backend
    const myHeaders = new Headers();
    myHeaders.append( "Content-Type", "application/json" );
    
    const raw = JSON.stringify( { data } );
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    
    try {
      /**
       * Sends a fetch request to the '/merge' endpoint and updates the UI with the merge status.
       * If the request is successful, it displays a loading indicator that updates every second for up to 3 seconds, then displays a 'merged' message.
       * If the request fails, it displays an error alert.
       */
      const response = await fetch( 'http://localhost:6550/merge', requestOptions );
      if ( response.ok ) {
        console.log('INDEX MERGE DATA ', await response.statusText);
        return await response.statusText;
        // const mergeStatus = window.parent.document.querySelector('#mergeModal #mergeModalIframe').contentDocument.querySelector('#mergeStatus');
        // let message = '';
        // let mergeCount = 0;
        // const interval = setInterval(() => {
        //   if (mergeCount <= 2) {
        //     message = message + '.';
        //     mergeStatus.innerHTML = `${message}`;
        //   }
        //   if (mergeCount === 3) {
        //     mergeStatus.innerHTML = `${message}merged`;
        //     loadButton.click();
        //     clearInterval(interval);
        //   }
        //   mergeCount++;
        // }, 1000);
      } else {
        console.error( 'Error saving data' );
      }
    } catch (err) {
      console.error('Error saving merged data:', err);
    }
}

const deleteRow = async (rowId) => {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({ rowId });
  const requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  try {
    const response = await fetch('http://localhost:6550/delete', requestOptions);
    if (response.ok) {
      // Row deleted successfully, update the table or display a success message
      console.log('Row deleted successfully');
    } else {
      // Handle the error
      console.error('Error deleting row');
    }
  } catch (err) {
    console.error('Error deleting row:', err);
  }
};

window.onload = async () => {
  toggleComfySetting();
  // SettingsModal().onload();
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
  await SettingsModal().toggleDone();

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

// Get the context menu element
const contextMenu = document.getElementById('contextMenu');

// Add event listener to the table rows
table.addEventListener('contextmenu', function (event) {
  event.preventDefault();

  // Check if the right-clicked element is a table row
  if (event.target.closest('tr')) {
    // Show the context menu
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    // Store the selected row
    rowSelected = event.target.closest('tr');
  }
});

// Hide the context menu when clicking outside of it
document.addEventListener('click', function (event) {
  if (!contextMenu.contains(event.target)) {
    contextMenu.style.display = 'none';
  }
});

// Add event listener to the delete option in the context menu
document.getElementById('deleteRow').addEventListener('click', function () {
  if (rowSelected) {
    const rowId = rowSelected.children[1].innerHTML;
    deleteRow(rowId);
    rowSelected.remove();
    contextMenu.style.display = 'none';
  }
});

/**
 * Provides a public API for accessing the `table` property.
 * @namespace ParentProperties
 * @property {object} table - The table object.
 */
window.ParentProperties = (function () {
  'use strict;'

  const publicAPIs = {
    mergeData: mergeData,
    Papa: Papa,
    table: table,
  };

  return publicAPIs;
})();