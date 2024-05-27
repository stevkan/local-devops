/**
 * Merges two CSV files by removing duplicate entries based on the 'ID' field.
 * The merged data is then saved to the backend.
 *
 * @param {Object} Papa - The Papa Parse library for parsing CSV data.
 * @returns {Promise<void>} - A promise that resolves when the merge operation is complete.
 */
const MergeModal = (function() {
  'use strict';
  let publicAPIs = {
    mergeData: null,
    Papa: null,
  };

  /**
   * Initializes the settings modal by setting up the table reference and toggling the theme button.
   * This function is called when the settings modal is loaded.
   */
  publicAPIs.onload = () => {
    // const modalDocument = window.parent.document.querySelector('#mergeModal #mergeModalIframe').contentDocument
  }

  publicAPIs.mergeCSV = async function() {
    this.mergeData = window.parent.ParentProperties.mergeData;
    this.Papa = window.parent.ParentProperties.Papa;
    
    const mergeFromCSV = document.getElementById('mergeFromCSV').files[0];

    const dataFromCSV = await mergeFromCSV.text();
    
    // Parse the CSV data
    const parsedDataFromCSV = this.Papa.parse(dataFromCSV, {header: true}).data;
    const jsonDataFromCSV = JSON.stringify(parsedDataFromCSV);

    const response = await this.mergeData(jsonDataFromCSV);
    const mergeStatus = window.parent.document.querySelector('#mergeModal #mergeModalIframe').contentDocument.querySelector('#mergeStatus');

    setTimeout(() => {
      mergeStatus.innerHTML = response;
    }, 500);
  };
  return publicAPIs;
})();