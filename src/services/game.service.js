import "./firebase";
import firebase from "firebase/app";
import "firebase/database";
import { GAME, getNextLineBoardId } from "../utils";

const db = firebase.database();

//OWNER GAME RULES CONTROL
export const firebaseGameRulesStart = (roomId) => {
  const roomRef = db.ref(`rooms/${roomId}`);
  const turnRef = db.ref(`rooms/${roomId}/turn`);

  roomRef.on("value", (data) => {
    let room = data.val();
    if (room) {
      //-------------------DECLARATIONS
      let { turn, users } = room;
      let usersArray = !users
        ? []
        : Object.entries(users).map((array) => ({
            id: array[0],
            ...array[1],
          }));
      let turnUser = users && turn ? users[turn.userId] : false;

      //-------------------TESTS
      const gameIsInInitialRollAndAllUsersRolled = (action) =>
        action === GAME.ACTIONS.ROLL_INIT &&
        usersArray.filter((user) => !user.initRollValue).length === 0;
      const playerMustMoveButDontHaveAvaliableCells = (
        action,
        avaliableMoviments,
        avaliableCells
      ) =>
        action === "move" &&
        avaliableMoviments > 0 &&
        (!avaliableCells || avaliableCells.length === 0);
      const playerDontHaveAnyPosition = () => !turnUser.position;
      const playerDontHaveMoreAvaliableMoviments = (
        action,
        avaliableMoviments
      ) => action === GAME.ACTIONS.MOVE && avaliableMoviments === 0;

      //-------------------CHANGE GAME STATE FUNCTIONS
      const initializeNormalRollTurn = () => {
        let ordenedUsers = usersArray
          .sort((a, b) => b.initRollValue - a.initRollValue)
          .map(({ id }) => id);
        roomRef.update({
          usersSequence: ordenedUsers,
          turn: {
            userId: ordenedUsers[0],
            action: GAME.ACTIONS.ROLL,
          },
        });
        //[!]MOVE ACTIONS FUNCTIONS ARE IN user-rolls.jsx
      };
      const changeAvailableCellsToFirstLineCells = () => {
        turnRef.update({
          avaliableCells: ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8"],
        });
      };
      const prepareAvaliableCells = () => {
        let lineId = turnUser.position[0];
        let cellIndex = parseInt(turnUser.position[1]);
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
          avaliableCells: newAvaliableCells,
        });
      };
      const changeTurnToNextUser = () => {
        let nextUserId = Object.entries(room.usersSequence)
          .map((array, i) =>
            array[1] === turn.userId
              ? room.usersSequence[i + 1]
                ? room.usersSequence[i + 1]
                : room.usersSequence[0]
              : false
          )
          .filter(Boolean)[0];
        turnRef.set({
          userId: nextUserId,
          action: GAME.ACTIONS.ROLL,
        });
      };

      //-------------------RULES
      if (turn) {
        if (gameIsInInitialRollAndAllUsersRolled(turn.action)) {
          initializeNormalRollTurn();
        } else if (
          playerMustMoveButDontHaveAvaliableCells(
            turn.action,
            turn.avaliableMoviments,
            turn.avaliableCells
          )
        ) {
          if (playerDontHaveAnyPosition()) {
            changeAvailableCellsToFirstLineCells();
          } else {
            prepareAvaliableCells();
          }
        } else if (
          playerDontHaveMoreAvaliableMoviments(
            turn.action,
            turn.avaliableMoviments
          )
        ) {
          changeTurnToNextUser();
        }
      }
    }
  });
};
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
