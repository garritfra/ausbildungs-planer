import React, { Component } from "react";
import "../styles/app.scss";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <div className="app">
        <h1>Hello World!</h1>
      </div>
    );
  }
}
