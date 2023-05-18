import { makeObservable, action } from 'mobx'

import Item from './Item'
import Drawable from '../drawing/Drawable'
import { insert } from '../../utility/array'
import { observeListOfProperties } from '../../utility/state'
import { drawContainerController, ContainerControllerSizes } from '../../utility/drawing'

class Container extends Drawable {
  static get IGNORE_WHEN_PEEKING() { return ['_children', '_sortOrder', 'showChildren'] }

  constructor(...args) {
    super(...args)
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

  draw(parentTransform, hoveredId, hoveredControl, selectedIds, selectorHovers) {
    super.draw(parentTransform)

    const drawOrder = [...this.sortOrder].reverse()
    drawOrder.forEach((childId) => {
      const anyHovers = (hoveredId === childId) || selectorHovers.includes(childId)
      const child = this.children[childId]
      if (child instanceof Container) {
        child.draw(this.currentTransform, hoveredId, hoveredControl, selectedIds, selectorHovers)
      } else {
        child.draw(this.currentTransform, anyHovers, selectedIds.includes(childId))
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
    this.sortOrder.some((childId) => {
      const child = this.children[childId]

      if (
        child instanceof Container
        && Item.rootContainer.store.build.selectedIds.includes(childId)
      ) {
        hasIntersection = child.checkSelectedContainerPointerIntersections(pointerVector)
        if (hasIntersection) {
          Item.rootContainer.store.setHovered(childId)
          return hasIntersection
        }
      }

      hasIntersection = child.checkPointerIntersections(pointerVector)
      if (!(child instanceof Container) && hasIntersection) {
        Item.rootContainer.store.setHovered(childId)
        Item.rootContainer.store.setHoveredControl('position')
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
