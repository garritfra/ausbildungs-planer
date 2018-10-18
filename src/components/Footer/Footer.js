import React from "react";

export default class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return (
      <div id="footer">
        <p id="title-text">Footer</p>
      </div>
    );
  }
}
