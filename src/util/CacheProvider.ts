import { database, auth } from "firebase";

let _instance: CacheProvider;

export default class CacheProvider {
  reference: database.Reference;
  static get instance() {
    return _instance ? _instance : new CacheProvider();
  }

  private constructor() {
    auth().onAuthStateChanged(user => {
      if (user) {
        this.reference = database().ref("/cache/" + user.uid);
        console.log("new cache location: " + this.reference.ref);
      }
    });
  }

  async set(key: string, value: any) {
    if (auth().currentUser) {
      database()
        .ref(`/cache/${auth().currentUser.uid}/${key}`)
        .set(value)
        .then(value => console.log("Cache updated: " + value));
    }
  }

  async get(key: string) {
    console.log("Reference: " + this.reference);
    const snapshot = await database()
      .ref(`/cache/${auth().currentUser.uid}/${key}`)
      .once("value", value => value.val());
    console.log("Getting cached value: " + snapshot.val());
    return snapshot.val();
  }
}
