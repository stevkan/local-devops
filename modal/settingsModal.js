const SettingsModal = (function() {
  'use strict';
  
  let publicAPIs = {};

  publicAPIs.onload = () => {
    window.parent.toggleThemeSetting();
  }

  publicAPIs.toggleComfy = async () => {
    const comfyButton = document.getElementById('comfyButton');
    comfyButton.addEventListener('click', (() => {
      window.parent.toggleComfySetting(); // Call a function in the parent window
    })());
  };
  
  publicAPIs.toggleTheme = async () => {
    const comfyButton = document.getElementById('themeButton');
    comfyButton.addEventListener('click', (() => {
      window.parent.toggleThemeSetting(); // Call a function in the parent window
    })());
  };

  return publicAPIs;
})();
