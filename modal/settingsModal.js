const SettingsModal = (function() {
  'use strict';
  
  let publicAPIs = {
    showDone: true,
    table: null,
  };

  publicAPIs.onload = () => {
    publicAPIs.table = window.parent.ParentProperties.table;
    const themeButton = document.querySelector('#themeButton');
    window.parent.toggleThemeSetting(themeButton);
  }

  publicAPIs.toggleComfy = async () => {
    const comfyButton = document.getElementById('comfyButton');
    comfyButton.addEventListener('click', (() => {
      window.parent.toggleComfySetting(); // Call a function in the parent window
    })());
  };
  
  publicAPIs.toggleTheme = () => {
    window.parent.toggleThemeSetting(); // Call a function in the parent window
  };

  publicAPIs.onShowDoneChange = () => {
    
  }
  
  publicAPIs.toggleDone = () => {
    publicAPIs.table = window.parent.ParentProperties.table;
    publicAPIs.showDone = !publicAPIs.showDone;
    const toggleDoneButton = document.querySelector('#toggleDone');
    publicAPIs.table.querySelectorAll( 'select option' ).forEach( option => {
      if ( option.selected ) {
        switch ( option.value ) {
          case 'Community':
          case 'Forward':
          case 'Done':
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
