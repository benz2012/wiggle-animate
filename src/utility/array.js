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

const randomChoice = (choices) => {
  const index = Math.floor(Math.random() * choices.length)
  return choices[index]
}

/* Simple array comparison. Will likely only work when the elements are primitives */
const isEqual = (arr1, arr2) => JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort())

export {
  insert,
  randomChoice,
  isEqual,
}
