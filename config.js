import * as firebase from 'firebase'
// Your web app's Firebase configuration
  // var firebaseConfig = {
  //   apiKey: "AIzaSyCl87n86VJXbIyYhxOhVO02zj9bqB0ABV0",
  //   authDomain: "library-management-aef2d.firebaseapp.com",
  //   projectId: "library-management-aef2d",
  //   storageBucket: "library-management-aef2d.appspot.com",
  //   messagingSenderId: "393294166288",
  //   appId: "1:393294166288:web:bd29dbdabc9a7f87684d95"
  // };
  var firebaseConfig = {
    apiKey: "AIzaSyCl87n86VJXbIyYhxOhVO02zj9bqB0ABV0",
    authDomain: "library-management-aef2d.firebaseapp.com",
    projectId: "library-management-aef2d",
    storageBucket: "library-management-aef2d.appspot.com",
    messagingSenderId: "393294166288",
    appId: "1:393294166288:web:bd29dbdabc9a7f87684d95"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();