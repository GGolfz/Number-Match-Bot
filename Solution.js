const width = 9;
const allDirection = [
  [0, 1], // right
  [1, -1], // bottom-left
  [1, 0], // bottom
  [1, 1], // bottom-right
];
const isMatch = (num1, num2) => {
  return num1 === num2 || num1 + num2 === 10;
};
const checkDirection = (
  board,
  current,
  currentY,
  currentX,
  directionY,
  directionX
) => {
  const height = board.length;
  while (
    currentY + directionY >= 0 &&
    currentY + directionY < height &&
    currentX + directionX >= 0 &&
    currentX + directionX <= width
  ) {
    currentY += directionY;
    currentX += directionX;
    if (currentX === width && currentY + 1 < height) {
      if (directionX === 1 && directionY === 0) {
        // for right direction check to next line
        currentX = 0;
        currentY += 1;
      } else {
        return null;
      }
    }
    const value = board[currentY][currentX];
    if (value !== 0) {
      if (isMatch(current, value)) return [currentY, currentX];
      return null;
    }
  }
  return null;
};

const play = (board) => {
  let validPosition = [];
  const height = board.length;
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      for (let direction of allDirection) {
        const current = board[i][j];
        const match = checkDirection(
          board,
          current,
          i,
          j,
          direction[0],
          direction[1]
        );
        if (match !== null) {
          validPosition.push({
            x: j,
            y: i,
            matchX: match[1],
            matchY: match[0],
          });
        }
      }
    }
  }
  return validPosition;
};

const clearBoard = (board) => {
  let newBoard = [];
  for (let row of board) {
    if (row.filter((r) => r === 0).length !== 9) {
      newBoard.push(row);
    }
  }
  return newBoard;
};
const copyBoard = (board) => {
  let newArray = [];
  for (var i = 0; i < board.length; i++) newArray[i] = board[i].slice();
  return newArray;
};

const calculateBoardScore = (board) => {
  return board
    .map((row) => row.filter((r) => r !== 0).length)
    .reduce((prev, cur) => prev + cur, 0);
};
const actionBoard = (board, allState, withReport = false) => {
  let newBoard = copyBoard(board);
  for (let move of allState) {
    const height = newBoard.length;
    for (let y = 0; y < height; y++) {
      let str = "";
      for (let x = 0; x < width; x++) {
        const isPositionMatched =
          (x === move.x && y === move.y) ||
          (x === move.matchX && y === move.matchY);
        if (isPositionMatched) {
          str += `\x1b[38;5;82m${newBoard[y][x]}\x1b[0m `;
          newBoard[y][x] = 0;
        } else {
          str += `\x1b[38;5;8m${newBoard[y][x]}\x1b[0m `;
        }
      }
      console.log(str);
    }
    newBoard = clearBoard(newBoard);
    console.log("=================================================");
  }
  if (withReport) {
    const boardScore = calculateBoardScore(newBoard);
    if (boardScore === 0) {
      console.log("\x1b[32mWIN!!!\x1b[0m");
    } else {
      console.log(newBoard.map((row) => row.join(" ")).join("\n"));
      console.log("=================================================");
      console.log("\x1b[31mNo more valid move!\x1b[0m");
    }
  }
  return newBoard;
};
const calculate = (board, previousState = []) => {
  if (previousState.length === MAX_FORECAST) {
    const boardScore = calculateBoardScore(board);
    return [boardScore, previousState];
  }
  const validPosition = play(board);
  if (validPosition.length > 0) {
    let minimumBoardScore = Number.MAX_SAFE_INTEGER;
    let allState = [];
    for (let i = 0; i < validPosition.length; i++) {
      let newBoard = copyBoard(board);
      newBoard[validPosition[i].y][validPosition[i].x] = 0;
      newBoard[validPosition[i].matchY][validPosition[i].matchX] = 0;
      newBoard = clearBoard(newBoard);
      let [boardScore, state] = calculate(newBoard, [
        ...previousState,
        validPosition[i],
      ]);
      if (boardScore < minimumBoardScore) {
        minimumBoardScore = boardScore;
        allState = state;
      }
    }
    return [minimumBoardScore, allState];
  } else {
    const boardScore = calculateBoardScore(board);
    return [boardScore, previousState];
  }
};
// limit number of forecast to prevent long calculation
const MAX_FORECAST = 5;
const main = () => {
  const board = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0, 0],
    [6, 9, 6, 0, 1, 2, 6, 9, 6],
    [1, 2, 6, 9, 6, 1, 2, 6, 9],
    [6, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  let newBoard = copyBoard(board);
  console.log(newBoard.map((row) => row.join(" ")).join("\n"));
  console.log("=================================================");

  let minimumBoardScore = Number.MAX_SAFE_INTEGER;
  let [boardScore, state] = calculate(newBoard);
  while (boardScore !== minimumBoardScore) {
    if (minimumBoardScore > boardScore) {
      minimumBoardScore = boardScore;
    }
    newBoard = actionBoard(newBoard, state, false);
    [boardScore, state] = calculate(newBoard);
  }
  actionBoard(newBoard, state, true);
};

main();
