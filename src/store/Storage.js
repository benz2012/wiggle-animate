import { autorun } from 'mobx'

import { storageEnabled } from '../utility/storage'

class Storage {
  constructor(store) {
    if (storageEnabled() === false) return

    // Auto Load project from storage, if its there
    const projectObj = localStorage.getItem('wiggle.animate.project')
    if (projectObj) {
      setTimeout(() => {
        store.project.load(projectObj)
      }, 100)
    }

    // Auto Save
    autorun(() => {
      const projectAsJSON = store.project.save()
      localStorage.setItem('wiggle.animate.project', projectAsJSON)
    }, { delay: 300 })
  }
}

export default Storage
