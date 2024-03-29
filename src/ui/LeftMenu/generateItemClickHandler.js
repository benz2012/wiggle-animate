import Container from '../../lib/structure/Container'

/**
 * This complex function handles many specific scenarions in which an item can be clicked,
 * like when certain keys are held, and determines how to adjust the current selection.
 *
 * For example: If there are 6 items in the list, and item 2 is already selected,
 * and then the user holds "Shift" and clicks item 4, we want to respond by
 * selecting items 2, 3, & 4.
 */
const generateItemClickHandler = (store, clickedId) => () => {
  const { selectedIds } = store.build

  if (store.keyHeld.Meta) {
    //
    if (selectedIds.includes(clickedId)) {
      store.build.removeFromSelection(clickedId)
    } else {
      // Prevent selecting a child of a container that is already selected
      const somePreSelectedContainerHasThisNewClickedId = store.build.selectedIds
        .some((selectedId) => {
          const selectedItem = store.rootContainer.findItem(selectedId)
          if (selectedItem instanceof Container) {
            const found = selectedItem.findItemAndParent(clickedId)
            if (found != null) return true
          }
          return false
        })
      if (!somePreSelectedContainerHasThisNewClickedId) {
        store.build.addToSelection(clickedId)
        // And if it is a container, remove any of it's children afterward
        const clickedItem = store.rootContainer.findItem(clickedId)
        if (clickedItem instanceof Container) {
          store.build.removeManyFromSelection(
            clickedItem.allItems.slice(1)
          )
        }
      }
    }
    //
  } else if (store.keyHeld.Shift && selectedIds.length > 0) {
    //
    const parent = store.rootContainer.findParent(clickedId)
    const preselectedSiblings = parent.sortOrder
      .filter((siblingId) => selectedIds.includes(siblingId))

    if (preselectedSiblings.length > 0) {
      // sort siblings and then find lowest and hightest, compare to where we are clicking
      const indexOfClickedChild = parent.sortOrder.findIndex((childId) => childId === clickedId)
      const indexOfFirstSelectedSibling = parent.sortOrder.findIndex((childId) => (
        childId === preselectedSiblings[0]
      ))
      const indexOflastSelectedSibling = parent.sortOrder.findIndex((childId) => (
        childId === preselectedSiblings[preselectedSiblings.length - 1]
      ))

      if (indexOfClickedChild < indexOflastSelectedSibling) {
        // select upwards from last
        const childrenBetweenClickAndLast = parent.sortOrder.slice(
          indexOfClickedChild,
          indexOflastSelectedSibling + 1,
        )
        store.build.setSelected(childrenBetweenClickAndLast)
      } else if (indexOfClickedChild > indexOfFirstSelectedSibling) {
        // select downwards from first
        const childrenBetweenFirstAndClick = parent.sortOrder.slice(
          indexOfFirstSelectedSibling,
          indexOfClickedChild + 1,
        )
        store.build.setSelected(childrenBetweenFirstAndClick)
      }
      //
    } else {
      // This means Shift was held, there was already some selected items, but none of them
      // were a sibiling of the newly clicked item
      store.build.setSelected([clickedId])
    }
    //
  } else if (selectedIds.includes(clickedId)) {
    // No modifiers held, but the user clicks and item that's already selected,
    // then leave everything alone
  } else {
    // Default case
    store.build.setSelected([clickedId])
  }
}

export default generateItemClickHandler
