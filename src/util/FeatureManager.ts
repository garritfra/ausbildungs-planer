import { BehaviorSubject } from "rxjs";
import firebase from "firebase";

let _instance: FeatureManager;

export default class FeatureManager {
  timesheetsEnabled: BehaviorSubject<boolean>;

  static get instance() {
    return _instance ? _instance : new FeatureManager();
  }
  private constructor() {
    this.timesheetsEnabled = new BehaviorSubject<boolean>(false);

    firebase.auth().onAuthStateChanged(user => {
      firebase
        .firestore()
        .collection("Users")
        .doc(user.email)
        .get()
        .then(value => value.data())
        .then(user =>
          this.timesheetsEnabled.next(user["timesheets_enabled"] == true)
        );
    });
  }
}
