let data = [];
const table = document.querySelector( '#data' );
let lastOpenedFile = null; // Variable to store the last opened File object
let selectedRow = null; // Variable to store the selected row for highlighting
const defaultOrder = [ 1, 1, 1 ];
localStorage.setItem( 'defaultOrder', `[${ defaultOrder }]` );
let order = Array.from(localStorage.getItem( 'customOrder' )).flat().filter(item => !isNaN(item))
let columnIndex = null;
let isComfy = localStorage.getItem( 'comfyMode' ) !== null ? localStorage.getItem( 'comfyMode' ) : false;
const theme = localStorage.getItem( 'themeIndex' ) === '1' ? 'darkTheme.css' : 'lightTheme.css';
localStorage.setItem( 'theme', theme );
let themeIndex = [ 'lightTheme.css', 'darkTheme.css' ].indexOf( theme );
localStorage.setItem( 'themeIndex', themeIndex );

window.ParentProperties = (function () {
  'use strict;'

  const publicAPIs = {
    table: table
  };

  return publicAPIs;
})();

const reader = new FileReader();
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
    alert( 'Data saved successfully!' );
  } else {
    alert( 'Error saving data' );
  }
};

window.onload = async () => {
  toggleComfySetting();
  SettingsModal.onload();
  loadButton.click();
};

const issueCount = document.querySelector( '#issueCount');
const icmCountElement = document.getElementById( 'icmCount' );
const ghCountElement = document.getElementById( 'ghCount' );
const soCountElement = document.getElementById('soCount' );

table.addEventListener('onRendered', async (e) => {
  await SettingsModal.toggleDone();

  let icmCount = 0;
  let ghCount = 0;
  let soCount = 0;
  table.querySelectorAll( '.rowSelector' ).forEach( row => {
    if (row.children[0].children[0].value !== 'Done') {
      if (row.children[3].innerHTML === 'IcM') {
        icmCount++;
      } else if (row.children[3].innerHTML.startsWith('BotBuilder') || row.children[3].innerHTML.startsWith('BotFramework')) {
        ghCount++;
      } else if (row.children[3].innerHTML === 'StackOverflow') {
        soCount++;
      };
    }
  });
  icmCountElement.innerHTML = `IcM: ${icmCount}`;
  ghCountElement.innerHTML = `GitHub: ${ghCount}`;
  soCountElement.innerHTML = `StackOverflow: ${soCount}`;
});

issueCount.addEventListener('mouseover', (e) => {
  icmCountElement.removeAttribute('hidden');
  ghCountElement.removeAttribute('hidden');
  soCountElement.removeAttribute('hidden');
});

issueCount.addEventListener('mouseout', (e) => {
  icmCountElement.setAttribute('hidden', true);
  ghCountElement.setAttribute('hidden', true);
  soCountElement.setAttribute('hidden', true);
});