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
