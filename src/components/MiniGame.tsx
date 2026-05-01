import { useState } from "react";

type Player = "X" | "O" | null;

export default function MiniGame() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
      <div className="mb-4 text-sm font-bold text-foreground">
        {winner ? `Winner: ${winner} 🎉` : isDraw ? "It's a draw! 🤝" : `Next player: ${xIsNext ? "X" : "O"}`}
      </div>
      <div className="grid grid-cols-3 gap-2 mx-auto w-48 mb-4">
        {board.map((square, i) => (
          <button
            key={i}
            className="h-14 rounded-lg bg-muted text-2xl font-bold flex items-center justify-center hover:bg-muted/80 transition"
            onClick={() => handleClick(i)}
          >
            <span className={square === "X" ? "text-primary" : "text-foreground"}>{square}</span>
          </button>
        ))}
      </div>
      {(winner || isDraw) && (
        <button
          onClick={reset}
          className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
