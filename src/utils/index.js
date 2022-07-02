export const getUniqueId = () => {
  if (window) {
    var navigator_info = window.navigator;
    var screen_info = window.screen;
    var uid = navigator_info.mimeTypes.length;
    uid += navigator_info.userAgent.replace(/\D+/g, "");
    uid += navigator_info.plugins.length;
    uid += screen_info.height || "";
    uid += screen_info.width || "";
    uid += screen_info.pixelDepth || "";
    return uid;
  } else return 0;
};

export const rollDice = () => 1 + Math.floor(Math.random() * 6);

export const getNextLineBoardId = (id) => {
  let letters = Object.entries(BOARD).map((array) => array[0]);
  return letters[letters.findIndex((value) => value === id) - 1];
};

const BOARD_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8];

export const BOARD = {
  a: BOARD_COLUMNS,
  b: BOARD_COLUMNS,
  c: BOARD_COLUMNS,
  d: BOARD_COLUMNS,
  e: BOARD_COLUMNS,
  f: BOARD_COLUMNS,
  g: BOARD_COLUMNS,
  h: BOARD_COLUMNS,
  i: BOARD_COLUMNS,
  j: BOARD_COLUMNS,
  k: BOARD_COLUMNS,
  l: BOARD_COLUMNS,
};

const STATUS = {
  WAITING: "waiting", //esperando jogadores entrarem
  PLAYING: "playing", //jogando
  FINISHED: "finished", //jogo encerrado
};

const ACTION = {
  ROLL_INIT: {
    action: "roll_init", //Role o dado para começar
  },
  ROLL: {
    action: "roll", //Role os dados para movimentar
  },
};

const ACTIONS = [
  {
    userId: "1", //id usuário || 'all_users' = todos usuários || 'game' = jogo
    ...ACTION.ROLL_INIT,
  },
];

const ZOMBIES = [
  {
    id: 1,
    position: "k7",
  },
  {
    id: 2,
    position: "j3",
  },
  {
    id: 3,
    position: "h6",
  },
  {
    id: 4,
    position: "f7",
  },
  {
    id: 5,
    position: "f2",
  },
  {
    id: 6,
    position: "e5",
  },
  {
    id: 7,
    position: "c1",
  },
  {
    id: 8,
    position: "b3",
  },
  {
    id: 9,
    position: "b8",
  },
  {
    id: 10,
    position: "a6",
  },
];

const MODEL = {
  maxUsers: 2,
  name: "Nome da sala",
  owner: "Nome do dono da sala",
  status: STATUS.WAITING,
};

export const GAME = {
  MODEL,
  STATUS,
  ZOMBIES,
};

const GAME_EXAMPLE = {
  maxUsers: 2,
  name: "Nome da sala",
  owner: "Nome do dono da sala",
  status: STATUS.WAITING,
  users: {
    1: {
      username: "Jogador 1",
      initRollValue: 6,
    },
  },
  zombies: ZOMBIES,
  actions: ACTIONS,
};
