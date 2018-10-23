import firebase from "firebase";
import React from "react";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback
} from "reactstrap";
import "./Main.scss";
import SubmitSuccessModal from "../Helpers/SubmitSuccessModal";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.state = {
      id: null,
      activities: "",
      instructions: "",
      school: "",
      successModalVisible: false,
      isNewEntry: true,
      submitButtonDisabled: false,
      currentUser: undefined
    };
  }

  componentWillMount() {
    firebase
      .auth()
      .onAuthStateChanged(user => this.setState({ currentUser: user }));
  }

  componentDidMount() {
    this.setState({ currentUser: firebase.auth().currentUser });
    if (this.state.currentUser) {
      this.fetchEntry(this.state.id);
    }
  }

  enableSubmitButton() {
    this.setState({ submitButtonDisabled: false });
  }

  disableSubmitButton() {
    this.setState({ submitButtonDisabled: true });
  }

  onSubmit() {
    this.disableSubmitButton();
    const newBericht = {
      id: this.state.id,
      activities: this.state.activities,
      instructions: this.state.instructions,
      school: this.state.school
    };
    firebase
      .firestore()
      .collection("User")
      .doc(this.state.currentUser.email)
      .collection("Berichte")
      .doc(this.state.id.toString())
      .set(newBericht)
      .then(() => {
        this.toggleSuccessModal();
        this.enableSubmitButton();
      })
      .catch(err => {
        this.enableSubmitButton();
      });
  }

  fetchEntry(id) {
    this.disableSubmitButton();
    firebase
      .firestore()
      .collection("User")
      .doc(this.state.currentUser.email)
      .collection("Berichte")
      .doc(id.toString())
      .get()
      .then(snapshot => snapshot.data())
      .then(newBericht => {
        this.setState({
          activities: newBericht.activities,
          instructions: newBericht.instructions,
          school: newBericht.school,
          isNewEntry: false
        });
        this.enableSubmitButton();
      })
      .catch(err => {
        this.onNoEntryFound();
        this.enableSubmitButton();
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

  onEntryIdChanged(event) {
    const newId = event.target.value;
    this.setState({ id: newId });
    this.fetchEntry(newId);
  }

  onNoEntryFound() {
    this.setState({
      activities: "",
      instructions: "",
      school: "",
      isNewEntry: true
    });
  }

  toggleSuccessModal() {
    this.setState({ successModalVisible: !this.state.successModalVisible });
    console.log(this.state.successModalVisible);
  }

  render() {
    return (
      <div id="main">
        <Form className="left">
          <FormGroup>
            <Label for="activities">Betriebliche Tätigkeiten</Label>
            <Input
              type="textarea"
              name="activities"
              id="activities"
              className="textField"
              onChange={this.onActivityChanged.bind(this)}
              value={this.state.activities}
            />
          </FormGroup>
          <FormGroup>
            <Label for="instructions">Schulungen</Label>
            <Input
              type="textarea"
              name="instructions"
              id="instructions"
              className="textField"
              onChange={this.onInstructionsChanged.bind(this)}
              value={this.state.instructions}
            />
          </FormGroup>
          <FormGroup>
            <Label for="school">Berufsschule</Label>
            <Input
              type="textarea"
              name="school"
              id="school"
              className="textField"
              onChange={this.onSchoolChanged.bind(this)}
              value={this.state.school}
            />
          </FormGroup>
          <FormGroup>
            <Button
              disabled={this.state.submitButtonDisabled}
              color="primary"
              onClick={this.onSubmit.bind(this)}
            >
              Submit
            </Button>
          </FormGroup>
        </Form>
        <Form className="right">
          <FormGroup>
            <Label for="number">Berichtsnummer</Label>
            <Input
              valid={this.state.isNewEntry}
              onChange={this.onEntryIdChanged.bind(this)}
              id="number"
              type="number"
              className="textField"
              value={this.state.id}
            />
            <FormFeedback valid={this.state.isNewEntry}>
              Das ist ein neuer Bericht!
            </FormFeedback>
          </FormGroup>
          <FormGroup>
            <Label for="dateStart">Woche von</Label>
            <Input className="textField" type="date" />
          </FormGroup>
          <FormGroup>
            <Label for="dateEnd">bis</Label>
            <Input className="textField" type="date" />
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
