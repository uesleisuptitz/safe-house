import "./firebase";
import firebase from "firebase/app";
import "firebase/database";
import { GAME } from "../utils";

const db = firebase.database();

export const firebaseCreateRoom = (roomId, roomData, callback) => {
  return new Promise((resolve, reject) => {
    try {
      let myRoom = db.ref(`rooms/${roomId}`);
      myRoom.set(roomData).then(() => callback());
      GAME.ZOMBIES.forEach(({ id, position }) => {
        db.ref(`rooms/${roomId}/zombies/${id}`).set({ position });
      });
      myRoom.onDisconnect().remove();
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
export const firebaseEnterTheRoom = (roomId, userId, username) => {
  return new Promise((resolve, reject) => {
    try {
      let myUser = db.ref(`rooms/${roomId}/users/${userId}`);
      myUser.update({ username });
      myUser.onDisconnect().remove();
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

export const firebaseStartGame = (roomId) => {
  return new Promise((resolve, reject) => {
    try {
      var roomRef = db.ref(`rooms/${roomId}`);
      roomRef.update({ status: GAME.STATUS.PLAYING });
      roomRef.update({
        turn: {
          userId: GAME.TURN.ALL_USERS,
          action: GAME.ACTIONS.ROLL_INIT,
        },
      });
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

export const firebaseExitTheRoom = (roomId, userId) => {
  return new Promise((resolve, reject) => {
    try {
      let myUser = db.ref(`rooms/${roomId}/users/${userId}`);
      myUser.remove();
      if (roomId === userId) {
        db.ref(`rooms/${roomId}`).remove();
      }
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
