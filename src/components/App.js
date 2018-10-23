import React, { Component } from "react";
import firebase, { auth } from "firebase";
import Header from "./Header/Header";
import Main from "./Main/Main";
import Login from "./Login/Login";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import "../styles/app.scss";

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
