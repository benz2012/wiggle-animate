import { makeObservable, action, observable } from 'mobx'

import Item from './Item'
import Drawable from '../drawing/Drawable'
import { insert } from '../../utility/array'
import { drawContainerController, ContainerControllerSizes } from '../../utility/drawing'

// TODO [2]: add rotation handle interaction
// TODO [3]: if an item is inside of a container, draw a dim version of the container controller to
//       indicate this to the user, when the child item is selected
//       Then, add an option to disable that feature

class Container extends Drawable {
  static get className() { return 'Container' }

  constructor(...args) {
    super(...args)
    this._children = {}
    this._sortOrder = []
    this._name.setValue(`container-${this.name}`)
    this.showChildren = true

    makeObservable(this, {
      _children: observable,
      _sortOrder: observable,
      showChildren: observable,
      add: action,
      remove: action,
      sortChild: action,
      updatePropertiesForFrame: action,
    })
  }

  get children() { return this._children }
  get sortOrder() { return this._sortOrder }

  add(newItem, atIndex = null) {
    const newId = newItem.id
    this._children[newId] = newItem
    if (atIndex != null) {
      this._sortOrder = insert(this._sortOrder, atIndex, newId)
    } else {
      this._sortOrder = [newId, ...this._sortOrder]
    }

    Item.rootContainer.store.setSelected([newId])
  }

  remove(itemId) {
    this._sortOrder = [...this._sortOrder].filter((idInList) => (itemId !== idInList))
    delete this._children[itemId]
  }

  findItemAndParent(itemId) {
    if (itemId in this._children) {
      return { item: this._children[itemId], parent: this }
    }

    let found = null
    Object.values(this._children).some((child) => {
      if (child instanceof Container) {
        found = child.findItemAndParent(itemId)
        if (found) return true
      }
      return false
    })

    return found
  }

  findAndDelete(itemId) {
    if (itemId in this._children) {
      this.remove(itemId)
    } else {
      Object.values(this._children).forEach((child) => {
        if (child instanceof Container) {
          child.findAndDelete(itemId)
        }
      })
    }
  }

  get allItems() {
    const children = [this.id]
    Object.values(this._children).forEach((child) => {
      if (child instanceof Container) {
        children.push(...child.allItems)
      } else {
        children.push(child.id)
      }
    })
    return children
  }

  sortChild(childId, toIndex, byAmount) {
    const prevIndex = this._sortOrder.findIndex((element) => element === childId)
    const tempOrderWithoutChild = [...this._sortOrder]
    tempOrderWithoutChild[prevIndex] = 'to-remove'
    let tempSortOrder
    if (toIndex) {
      tempSortOrder = insert(tempOrderWithoutChild, toIndex, childId)
    } else if (byAmount) {
      tempSortOrder = insert(tempOrderWithoutChild, prevIndex + byAmount, childId)
    }
    this._sortOrder = tempSortOrder.filter((element) => (element !== 'to-remove'))
  }

  increaseOrder(childId, by = 2) {
    this.sortChild(childId, null, by)
  }

  decreaseOrder(childId, by = -1) {
    this.sortChild(childId, null, by)
  }

  updatePropertiesForFrame(frame) {
    super.updatePropertiesForFrame(frame)
    Object.values(this.children).forEach((child) => {
      child.updatePropertiesForFrame(frame)
    })
  }

