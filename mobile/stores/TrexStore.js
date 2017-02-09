import { observable, action } from 'mobx';
import _ from 'lodash';

export default class TrexStore {
  @observable players = [];
  @observable loading = true;
  @observable school = null;

  @action updateLeaderboard = yourSchool => usersSnapshot => {
    const newPlayers = [];
    const users = usersSnapshot.val();
    _.each(users, (user, uid) => {
      if (user.trexHighestScore && user.school === yourSchool) {
        newPlayers.push({ ...user, uid });
      }
    });

    const sorted = _.sortBy(newPlayers, ['trexHighestScore']);
    sorted.reverse();

    this.players = sorted;
    this.loading = false;
    this.error = null;
  }

  @action watchUsers = () => {
    global.firebaseApp.database()
    .ref('users')
    .child(global.firebaseApp.auth().currentUser.uid)
    .once('value')
    .then(userSnap => {
      this.school = userSnap.val().school;

      global.firebaseApp.database()
      .ref('users')
      .on('value', this.updateLeaderboard(this.school));
    })
    .catch(error => {
      this.error = error;
    });
  }

  unWatchUsers = () => {
    global.firebaseApp.database()
      .ref('users')
      .off('value', this.updateLeaderboard(this.school));
  }

  @action addNewHighScore = (highestScore) => {
    global.firebaseApp.database()
    .ref('users')
    .child(global.firebaseApp.auth().currentUser.uid)
    .once('value')
    .then(userSnap => {
      const user = userSnap.val();
      if (user.trexHighestScore) {
        if (user.trexHighestScore < highestScore) {
          global.firebaseApp.database()
          .ref('users')
          .child(global.firebaseApp.auth().currentUser.uid)
          .update({
            trexHighestScore: highestScore,
          });
        }
      } else {
        global.firebaseApp.database()
        .ref('users')
        .child(global.firebaseApp.auth().currentUser.uid)
        .update({
          trexHighestScore: highestScore,
        });
      }
    })
    .catch(error => {
      this.error = error;
    });
  }
}