import React, { Component } from "react";
import firebase from "firebase";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Footer from "./Footer/Footer";
import "../styles/app.scss";

// Initialize Firebase
const config = {
  apiKey: "AIzaSyBvYP_HXbReuOgYcd7j9ojMwvClIlrh4F4",
  authDomain: "ausbildungs-planer.firebaseapp.com",
  databaseURL: "https://ausbildungs-planer.firebaseio.com",
  projectId: "ausbildungs-planer",
  storageBucket: "",
  messagingSenderId: "864868139007"
};
firebase.initializeApp(config);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <div className="app">
        <Header />
        <Main />
        <Footer />
      </div>
    );
  }
}
