import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "../styles/app.scss";
import Header from "./Header/Header";
import Login from "./Login/Login";
import Main from "./Main/Main";
import Profile from "./Profile/Profile";

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
          <Route path="/profile" component={Profile} />
        </div>
      </Router>
    );
  }
}
