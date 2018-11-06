import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import firebase from "firebase";
import React from "react";
import ReactDOM from "react-dom";
import App from "../src/components/App";

require("dotenv").load();

// Initialize Firebase
const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "ausbildungs-planer.firebaseapp.com",
  databaseURL: "https://ausbildungs-planer.firebaseio.com",
  projectId: "ausbildungs-planer",
  storageBucket: "",
  messagingSenderId: "864868139007"
};
firebase.initializeApp(config);

ReactDOM.render(<App />, document.querySelector("#root"));
