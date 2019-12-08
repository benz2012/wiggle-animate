import { observable } from 'mobx'

import * as firebase from 'firebase/app'
import 'firebase/database'

class Gallery {
  @observable clipsRef

  constructor() {
    firebase.initializeApp({
      apiKey: 'AIzaSyCdglP4EAub1kYXJrXag3vaNIxxQgEZTQk',
      authDomain: 'micro-graph.firebaseapp.com',
      databaseURL: 'https://micro-graph.firebaseio.com',
      projectId: 'micro-graph',
      storageBucket: 'micro-graph.appspot.com',
      messagingSenderId: '662102370030',
      appId: '1:662102370030:web:46cfe6a252ed6cc47b75ff',
    })

    this.clipsRef = firebase.database().ref('clips')
  }
}

export default Gallery