  draw(parentTransform, hoveredId, hoveredControl, activeControl, selectedIds, selectorHovers) {
    super.draw(parentTransform)

    const drawOrder = [...this.sortOrder].reverse()
    drawOrder.forEach((childId) => {
      const anyHovers = (hoveredId === childId) || selectorHovers.includes(childId)
      const handleIdxHovered = (hoveredId && hoveredId.includes(childId))
        ? parseInt(hoveredId.split('--handle--')[1], 10)
        : null
      const handleIdxActive = (activeControl && activeControl.includes(childId))
        ? parseInt(activeControl.split('--handle--')[1], 10)
        : null

      const child = this.children[childId]
      if (child instanceof Container) {
        child.draw(
          this.currentTransform,
          hoveredId,
          hoveredControl,
          activeControl,
          selectedIds,
          selectorHovers,
        )
      } else {
        child.draw(
          this.currentTransform,
          anyHovers,
          selectedIds.includes(childId),
          handleIdxHovered,
          handleIdxActive,
        )
      }
    })

    if (
      this.id !== Item.rootContainer.id
      && selectedIds.includes(this.id)
    ) {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(...this.origin.values)
      const isPositionHovered = hoveredId === this.id && hoveredControl === 'position'
      const isOriginHovered = hoveredId === this.id && hoveredControl === 'origin'
      drawContainerController(this.ctx, isPositionHovered, isOriginHovered)
    }
  }

  createIntersectionsPath(controlType = 'position') {
    const { positionBox, originBox } = ContainerControllerSizes
    let rectSpec
    if (controlType === 'position') {
      rectSpec = [positionBox / -2, positionBox / -2, positionBox, positionBox]
    } else if (controlType === 'origin') {
      rectSpec = [originBox / -2, originBox / -2, originBox, originBox]
    }
    this.ctx.rect(...rectSpec)
  }

  checkSelectedContainerPointerIntersections(pointerVector) {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.translate(...this.origin.values)
    this.ctx.beginPath()
    this.createIntersectionsPath()
    if (this.ctx.isPointInPath(...pointerVector.values)) {
      this.ctx.beginPath()
      this.createIntersectionsPath('origin')
      if (this.ctx.isPointInPath(...pointerVector.values)) {
        Item.rootContainer.store.setHoveredControl('origin')
      } else {
        Item.rootContainer.store.setHoveredControl('position')
      }
      return true
    }
    return false
  }

  checkPointerIntersections(pointerVector) {
    // Array.some() will cause the iteration to short circuit on the first child
    // that has an intersection, like event bubble cancellation in the DOM
    let hasIntersection = false
    const { selectedIds } = Item.rootContainer.store.build
    const { tools } = Item.rootContainer.store

    this.sortOrder.some((childId) => {
      const child = this.children[childId]

      // This checks for intersections btwn the mouse and the Yellow Controler Box used to
      // move a container. Only checked when the container itself is selected beforehand
      if (
        child instanceof Container
        && selectedIds.includes(childId)
      ) {
        hasIntersection = child.checkSelectedContainerPointerIntersections(pointerVector)
        if (hasIntersection) {
          Item.rootContainer.store.setHovered(childId)
          return hasIntersection
        }
      }

      // This checks for intersections btwn the mouse and the Controller Handles
      // on the selected Shape Item, like Resize or Rotate on the Rectangle
      if (!(child instanceof Container)) {
        const [hasHandleIntersection, handleIdx, cursor] = child.checkSelectedItemHandleIntersections(pointerVector)
        hasIntersection = hasHandleIntersection
        if (hasIntersection) {
          let interactionType = tools.RESIZE
          if (handleIdx === 100) {
            interactionType = tools.ROTATE
          }
          Item.rootContainer.store.setHovered(`${childId}--handle--${handleIdx}`)
          Item.rootContainer.store.setHoveredControl(`handle--${interactionType}--${cursor}`)
          return hasIntersection
        }
        Item.rootContainer.store.setHoveredControl(null)
      }

      // This checks for intersections btwn the mouse and all children that are not
      // Containers, recursivley (it recurses into Containers, lol).
      hasIntersection = child.checkPointerIntersections(pointerVector)
      if (!(child instanceof Container) && hasIntersection) {
        Item.rootContainer.store.setHovered(childId)
      }
      return hasIntersection
    })

    return hasIntersection
  }

  findRectIntersections(rectSpecTLBR) {
    const intersections = []
    this.sortOrder.forEach((childId) => {
      const child = this.children[childId]
      const intersectionsWithinChild = child.findRectIntersections(rectSpecTLBR)
      intersections.push(...intersectionsWithinChild)
    })
    return intersections
  }
}

export default Container
