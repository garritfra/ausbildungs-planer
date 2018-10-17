import React, { Component } from "react";
import Header from "./Header/Header";
import "../styles/app.scss";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <div className="app">
        <Header />
      </div>
    );
  }
}
