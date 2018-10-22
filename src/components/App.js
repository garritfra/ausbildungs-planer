import React, { Component } from "react";
import firebase, { auth } from "firebase";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Login from "./Login/Login";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
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
      <Router>
        <div className="app">
          <Header />
          <Route exact path="/" component={Main} />
          <Route path="/login" component={Login} />
        </div>
      </Router>
    );
  }
}
