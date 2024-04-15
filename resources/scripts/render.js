const render = () => {
  const onRendered = document.createEvent( 'Event' );
  onRendered.initEvent( 'onRendered', true, true );
  table.innerHTML = '';
  const header = table.createTHead();
  header.classList.add( 'header' );
  const headers = [ "State", "ID", "Issue ID", "Repository", "Title" ];
  const row = header.insertRow( 0 );
  row.classList.add( 'columnSelector' );
  headers.forEach( headerText => {
    const cell = document.createElement( 'th' );
    row.appendChild( cell );
    cell.innerHTML = `<b>${ headerText }</b>`;
    if ( headerText === 'State' ) {
      cell.classList.add( 'col-1' );
    }
    if ( headerText === 'ID' ) {
      cell.classList.add( 'col-2' );
    }
    if ( headerText === 'Issue ID' ) {
      cell.classList.add( 'col-3' );
    }
    if ( headerText === 'Repository' ) {
      cell.classList.add( 'col-4' );
    }
    if ( headerText === 'Title' ) {
      cell.classList.add( 'col-5' );
    }
    cell.style.cursor = 'pointer';
    cell.onclick = ( e ) => {
      // if ( e.button !== 0 || !e.ctrlKey ) return; // Check for left mouse button click and Control key press
      cell.setAttribute( 'data-order', cell.dataset.order === 'asc' ? 'desc' : 'asc' );

      document.addEventListener( 'keydown', ( ( event ) => {
        // Get the table rows (excluding the header row)
        var tableRows = table.tBodies[ 0 ].rows;

        switch ( e.target.innerHTML ) {
          case "State":
          case "<b>State</b>":
            order.splice( 0, 0, 0 );
            columnIndex = 0;
            break;
          case "ID":
          case "<b>ID</b>":
            order.splice( 0, 0, 1 );
            columnIndex = 1;
            break;
          case "Issue ID":
          case "<b>Issue ID</b>":
            order.splice( 0, 0, 2 );
            columnIndex = 2;
            break;
          case "Repository":
          case "<b>Repository</b>":
            order.splice( 0, 0, 3 );
            columnIndex = 3;
            break;
          case "Title":
          case "<b>Title</b>":
            order.splice( 0, 0, 4 );
            columnIndex = 4;
            break;
          default:
            break;
        }
        if ( order.length > 3 ) {
          order.splice( 3 );
        }
        localStorage.setItem( 'customOrder', `[${ order }]` );
        // Sort the rows
        tableRows = Array.from( tableRows ).sort( function ( rowA, rowB ) {
          const checkOrder = Array.from( localStorage.getItem( 'customOrder' ) ).filter( item => !isNaN( item ) );
          if (checkOrder[2] !== checkOrder[0] && checkOrder[2] === checkOrder[1]) table.tHead.rows[0].cells[checkOrder[2]].removeAttribute( 'data-order' );
          const col = e.target;

          if ( rowA.children.length === 0 ) {
            return;
          }
          const result = sortRows( col, Number( checkOrder[ 0 ] ), rowA, rowB, cell );
          return result;
        } );

        // Clear the existing table rows
        var tableBody = document.querySelector( '#data tbody' );

        // Append the sorted rows back to the table
        tableRows.forEach( function ( row ) {
          tableBody.appendChild( row );
        } );
      } )() );
    };
    table.dispatchEvent( onRendered );
  } );

  const tbody = document.createElement( 'tbody' );
  table.appendChild( tbody );
  data.forEach( ( row, i ) => {
    const tbodyRow = document.createElement( 'tr' );
    tbodyRow.classList.add( 'rowSelector' );
    tbody.appendChild( tbodyRow );
    if ( row.ID === undefined || row.ID === null || row.ID === '' ) return;
    headers.forEach( headerText => {
      const bodyCell = document.createElement( 'td' );
      tbodyRow.appendChild( bodyCell );
      bodyCell.classList.add( `${ headerText.replace( ' ', '-' ).toLowerCase() }` );
      localStorage.getItem( 'comfyMode' ) === 'true' ? bodyCell.classList.add( 'comfy-mode' ) : bodyCell.classList.remove( 'comfy-mode' );
      if ( headerText === "State" ) {
        const select = document.createElement( 'select' );
        select.id = row.State + '-' + row.ID;
        select.innerHTML = `
          <option ${ row.State === 'To Do' ? 'selected' : '' } class='to-do' value='To Do'>To Do</option>
          <option ${ row.State === 'Investigating' ? 'selected' : '' } class='investigating' value='Investigating'>Investigating</option>
          <option ${ row.State === 'Waiting on Customer' ? 'selected' : '' } class='waiting-on-customer' value='Waiting on Customer'>Waiting on Customer</option>
          <option ${ row.State === 'Waiting on Internal Task' ? 'selected' : '' } class='waiting-on-internal-task' value='Waiting on Internal Task'>Waiting on Internal Task</option>  
          <option ${ row.State === 'Done' ? 'selected' : '' } class='done' value='Done'>Done</option>
          <option ${ row.State === 'Community' ? 'selected' : '' } class='community' value='Community'>Community</option>
          <option ${ row.State === 'Forward' ? 'selected' : '' } class='forward' value='Forward'>Forward</option>
        `;
        select.value = row[ headerText ];
        select.onchange = () => {
          row[ headerText ] = select.value;
          select.parentNode.parentNode.classList.add( 'unsaved' );
          table.dispatchEvent( onRendered );
        };
        bodyCell.classList.add( 'col-1' );
        bodyCell.appendChild( select );
      }
      if ( headerText === 'ID' ) {
        bodyCell.classList.add( 'col-2' );
      }
      if ( headerText === 'Issue ID' ) {
        bodyCell.classList.add( 'col-3' );
      }
      if ( headerText === 'Repository' ) {
        bodyCell.classList.add( 'col-4' );
      }
      if ( headerText !== "State" && headerText !== "Title" ) {
        if ( row[ headerText ] === "(Unknown)" && row[ 'Issue URL' ].includes( 'portal.microsofticm.com' ) ) {
          row[ headerText ] = "IcM";
        }
        if ( row[ headerText ] === "(Unknown)" && row[ 'Issue URL' ].includes( 'stackoverflow.com' ) ) {
          row[ headerText ] = "StackOverflow";
        }
        if ( row[ headerText ].startsWith("Botframework")) {
          const botText = row[ headerText ].substring(0, 12);
          row[ headerText ] = row[ headerText ].replace(botText, 'BotFramework');
        }
        if ( row[ headerText ].startsWith("Botbuilder")) {
          const botText = row[ headerText ].substring(0, 10);
          row[ headerText ] = row[ headerText ].replace(botText, 'BotBuilder');
        }
        if ( repositories.includes( row[ headerText ].toLowerCase() ) ) {
          const words = row[ headerText ].split( '-' );
          const capitalizedWords = words.map( word => word.charAt( 0 ).toUpperCase() + word.slice( 1 ) );
          row[ headerText ] = capitalizedWords.join( '-' );
        }
        bodyCell.innerHTML = row[ headerText ];
      }
      if ( headerText === "Title" ) {
        const urlElement = row[ 'Issue URL' ];
        const tempContainer = document.createElement( 'div' );
        tempContainer.innerHTML = urlElement;
        const url = tempContainer.getElementsByTagName( 'a' )[ 0 ].href;
        bodyCell.classList.add( 'col-5' );
        bodyCell.innerHTML = `<a href="${ url }" target="_blank">${ row[ headerText ] }</a>`;
      }
    } );
  } );

  table.addEventListener( 'onRendered', ( e ) => {
    document.querySelectorAll( 'select option' ).forEach( option => {

      if ( option.selected ) {
        switch ( option.value ) {
          case 'To Do':
            option.parentNode.style.backgroundColor = 'darkred';
            option.parentNode.style.color = 'white';
            break;
          case 'Investigating':
            option.parentNode.style.backgroundColor = '#fdcc72';
            option.parentNode.style.color = 'white';
            break;
          case 'Waiting on Internal Task':
            option.parentNode.style.backgroundColor = '#c3c368';
            option.parentNode.style.color = 'white';
            break;
          case 'Waiting on Customer':
            option.parentNode.style.backgroundColor = 'blue';
            option.parentNode.style.color = 'white';
            break;
          case 'Done':
            option.parentNode.style.backgroundColor = 'green';
            option.parentNode.style.color = 'white';
            break;
          case 'Community':
            option.parentNode.style.backgroundColor = 'darkslateblue';
            option.parentNode.style.color = 'white';
            break;
          case 'Forward':
            option.parentNode.style.backgroundColor = 'darkblue';
            option.parentNode.style.color = 'white';
            break;
          default:
            option.parentNode.style.backgroundColor = '#181818';
            option.parentNode.style.color = 'white';
            break;
        }
      }
    } );
  } );


  table.dispatchEvent( onRendered );
  document.addEventListener( 'click', ( event ) => {
    if ( event.target.localName === 'td' ) {
      const target = event.target.closest( 'tr' );
      const children = table.tBodies[ 0 ].children;
      for ( child of children ) {
        if ( child === target ) {
          if ( selectedRow ) {
            selectedRow.classList.remove( 'selected' );
          }
          selectedRow = target;
          selectedRow.classList.add( 'selected' );
        }
      };
    }
    else {
      if ( selectedRow ) {
        selectedRow.classList.remove( 'selected' );
        selectedRow = null;
      }
    }
  } );
};
