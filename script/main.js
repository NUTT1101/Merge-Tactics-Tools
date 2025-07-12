import { Game } from "./game.js";

window.onload = function () {
  const game = new Game(
    document.getElementById("board"),
    document.getElementById("card-pool"),
    document.getElementById("traits")
  );

  document.getElementById("clear").onclick = () => game.clearBoard();
};
