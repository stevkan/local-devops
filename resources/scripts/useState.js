/**
 * Creates a state variable and a function to update it.
 *
 * @param {any} defaultValue - The initial value of the state variable.
 * @returns {[() => any, (newValue: any) => void]} - An array containing a getter function to retrieve the current state value, and a setter function to update the state.
 */
const useState = (defaultValue) => {
  let value = defaultValue;
  
  const getValue = () => value
  const setValue = newValue => value = newValue

  return [ getValue, setValue] ;
}