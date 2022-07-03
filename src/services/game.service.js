import "./firebase";
import firebase from "firebase/app";
import "firebase/database";
import { GAME, getNextLineBoardId } from "../utils";

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

export const firebaseRollInitialDice = (roomId, userId, rollValue) => {
  return new Promise((resolve, reject) => {
    try {
      let userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      userRef.update({ initRollValue: rollValue });
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
export const firebaseRollNormalDice = (roomId, rollValue) => {
  return new Promise((resolve, reject) => {
    try {
      var turnRef = db.ref(`rooms/${roomId}/turn`);
      turnRef.update({
        action: GAME.ACTIONS.MOVE,
        avaliableMoviments: rollValue,
      });
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
export const firebaseWinGame = (roomId, userWinner) => {
  return new Promise((resolve, reject) => {
    try {
      var roomRef = db.ref(`rooms/${roomId}`);
      roomRef.update({ status: GAME.STATUS.FINISHED, userWinner });
      setTimeout(() => {
        roomRef.remove();
      }, 5000);
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
export const firebasePlayerMove = (roomId, userId, lineId, cellIndex) => {
  return new Promise((resolve, reject) => {
    try {
      var turnRef = db.ref(`rooms/${roomId}/turn`);
      let userRef = db.ref(`rooms/${roomId}/users/${userId}`);
      let nextLineId = getNextLineBoardId(lineId);
      let newAvaliableCells = [
        lineId + (cellIndex - 1),
        lineId + (cellIndex + 1),
      ];
      if (nextLineId) newAvaliableCells.push(nextLineId + cellIndex);
      else if (!nextLineId && lineId === "a")
        newAvaliableCells.push(GAME.ACTIONS.WIN);
      turnRef.update({
        action: GAME.ACTIONS.MOVE,
        avaliableMoviments: firebase.database.ServerValue.increment(-1),
        avaliableCells: newAvaliableCells,
      });
      userRef.update({ position: lineId + cellIndex });
      resolve();
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
