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
        <p id="title-text">Welcome</p>
      </div>
    );
  }
}
