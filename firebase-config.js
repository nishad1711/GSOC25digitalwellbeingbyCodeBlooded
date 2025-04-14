// Initialize Firebase ONLY if it's loaded
if (typeof firebase !== "undefined") {
  const firebaseConfig = {
    apiKey: "AIzaSyBbMWfyJNwq3xBJeRhtTltYHG_tsqiQrAA",
    authDomain: "loginactivity-82e63.firebaseapp.com",
    projectId: "loginactivity-82e63",
    storageBucket: "loginactivity-82e63.appspot.com",
    messagingSenderId: "661159209007",
    appId: "1:661159209007:web:ab9a2559d96da16c4e7eda",
    measurementId: "G-KB12ZG9727",
  };
  firebase.initializeApp(firebaseConfig);
} else {
  console.error("Firebase SDK not loaded!");
}
