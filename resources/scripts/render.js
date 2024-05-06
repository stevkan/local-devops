/**
 * Renders the table with the data provided.
 * This function creates the table header, populates the table body with the data, and sets up event listeners for sorting and selecting rows.
 * It also dispatches an 'onRendered' event when the rendering is complete.
 */
const render = () => {
  const onRendered = document.createEvent( 'Event' );
  onRendered.initEvent( 'onRendered', true, true );
  table.innerHTML = '';
  const header = table.createTHead();
  header.classList.add( 'header' );
  const headers = [ "State", "ID", "Issue ID", "Repository", "Title", "Changed Date", "Created Date" ];
  const row = header.insertRow( 0 );
  row.classList.add( 'columnSelector' );

  /**
   * Iterates over the `headers` array and creates a new `th` element for each header text.
   * The created `th` elements are appended to the `row` element.
   * Each `th` element has the header text set as its inner HTML, and may have additional CSS classes applied based on the header text.
   * The `th` elements also have a `cursor` style set to `pointer` and an `onclick` event handler that toggles the `data-order` attribute between `asc` and `desc`.
   *
   * @param {string[]} headers - An array of header text strings.
   * @param {HTMLTableRowElement} row - The table row element to append the `th` elements to.
   */
  headers.forEach( headerText => {
    const cell = document.createElement( 'th' );
    row.appendChild( cell );
    cell.innerHTML = `<b>${ headerText }</b>`;
    if ( headerText.toLowerCase() === 'state' ) {
      cell.classList.add( 'col-1' );
    }
    if ( headerText.toLowerCase() === 'id' ) {
      cell.classList.add( 'col-2' );
    }
    if ( headerText.toLowerCase() === 'issue id' ) {
      cell.classList.add( 'col-3' );
    }
    if ( headerText.toLowerCase() === 'repository' ) {
      cell.classList.add( 'col-4' );
    }
    if ( headerText.toLowerCase() === 'title' ) {
      cell.classList.add( 'col-5' );
    }
    if ( headerText.toLowerCase() === 'changed date' ) {
      cell.classList.add( 'col-6' );
      cell.setAttribute( 'hidden', true );
    }
    if ( headerText.toLowerCase() === 'created date' ) {
      cell.classList.add( 'col-7' );
      cell.setAttribute( 'hidden', true );
    }
    cell.style.cursor = 'pointer';


    /**
     * Handles the click event on a table cell.
     * If the left mouse button is clicked and the Control key is pressed, the function will execute.
     * This function is likely used to toggle the sorting order of the table column associated with the clicked cell.
     *
     * @param {MouseEvent} e - The click event object.
     */
    cell.onclick = ( e ) => {
      // if ( e.button !== 0 || !e.ctrlKey ) return; // Check for left mouse button click and Control key press
      cell.setAttribute( 'data-order', cell.dataset.order === 'asc' ? 'desc' : 'asc' );

      /**
       * Listens for keydown events on the document and retrieves the table rows (excluding the header row).
       */
      document.addEventListener( 'keydown', ( ( event ) => {
        // Get the table rows (excluding the header row)
        var tableRows = table.tBodies[ 0 ].rows;

        switch ( e.target.innerHTML.toLowerCase() ) {
          case "state":
          case "<b>state</b>":
            order.splice( 0, 0, 0 );
            columnIndex = 0;
            break;
          case "id":
          case "<b>id</b>":
            order.splice( 0, 0, 1 );
            columnIndex = 1;
            break;
          case "issue id":
          case "<b>issue id</b>":
            order.splice( 0, 0, 2 );
            columnIndex = 2;
            break;
          case "repository":
          case "<b>repository</b>":
            order.splice( 0, 0, 3 );
            columnIndex = 3;
            break;
          case "title":
          case "<b>title</b>":
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

        /**
         * Sorts the table rows based on the specified column and order.
         * The sorting is performed on the table rows stored in the `tableRows` array.
         * The sorting order is determined by the `customOrder` value stored in localStorage.
         * If the `customOrder` value is not valid, the sorting is skipped.
         * After sorting, the table rows are appended back to the table body.
         */
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

  /**
   * Iterates over the `data` array and creates a table row for each item.
   * For each row, it creates a table cell for each header and sets the appropriate
   * class names and event handlers based on the row data.
   *
   * @param {Object[]} data - An array of objects representing the data to be rendered.
   * @returns {void}
   */
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
      if ( headerText.toLowerCase() === "state" ) {
        const select = document.createElement( 'select' );
        select.id = row.State + '-' + row.ID;
        select.innerHTML = `
          <option ${ row.State.toLowerCase() === 'to do' ? 'selected' : '' } class='to-do' value='To Do'>To Do</option>
          <option ${ row.State === 'Investigating' ? 'selected' : '' } class='investigating' value='Investigating'>Investigating</option>
          <option ${ row.State === 'Waiting on Customer' ? 'selected' : '' } class='waiting-on-customer' value='Waiting on Customer'>Waiting on Customer</option>
          <option ${ row.State === 'Waiting on Internal Task' ? 'selected' : '' } class='waiting-on-internal-task' value='Waiting on Internal Task'>Waiting on Internal Task</option>  
          <option ${ row.State === 'Done' ? 'selected' : '' } class='done' value='Done'>Done</option>
          <option ${ row.State === 'Community' ? 'selected' : '' } class='community' value='Community'>Community</option>
          <option ${ row.State === 'Forwarded' ? 'selected' : '' } class='forwarded' value='Forwarded'>Forwarded</option>
        `;
        select.value = row[ headerText ];
        select.onchange = (e) => {
          row[ headerText ] = select.value;
          select.parentNode.parentNode.classList.add( 'unsaved' );
          table.dispatchEvent( onRendered );
            const saveButton = document.querySelector( '#saveButton' );
            saveButton.click();
        };
        bodyCell.classList.add( 'col-1' );
        bodyCell.appendChild( select );
      }
      if ( headerText.toLowerCase() === 'id' ) {
        bodyCell.classList.add( 'col-2' );
      }
      if ( headerText.toLowerCase() === 'issue id' ) {
        bodyCell.classList.add( 'col-3' );
      }
      if ( headerText.toLowerCase() === 'repository' ) {
        bodyCell.classList.add( 'col-4' );
      }
      if ( headerText.toLowerCase() !== "state" && headerText.toLowerCase() !== "title" ) {
        if ( row[ headerText ] === "(Unknown)" && row[ 'Issue URL' ].includes( 'portal.microsofticm.com' ) ) {
          row[ headerText ] = "IcM";
        }
        if ( row[ headerText ] === "(Unknown)" && row[ 'Issue URL' ].includes( 'stackoverflow.com' ) ) {
          row[ headerText ] = "StackOverflow";
        }
        if ( row[ headerText ].toLowerCase().startsWith("botframework")) {
          const botText = row[ headerText ].substring(0, 12);
          row[ headerText ] = row[ headerText ].replace(botText, 'BotFramework');
        }
        if ( row[ headerText ].toLowerCase().startsWith("botbuilder")) {
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
      if ( headerText.toLowerCase() === "title" ) {
        const urlElement = row[ 'Issue URL' ];
        const tempContainer = document.createElement( 'div' );
        tempContainer.innerHTML = urlElement;
        const url = tempContainer.getElementsByTagName( 'a' )[ 0 ].href;
        bodyCell.classList.add( 'col-5' );
        bodyCell.innerHTML = `<a href="${ url }" target="_blank">${ row[ headerText ] }</a>`;
      }
      if ( headerText.toLowerCase() === 'changed date' ) {
        bodyCell.classList.add( 'col-6' );
        bodyCell.setAttribute( 'hidden', true );
      }
      if ( headerText.toLowerCase() === 'created date' ) {
        bodyCell.classList.add( 'col-7' );
        bodyCell.setAttribute( 'hidden', true );
      }
    } );
  } );
  
  /**
   * Applies custom styles to table rows based on the selected option in each row's status dropdown.
   * This event listener is attached to the 'onRendered' event of the table element.
   */
  table.addEventListener( 'onRendered', ( e ) => {
    document.querySelectorAll( 'select option' ).forEach( option => {

      if ( option.selected ) {
        switch ( option.value.toLowerCase() ) {
          case 'to do':
            option.parentNode.style.backgroundColor = 'darkred';
            option.parentNode.style.color = 'white';
            break;
          case 'investigating':
            option.parentNode.style.backgroundColor = '#fdcc72';
            option.parentNode.style.color = 'white';
            break;
          case 'waiting on internal task':
            option.parentNode.style.backgroundColor = '#c3c368';
            option.parentNode.style.color = 'white';
            break;
          case 'waiting on customer':
            option.parentNode.style.backgroundColor = 'blue';
            option.parentNode.style.color = 'white';
            break;
          case 'done':
            option.parentNode.style.backgroundColor = 'green';
            option.parentNode.style.color = 'white';
            break;
          case 'community':
            option.parentNode.style.backgroundColor = 'darkslateblue';
            option.parentNode.style.color = 'white';
            break;
          case 'forwarded':
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
  
  /**
   * Handles click events on the table rows, allowing the user to select a row.
   * When a row is clicked, it is highlighted with the 'selected' class. If another row was previously selected, that selection is removed.
   * If the user clicks outside of a row, any previously selected row is deselected.
   */
  document.addEventListener( 'click', ( event ) => {
    if ( event.target.localName === 'td' ) {
      const target = event.target.closest( 'tr' );
      const children = table.tBodies[ 0 ].children;
      for ( child of children ) {
        if ( child === target ) {
          if ( rowSelected !== null ) {
            rowSelected.classList.remove( 'selected' );
          }
          rowSelected = target;
          rowSelected.classList.add( 'selected' );
        }
      };
    }
    else {
      if ( rowSelected !== null ) {
        rowSelected.classList.remove( 'selected' );
        rowSelected = null;
      }
    }
  } );
};
