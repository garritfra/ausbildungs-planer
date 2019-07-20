import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import firebase from "firebase";
import React from "react";
import ReactDOM from "react-dom";
import App from "../src/components/App";

require("dotenv").load();

// Initialize Firebase
const prodConfig = {
  apiKey: process.env.FIREBASE_TOKEN,
  authDomain: "ausbildungs-planer.firebaseapp.com",
  databaseURL: "https://ausbildungs-planer.firebaseio.com",
  projectId: "ausbildungs-planer",
  storageBucket: "ausbildungs-planer.appspot.com",
  messagingSenderId: "864868139007",
  appId: "1:864868139007:web:0846fbe3f19cf91e"
};

const devConfig = {
  apiKey: process.env.FIREBASE_TOKEN,
  authDomain: "ausbildungs-planer-dev.firebaseapp.com",
  databaseURL: "https://ausbildungs-planer-dev.firebaseio.com",
  projectId: "ausbildungs-planer-dev",
  storageBucket: "ausbildungs-planer-dev.appspot.com",
  messagingSenderId: "935279055870",
  appId: "1:935279055870:web:da83ce2cc1173a85"
};

if (process.env.FIREBASE_STAGE == "production") {
  firebase.initializeApp(prodConfig);
} else {
  firebase.initializeApp(devConfig);
  console.info("Firebase is using development environment");
}

let perf = firebase.performance();

ReactDOM.render(<App />, document.querySelector("#root"));
