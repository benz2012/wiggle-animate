/**
 * Inserts new elements into an array without mutation
 * @param {Array} arr the original array, it will remain unmodified
 * @param {Integer} index the index at which to insert the newItems
 * @param  {...any} newItems one to many new elements to be inserted
 * @returns a new array
 */
const insert = (arr, index, ...newItems) => ([
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted items
  ...newItems,
  // part of the array after the specified index
  ...arr.slice(index),
])

export {
  // eslint-disable-next-line import/prefer-default-export
  insert,
}
