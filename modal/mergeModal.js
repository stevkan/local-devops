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
      console.log('Parsed Data To CSV', JSON.stringify(element2, null, 2));
      parsedDataFromCSV.forEach(element1 => {
        console.log('Parsed Data From CSV', JSON.stringify(element1, null, 2));
        if (element1['ID'] === element2['ID']) {
          parsedDataFromCSV.pop(element1);
          console.log('Removed duplicate entry');
        }
      });
      console.log('Added remaining entry from CSV 2');
    });

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
      let message = '';
      let mergeCount = 0;
      const interval = setInterval(() => {
        if (mergeCount <= 2) {
          message = message + '.';
          mergeStatus.innerHTML = `${message}`;
        }
        if (mergeCount === 3) {
          mergeStatus.innerHTML = `${message}merged`;
          clearInterval(interval);
        }
        mergeCount++;
      }, 1000);
    } else {
      alert( 'Error saving data' );
    }
};
  return publicAPIs;
})();