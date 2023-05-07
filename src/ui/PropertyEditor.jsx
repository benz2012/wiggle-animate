import { useState, useEffect } from 'react'
import { Leva, LevaInputs, useControls } from 'leva'
import { action } from 'mobx'

const PropertyEditor = ({ store }) => {
  const [elementsToListenTo, setElementsToListenTo] = useState([])

  const { build, propertyEditor, rootContainer } = store

  const [_, setPropInController] = useControls(
    () => {
      // TODO: support multi-selected property edit case
      const { selectedIds } = build
      if (selectedIds.length !== 1) {
        setElementsToListenTo([])
      }
      if (store.rootContainer.allItems.length === 0) {
        return ({})
      }
      if (selectedIds.length === 0) {
        return ({
          'Select an Item': {
            value: '',
            editable: false,
          },
        })
      }
      if (selectedIds.length > 1) {
        return ({
          'Select only 1': {
            value: '',
            editable: false,
          },
        })
      }
      const selectedItem = rootContainer.findItem(selectedIds[0])

      const nextElementsToListenTo = []
      const schema = Object.fromEntries(
        selectedItem.editables.map((entry) => {
          const [prop, propType] = entry
          nextElementsToListenTo.push(`${selectedItem.id}--${prop}`)

          let type = null
          switch (propType) {
            case 'string':
              type = LevaInputs.STRING
              break
            case 'number':
              type = LevaInputs.NUMBER
              break
            default:
              break
          }

          return ([`${selectedItem.id}--${prop}`, {
            label: prop,
            value: selectedItem[prop],
            type,
            onChange: action((value) => {
              selectedItem[prop] = value
            }),
          }])
        })
      )

      setTimeout(() => {
        setElementsToListenTo(nextElementsToListenTo)
      }, 0)

      return schema
    },
    [build.selectedIds]
  )

  const handleInputChange = (event) => {
    setPropInController({ [event.target.id]: event.target.value })
  }

  // This is a hack because Leva refuses to send incremental updates to onChange
  // even with the { transient: true } option set, so we trigger our own
  useEffect(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    elementsToListenTo.forEach((elementId) => {
      const inputEl = document.getElementById(elementId)
      if (inputEl) { inputEl.removeEventListener('input', handleInputChange) }
      if (inputEl) { inputEl.addEventListener('input', handleInputChange) }
    })

    return () => {
      elementsToListenTo.forEach((elementId) => {
        const inputEl = document.getElementById(elementId)
        if (inputEl) { inputEl.removeEventListener('input', handleInputChange) }
      })
    }
  }, [elementsToListenTo])

  // This is a hack since Leva has rendering issues when config is given
  // see https://github.com/pmndrs/leva/issues/456
  const [collapsed, setCollapsed] = useState(true)
  useEffect(() => {
    const timeoutId = setTimeout(() => { setCollapsed(false) }, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <Leva
      neverHide
      collapsed={{
        collapsed,
        onChange: (value) => { setCollapsed(value) },
      }}
      hideCopyButton
      titleBar={{
        filter: false,
        position: propertyEditor.position.object,
        onDrag: (position) => store.setPropertyEditorPosition(position),
      }}
    />
  )
}

export default PropertyEditor
