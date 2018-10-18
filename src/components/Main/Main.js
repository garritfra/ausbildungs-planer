import React from "react";
import firebase from "firebase";
import { Button } from "reactstrap";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  addData() {
    firebase
      .firestore()
      .collection("Berichte")
      .add({ berufsschule: "Hello World" });
  }

  render() {
    return (
      <div id="main">
        <Button onClick={this.addData.bind(this)}>Add Data</Button>
      </div>
    );
  }
}
