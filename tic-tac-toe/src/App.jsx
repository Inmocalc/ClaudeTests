import { useState } from 'react';
import './App.css';

function Square({ value, onSquareClick, isWinning }) {
  return (
    <button
      className={`square ${isWinning ? 'winning' : ''} ${value === 'X' ? 'x-player' : value === 'O' ? 'o-player' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winningLine }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `${winner} Gana!`;
  } else if (squares.every(square => square)) {
    status = 'Empate!';
  } else {
    status = `Turno: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board">
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onSquareClick={() => handleClick(i)}
            isWinning={winningLine && winningLine.includes(i)}
          />
        ))}
      </div>
    </>
  );
}

function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    const winner = calculateWinner(nextSquares);
    if (winner) {
      setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
    } else if (nextSquares.every(square => square)) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    }
  }

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }

  function resetScores() {
    setScores({ X: 0, O: 0, draws: 0 });
    resetGame();
  }

  const winningLine = calculateWinner(currentSquares, true);

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">
          <span className="emoji">🎮</span> Tres en Raya <span className="emoji">🎮</span>
        </h1>

        <div className="scoreboard">
          <div className="score-item x-score">
            <div className="score-label">Jugador X</div>
            <div className="score-value">{scores.X}</div>
          </div>
          <div className="score-item draw-score">
            <div className="score-label">Empates</div>
            <div className="score-value">{scores.draws}</div>
          </div>
          <div className="score-item o-score">
            <div className="score-label">Jugador O</div>
            <div className="score-value">{scores.O}</div>
          </div>
        </div>

        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winningLine={winningLine} />

        <div className="button-group">
          <button className="reset-button" onClick={resetGame}>
            Nueva Partida
          </button>
          <button className="reset-button secondary" onClick={resetScores}>
            Reiniciar Marcador
          </button>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares, returnLine = false) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return returnLine ? lines[i] : squares[a];
    }
  }
  return null;
}

export default App;
