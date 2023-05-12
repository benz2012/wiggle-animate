import { makeObservable, action } from 'mobx'

import Item from './Item'
import Animatable from '../drawing/Animatable'
import { insert } from '../utility/array'
import { observeListOfProperties } from '../utility/state'

class Container extends Animatable {
  constructor() {
    super()
    this._children = {}
    this._sortOrder = []
    this.name = `container-${this.name}`
    this.showChildren = true

    const inheritedObservables = [...super.observables]
    this._observables = [...inheritedObservables, '_children', '_sortOrder', 'showChildren']
    observeListOfProperties(this, this.observables, inheritedObservables)
    makeObservable(this, {
      add: action,
      remove: action,
      sortChild: action,
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

    if (!(newItem instanceof Container)) {
      Item.rootContainer.store.setSelected([newId])
    }
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

  draw(parentTransform, hoveredId, selectedIds, selectorHovers) {
    this.ctx.setTransform(parentTransform)
    this.ctx.translate(this.x, this.y)
    this.ctx.scale(this.scale.x, this.scale.y)
    this.ctx.rotate(this.rotation.radians)
    const currentTransform = this.ctx.getTransform()

    const drawOrder = [...this.sortOrder].reverse()
    drawOrder.forEach((childId) => {
      const anyHovers = (hoveredId === childId) || selectorHovers.includes(childId)
      const child = this.children[childId]
      if (child instanceof Container) {
        child.draw(currentTransform, hoveredId, selectedIds, selectorHovers)
      } else {
        child.draw(currentTransform, anyHovers, selectedIds.includes(childId))
      }
    })
  }

  checkPointerIntersections(pointerVector) {
    // Array.some() will cause the iteration to short circuit on the first child
    // that has an intersection, like event bubble cancellation in the DOM
    let hasIntersection = false
    this.sortOrder.some((childId) => {
      const child = this.children[childId]
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
