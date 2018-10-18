import firebase from "firebase";
import React from "react";
import {
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  FormText,
  Modal,
  Button
} from "reactstrap";
import "./Main.scss";
import SubmitSuccessModal from "../Helpers/SubmitSuccessModal";
import Bericht from "../../model/Bericht";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      activities: "",
      instructions: "",
      school: "",
      successModalVisible: false
    };
  }

  onSubmit() {
    const bericht = new Bericht(
      this.state.activities,
      this.state.instructions,
      this.state.school
    );
    firebase
      .firestore()
      .collection("Berichte")
      .add({
        activities: bericht.activities.toString(),
        instructions: bericht.instructions.toString(),
        school: bericht.school.toString()
      })
      .then(() => {
        this.toggleSuccessModal();
      });
  }

  onActivityChanged(event) {
    this.setState({ activities: event.target.value });
  }

  onInstructionsChanged(event) {
    this.setState({ instructions: event.target.value });
  }

  onSchoolChanged(event) {
    this.setState({ school: event.target.value });
  }

  toggleSuccessModal() {
    this.setState({ successModalVisible: !this.state.successModalVisible });
    console.log(this.state.successModalVisible);
  }

  render() {
    return (
      <div id="main">
        <Form>
          <FormGroup row>
            <Label for="activities" sm={2}>
              Betriebliche Tätigkeiten
            </Label>
            <Col sm={10}>
              <Input
                type="textarea"
                name="activities"
                id="activities"
                onChange={this.onActivityChanged.bind(this)}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="instructions" sm={2}>
              Schulungen
            </Label>
            <Col sm={10}>
              <Input
                type="textarea"
                name="instructions"
                id="instructions"
                onChange={this.onInstructionsChanged.bind(this)}
              />
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="school" sm={2}>
              Berufsschule
            </Label>
            <Col sm={10}>
              <Input
                type="textarea"
                name="school"
                id="school"
                onChange={this.onSchoolChanged.bind(this)}
              />
            </Col>
          </FormGroup>
          <FormGroup check row>
            <Col sm={{ size: 10, offset: 2 }}>
              <Button onClick={this.onSubmit.bind(this)}>Submit</Button>
            </Col>
          </FormGroup>
        </Form>
        <SubmitSuccessModal
          toggle={this.toggleSuccessModal.bind(this)}
          isOpen={this.state.successModalVisible}
        />
      </div>
    );
  }
}
