import React from "react";
import "./Header.scss";

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <div id="header">
        <h1>Welcome</h1>
      </div>
    );
  }
}
