/**
 * Provides a settings modal for the application, including functionality to toggle the theme and comfy mode.
 * The modal also allows the user to show or hide "Done" tasks in the main table.
 */
const SettingsModal = (function() {
  'use strict';
  
  let publicAPIs = {
    showDone: true,
    table: null,
  };

  /**
   * Initializes the settings modal by setting up the table reference and toggling the theme button.
   * This function is called when the settings modal is loaded.
   */
  publicAPIs.onload = () => {
    publicAPIs.table = window.parent.ParentProperties.table;
    const themeButton = document.querySelector('#themeButton');
    window.parent.toggleThemeSetting(themeButton);
  }

  /**
   * Toggles the "comfy" setting in the parent window.
   * This function is called when the "comfy" button is clicked.
   */
  publicAPIs.toggleComfy = async () => {
    const comfyButton = document.getElementById('comfyButton');
    comfyButton.addEventListener('click', (() => {
      window.parent.toggleComfySetting(); // Call a function in the parent window
    })());
  };
  
  /**
   * Toggles the theme setting in the parent window.
   */
  publicAPIs.toggleTheme = () => {
    window.parent.toggleThemeSetting(); // Call a function in the parent window
  };

  // publicAPIs.onShowDoneChange = () => {
    
  // }
  
  /**
   * Toggles the display of 'done' rows in a table based on the 'showDone' state.
   * Finds all selected options in the table and hides or shows the corresponding rows
   * based on whether the 'showDone' state is true or false.
   * Also updates the 'toggleDone' button state if it exists.
   */
  publicAPIs.toggleDone = () => {
    publicAPIs.table = window.parent.ParentProperties.table;
    publicAPIs.showDone = !publicAPIs.showDone;
    const toggleDoneButton = document.querySelector('#toggleDone');
    publicAPIs.table.querySelectorAll( 'select option' ).forEach( option => {
      if ( option.selected ) {
        switch ( option.value.toLowerCase() ) {
          case 'community':
          case 'forwarded':
          case 'done':
            const row = option.parentNode.parentNode.parentNode;
            row.style.display = publicAPIs.showDone ? 'none' : 'table-row';

            if (toggleDoneButton) {
              window.parent.toggleDoneSetting(toggleDoneButton, row);
            }
            break;
          default:
            break;
        }
      }
    } );
  };

  return publicAPIs;
})();
