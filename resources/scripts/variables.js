const Variables = (function () {
  'use strict;'  
  
  const publicAPIs = {};
  
  publicAPIs.theme = localStorage.getItem( 'theme' ) === 'customTheme.css' ? 'customTheme.css' : localStorage.getItem( 'theme' ) === 'darkTheme.css' ? 'darkTheme.css' : 'lightTheme.css';
  localStorage.setItem( 'theme', publicAPIs.theme );

  return publicAPIs;
})();
