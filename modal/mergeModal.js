const MergeModal = (function() {
  'use strict';
  
  let publicAPIs = {};
  publicAPIs.mergeCSV = async function(Papa) {
    const mergeFromCSV = document.getElementById('mergeFromCSV').files[0];
    const mergeToCSV = document.getElementById('mergeToCSV').files[0];

    const dataFromCSV = await mergeFromCSV.text();
    const dataToCSV = await mergeToCSV.text();

    // Parse the CSV data
    const parsedDataFromCSV = Papa.parse(dataFromCSV, {header: true}).data;
    const parsedDataToCSV = Papa.parse(dataToCSV, {header: true}).data;

    parsedDataToCSV.forEach(element2 => {
      parsedDataFromCSV.forEach(element1 => {
        if (element1['ID'] === element2['ID']) {
          parsedDataFromCSV.pop(element1);
          console.log('Removed duplicate entry');
        }
      });
      console.log('Added remaining entry from CSV 2');
    });

    // Remove the header from the first CSV file
    parsedDataToCSV.shift();

    // Merge the CSV files
    const mergedData = parsedDataFromCSV.concat(parsedDataToCSV);
    
    // Save merged data to backend
    const myHeaders = new Headers();
    myHeaders.append( "Content-Type", "application/json" );
    
    const filename = 'DevOpsIssues';
    const raw = JSON.stringify( {
      "fileName": filename,
      data: mergedData
    } );
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    
    const response = await fetch( 'http://localhost:6550/merge', requestOptions );
    if ( response.ok ) {
      const mergeStatus = document.getElementById('mergeStatus');
      mergeStatus.innerHTML = '...data merged';
    } else {
      alert( 'Error saving data' );
    }
};
  return publicAPIs;
})();