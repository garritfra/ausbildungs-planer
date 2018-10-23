import firebase from "firebase";
import React from "react";
import {
  Button,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label
} from "reactstrap";
import SubmitSuccessModal from "../Helpers/SubmitSuccessModal";
import "./Main.scss";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;

    this.state = {
      id: null,
      activities: "",
      instructions: "",
      school: "",
      dateStart: new Date().getTime(),
      dateEnd: new Date().getTime(),
      successModalVisible: false,
      isNewEntry: true,
      submitButtonDisabled: false,
      currentUser: undefined
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ currentUser: user });
      this.initializeFirebaseRefs();

      this.entriesRef
        .orderBy("id", "desc")
        .limit(1)
        .get()
        .then(entry => entry.docs[0].data())
        .then(data => this.setState({ id: data.id }))
        .then(() => this.fetchEntry(this.state.id));
    });
  }

  initializeFirebaseRefs() {
    this.userRef = firebase
      .firestore()
      .collection("Users")
      .doc(this.state.currentUser.email);
    this.entriesRef = this.userRef.collection("Berichte");
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
      school: this.state.school,
      dateStart: this.state.dateStart,
      dateEnd: this.state.dateEnd
    };
    this.entriesRef
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
    console.log(this.state.currentUser);
    this.disableSubmitButton();
    this.entriesRef
      .doc(id.toString())
      .get()
      .then(snapshot => snapshot.data())
      .then(newBericht => {
        this.setState({
          activities: newBericht.activities,
          instructions: newBericht.instructions,
          school: newBericht.school,
          dateStart: newBericht.dateStart,
          dateEnd: newBericht.dateEnd,
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

  onDateStartChanged(event) {
    this.setState({ dateStart: event.target.value });
  }

  onDateEndChanged(event) {
    this.setState({ dateEnd: event.target.value });
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
            <Input
              onChange={this.onDateStartChanged.bind(this)}
              className="textField"
              type="date"
              value={this.state.dateStart}
            />
          </FormGroup>
          <FormGroup>
            <Label for="dateEnd">bis</Label>
            <Input
              onChange={this.onDateEndChanged.bind(this)}
              className="textField"
              type="date"
              value={this.state.dateEnd}
            />
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
