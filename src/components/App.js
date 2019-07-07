import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "../styles/app.scss";
import Header from "./Header/Header";
import Login from "./Login/Login";
import Berichte from "./Berichte/Berichte";
import Profile from "./Profile/Profile";
import FeatureManager from "../util/FeatureManager";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      timesheetsEnabled: false
    };

    FeatureManager.instance.timesheetsEnabled.subscribe({
      next: v => {
        this.setState({ timesheetsEnabled: v });
        console.log("Timesheets enabled: " + v);
      }
    });
  }

  render() {
    return (
      <Router>
        <div className="app">
          <Header />
          <Route exact path="/" component={Berichte} />
          <Route exact path="/berichte" component={Berichte} />
          {this.state.timesheetsEnabled && (
            <Route path="/timesheets" render={() => <h1>Timesheets</h1>} />
          )}
          <Route path="/login" component={Login} />
          <Route path="/profile" component={Profile} />
        </div>
      </Router>
    );
  }
}
