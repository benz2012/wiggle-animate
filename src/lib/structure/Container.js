import { makeObservable, action, observable } from 'mobx'

import Item from './Item'
import Drawable from '../drawing/Drawable'
import { insert } from '../../utility/array'
import {
  drawContainerController,
  ContainerControllerSizes,
  setContainerControllerHandleEllipseOnCtx,
} from '../../utility/drawing'
import shapeTypeMap from '../shapes/shapeTypeMap'

// TODO [4]: Add project to hide dim containers

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
      toggleShowChildren: action,
      add: action,
      remove: action,
      updatePropertiesForFrame: action,
    })
  }

  get children() { return this._children }
  get sortOrder() { return this._sortOrder }

  toggleShowChildren = () => {
    this.showChildren = !this.showChildren
  }

  add(newItem, atIndex = null, immediatelySelect = true) {
    const newId = newItem.id
    this._children[newId] = newItem
    if (atIndex != null) {
      this._sortOrder = insert(this._sortOrder, atIndex, newId)
    } else {
      this._sortOrder = [newId, ...this._sortOrder]
    }

    if (immediatelySelect) {
      Item.rootContainer.store.build.setSelected([newId])
    }
  }

  remove(itemId) {
    const { build } = Item.rootContainer.store
    build.removeFromSelection(itemId)
    if (build.hoveredId === itemId) build.setHovered(null)
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

  get allItemsShown() {
    // Shown = Shown in Left Menu List
    // therefore it need to match sortOrders
    const children = [this.id]
    this.sortOrder.forEach((itemId) => {
      const child = this._children[itemId]
      if (child instanceof Container) {
        if (child.showChildren === false) {
          children.push(child.id)
          return
        }
        children.push(...child.allItemsShown)
      } else {
        children.push(child.id)
      }
    })
    return children
  }

  get allItemsShownAsTree() {
    const children = { [this.id]: [] }
    this.sortOrder.forEach((itemId) => {
      const child = this._children[itemId]
      if (child instanceof Container) {
        if (child.showChildren === false) {
          children[this.id].push(itemId)
        } else {
          children[this.id].push(child.allItemsShownAsTree)
        }
      } else {
        children[this.id].push(itemId)
      }
    })
    return children
  }

  openParentsOfTheseItems(itemIds) {
    let openUp = false

    const itemsNotOnThisLevel = []
    itemIds.forEach((itemId) => {
      if (itemId in this._children) {
        openUp = true
      } else {
        itemsNotOnThisLevel.push(itemId)
      }
    })

    this.sortOrder.forEach((childId) => {
      const child = this._children[childId]
      if (child instanceof Container) {
        const childHasOpened = child.openParentsOfTheseItems(itemsNotOnThisLevel)
        if (childHasOpened === true) {
          // we bubble up true events, but not false ones
          openUp = true
        }
      }
    })

    if (openUp) {
      this.showChildren = true
    }

    return openUp
  }

  updatePropertiesForFrame(frame) {
    super.updatePropertiesForFrame(frame)
    Object.values(this.children).forEach((child) => {
      child.updatePropertiesForFrame(frame)
    })
  }

  draw(
    parentTransform,
    hoveredId,
    hoveredControl,
    activeControl,
    selectedIds,
    selectorHovers,
    leftMenuHoveredId,
    hoverIdsDueToSelectedParent,
  ) {
    super.draw(parentTransform)

    const drawOrder = [...this.sortOrder].reverse()
    drawOrder.forEach((childId) => {
      const anyHovers = (
        (hoveredId === childId)
        || selectorHovers.includes(childId)
        || leftMenuHoveredId === childId
        || hoverIdsDueToSelectedParent.includes(childId)
      )
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
          leftMenuHoveredId,
          hoverIdsDueToSelectedParent,
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

    if (this.id === Container.rootContainer.id) return

    if (selectedIds.includes(this.id)) {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(...this.origin.values)
      let controlHovered = hoveredId === this.id && hoveredControl
      if (controlHovered === 'position') {
        controlHovered = 'innerBox'
      } else if (controlHovered === 'origin') {
        controlHovered = 'outerBox'
      }
      drawContainerController(this.ctx, controlHovered)
    } else if (selectedIds.some((itemId) => (itemId in this._children))) {
      this.ctx.setTransform(this.currentTransform)
      this.ctx.translate(...this.origin.values)
      drawContainerController(this.ctx, null, true)
    }
  }

  createIntersectionsPath(controlType) {
    const { innerBox, outerBox } = ContainerControllerSizes
    let rectSpec
    if (controlType === 'position') {
      rectSpec = [innerBox / -2, innerBox / -2, innerBox, innerBox]
    } else if (controlType === 'origin') {
      rectSpec = [outerBox / -2, outerBox / -2, outerBox, outerBox]
    } else if (controlType === 'rotation') {
      setContainerControllerHandleEllipseOnCtx(this.ctx)
    }
    if (rectSpec) { this.ctx.rect(...rectSpec) }
  }

  checkSelectedContainerPointerIntersections(pointerVector) {
    this.ctx.setTransform(this.currentTransform)
    this.ctx.translate(...this.origin.values)

    this.ctx.beginPath()
    this.createIntersectionsPath('origin')
    if (this.ctx.isPointInPath(...pointerVector.values)) {
      this.ctx.beginPath()
      this.createIntersectionsPath('position')
      if (this.ctx.isPointInPath(...pointerVector.values)) {
        Item.rootContainer.store.build.setHoveredControl('position')
        return true
      }

      Item.rootContainer.store.build.setHoveredControl('origin')
      return true
    }

    this.ctx.beginPath()
    this.createIntersectionsPath('rotation')
    if (this.ctx.isPointInPath(...pointerVector.values)) {
      Item.rootContainer.store.build.setHoveredControl('rotation')
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
          Item.rootContainer.store.build.setHovered(childId)
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
          Item.rootContainer.store.build.setHovered(`${childId}--handle--${handleIdx}`)
          Item.rootContainer.store.build.setHoveredControl(`handle--${interactionType}--${cursor}`)
          return hasIntersection
        }
        Item.rootContainer.store.build.setHoveredControl(null)
      }

      // This checks for intersections btwn the mouse and all children that are not
      // Containers, recursivley (it recurses into Containers, lol).
      hasIntersection = child.checkPointerIntersections(pointerVector)
      if (!(child instanceof Container) && hasIntersection) {
        Item.rootContainer.store.build.setHovered(childId)
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

  toPureObject() {
    // We don't need to track sortOrder since we can store it along with children as an array
    const ownPureObject = super.toPureObject()
    const finalPureObject = {
      ...ownPureObject,
      children: this.sortOrder.map((childId) => this.children[childId].toPureObject()),
      showChildren: this.showChildren,
    }
    return finalPureObject
  }

  fromPureObject({ children, showChildren, ...rest }, preserveId = true) {
    super.fromPureObject(rest, preserveId)
    const theSortOrder = []
    this._children = children.reduce((resultObject, childItem) => {
      /* eslint-disable no-param-reassign */
      const ItemType = childItem.className === 'Container' ? Container : shapeTypeMap[childItem.className]
      const newItem = new ItemType()
      newItem.fromPureObject(childItem, preserveId)
      resultObject[newItem.id] = newItem
      theSortOrder.push(newItem.id)
      return resultObject
    }, {})
    this._sortOrder = theSortOrder
    if (showChildren != null) {
      this.showChildren = showChildren
    }
    return this
  }
}

export default Container
