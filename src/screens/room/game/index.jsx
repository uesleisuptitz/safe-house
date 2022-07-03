// import Board from "./board";
import UserRolls from "./user-rolls";

const Game = ({ myUserId, room, roomId }) => {
  return (
    <>
      <UserRolls myUserId={myUserId} room={room} roomId={roomId} />
      {/* <Board myUserId={myUserId} /> */}
    </>
  );
};

export default Game;
