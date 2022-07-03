import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import firebase from "firebase/app";
import "firebase/database";
import { Button, Header, Title, User } from "../../components";
import {
  firebaseEnterTheRoom,
  firebaseExitTheRoom,
  firebaseStartGame,
} from "../../services";
import * as s from "../../styles/global";
import { getUniqueId } from "../../utils";

const db = firebase.database();

const Room = () => {
  // const dispatch = useDispatch();
  // const room = useSelector((state) => state.room);
  const navigate = useNavigate();

  const [room, setRoom] = useState({});
  const [owner, setOwner] = useState(false);
  const [myUserId, setMyUserId] = useState(false);
  let { id } = useParams();
  let localUsername = localStorage.getItem("username");
  let users = room?.users
    ? Object.entries(room.users).map((array) => ({
        id: array[0],
        ...array[1],
      }))
    : [];
  let already = users.length === room.maxUsers;

  const enterTheGame = useCallback((roomId) => {
    let userId = getUniqueId();
    setMyUserId(userId);
    if (userId === roomId) setOwner(true);
    firebaseEnterTheRoom(roomId, userId, localUsername).catch((error) => {
      console.log(`CATCH`, error);
      alert("Ocorreu um erro ao tentar entrar na sala!");
    });
    listenTheGame(roomId, userId);
  }, []);

  const listenTheGame = useCallback((roomId, userId) => {
    var roomRef = db.ref(`rooms/${roomId}`);
    roomRef.on("value", (data) => {
      let roomData = data.val();
      if (roomData) setRoom({ ...roomData, roomId });
      else {
        alert("Conexão perdida!");
        navigate("/");
      }
    });
    // gameRulesStart(roomId, userId);
  }, []);

  const exitTheGame = useCallback(() => {
    firebaseExitTheRoom(id, myUserId).then(() => navigate("/"));
  }, [id, myUserId]);

  const handleStartGame = useCallback(() => {
    firebaseStartGame(id);
  }, [id]);

  useEffect(() => {
    if (id) enterTheGame(id);
  }, [id]);

  return (
    <s.Container>
      <Header />
      {room.status === "playing" ? (
        <div>
          <h1>GAME</h1>
        </div>
      ) : // <Game myUserId={myUserId} />
      room.status === "finished" ? (
        <s.Main>
          <Title legend={`Vencedor: ${room?.userWinner}`} title={room.name} />
          <div>
            {users &&
              users.map((user, i) => (
                <User user={user} key={user.id} index={i} showLabel />
              ))}
          </div>
          <Button
            onClick={() => navigate("/")}
            size="small"
            style={{ marginTop: "40px" }}
          >
            Sair
          </Button>
        </s.Main>
      ) : (
        <s.Main>
          <Title
            legend={
              !room
                ? "Carregando..."
                : already
                ? "Pronto para começar!"
                : "Aguardando jogadores..."
            }
            title={room.name}
          />
          <div>
            {users &&
              users.map((user, i) => (
                <User user={user} key={user.id} index={i} showLabel />
              ))}
          </div>
          {owner && (
            <Button disabled={!already} onClick={handleStartGame}>
              Começar!
            </Button>
          )}
          <Button
            onClick={exitTheGame}
            size="small"
            style={{ marginTop: "40px" }}
          >
            Sair
          </Button>
        </s.Main>
      )}
    </s.Container>
  );
};

export default Room;
