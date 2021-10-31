/**
 * @class Model
 * Manages the data of the application.
 */
class Model {
  constructor(_width, _height) {
    this.width = _width;
    this.height = _height;
    this.board = Array(_height * _width).fill();

    this.finishedGame = false;
    this.currentPlayer = '🟡';
    this.victoryEvent = new Event();
    this.drawEvent = new Event();
    this.updateEvent = new Event();
    this.switchPlayerEvent = new Event();
  }

  play(move) {
    if (
      this.finished ||
      move < 0 ||
      move > this.height * this.width - 1 ||
      this.board[move]
    ) {
      return false;
    }

    while (
      move <= this.width * (this.height - 1) - 1 &&
      !this.board[move + this.width]
    ) {
      move += this.width;
    }

    this.board[move] = this.currentPlayer;
    this.updateEvent.trigger(this.board);

    if (this.checkVictory() || this.checkDraw()) {
      this.finishedGame = true;
    }

    if (!this.finishedGame) {
      this.switchPlayer();
      this.switchPlayerEvent.trigger(this.currentPlayer);
    }

    return true;
  }

  #checkFour(a, b, c, d) {
    if (
      this.board[a] &&
      this.board[a] === this.board[b] &&
      this.board[b] === this.board[c] &&
      this.board[c] === this.board[d]
    ) {
      return true;
    }
  }

  checkVictory() {
    const check = () => {
      // horizontalCheck
      for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width - 3; i++) {
          let first = j * this.width + i;
          let second = j * this.width + i + 1;
          let theard = j * this.width + i + 2;
          let fourth = j * this.width + i + 3;

          if (this.#checkFour(first, second, theard, fourth)) {
            return true;
          }
        }
      }

      // verticalCheck
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height - 3; j++) {
          let first = j * this.width + i;
          let second = (j + 1) * this.width + i;
          let theard = (j + 2) * this.width + i;
          let fourth = (j + 3) * this.width + i;

          if (this.#checkFour(first, second, theard, fourth)) {
            return true;
          }
        }
      }
      // ascendingDiagonalCheck
      for (let j = 0; j < this.height - 3; j++) {
        for (let i = 0; i < this.width - 3; i++) {
          let first = j * this.width + i;
          let second = (j + 1) * this.width + i + 1;
          let theard = (j + 2) * this.width + i + 2;
          let fourth = (j + 3) * this.width + i + 3;

          if (this.#checkFour(first, second, theard, fourth)) {
            return true;
          }
        }
      }
      //DECENDING DiagonalCheck
      for (let j = 0; j < this.height - 3; j++) {
        for (let i = 3; i < this.width; i++) {
          let first = j * this.width + i;
          let second = (j + 1) * this.width + i - 1;
          let theard = (j + 2) * this.width + i - 2;
          let fourth = (j + 3) * this.width + i - 3;

          if (this.#checkFour(first, second, theard, fourth)) {
            return true;
          }
        }
      }
    };

    if (check()) {
      this.victoryEvent.trigger(this.currentPlayer);
    }

    return check();
  }

  checkDraw() {
    if (this.board.every((i) => i)) {
      this.drawEvent.trigger();
    }
    return this.board.every((i) => i);
  }

  switchPlayer() {
    if (this.currentPlayer === '🟡') {
      this.currentPlayer = '🔴';
    } else {
      this.currentPlayer = '🟡';
    }
  }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
  constructor() {
    this.playEvent = new Event();
  }

  createBoard(board) {
    let table = this.createElement('div', [], ['board']);

    this.cells = Array(board.length)
      .fill()
      .map((_, i) => {
        const cell = this.createElement('div', [], ['cell']);
        if (board[i]) {
          cell.append(board[i]);
        }
        cell.addEventListener('click', () => {
          this.playEvent.trigger(i);
        });

        table.append(cell);
      });

    return table;
  }

  render(board) {
    document.getElementById('table').innerHTML = '';

    this.message = document.createElement('div');
    this.message.className = 'message';
    this.turnOf();

    document.getElementById('table').append(this.createBoard(board));
    document.getElementById('table').append(this.message);
  }

  victory(winner) {
    this.message.innerHTML = `${winner} wins!`;
  }

  draw() {
    this.message.innerHTML = "It's a draw!";
  }

  turnOf(player) {
    this.message.innerHTML = `It's turn of ${player}`;
  }

  createElement(
    tagName,
    children = [],
    classes = [],
    attributes = {},
    eventListeners = {}
  ) {
    let el = document.createElement(tagName);
    //Adding children
    for (const child of children) {
      el.append(child);
    }
    //Adding classes
    for (const cls of classes) {
      el.classList.add(cls);
    }
    //Adding attributes
    for (const attr in attributes) {
      el.setAttribute(attr, attributes[attr]);
    }
    //Adding events
    for (const event in eventListeners) {
      el.addEventListener(event, eventListeners[event]);
    }
    return el;
  }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
  #model;
  #view;
  constructor(model, view) {
    this.#model = model;
    this.#view = view;

    this.#view.playEvent.addListener((move) => this.#model.play(move));
    this.#model.switchPlayerEvent.addListener((player) => {
      this.#view.turnOf(player);
    });
    this.#model.updateEvent.addListener((data) => this.#view.render(data));
    this.#model.victoryEvent.addListener((winner) =>
      this.#view.victory(winner)
    );
    this.#model.drawEvent.addListener(() => this.#view.draw());
  }

  run() {
    this.#view.render(this.#model.board);
    this.#view.turnOf(this.#model.currentPlayer);
  }
}

class Event {
  constructor() {
    this.listeners = [];
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  trigger(params) {
    this.listeners.forEach((listener) => {
      listener(params);
    });
  }
}

const app = new Controller(new Model(7, 7), new View());

app.run();
document.getElementById('restart').addEventListener('click', () => {
  location.reload();
});
