import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onGameEnd: (score: number) => void;
  className?: string;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const INITIAL_DIRECTION = { x: 0, y: -1 };

export const SnakeGame: React.FC<SnakeGameProps> = ({ onGameEnd, className }) => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef<number>();

  const generateFood = useCallback((): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  }, []);

  const checkCollision = useCallback((head: Position, snakeBody: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    
    // Self collision
    for (const segment of snakeBody) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    
    return false;
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.x += direction.x;
      head.y += direction.y;
      
      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        return currentSnake;
      }
      
      newSnake.unshift(head);
      
      // Check if food eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, checkCollision, generateFood]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameStarted) {
      if (e.code === 'Space') {
        setGameStarted(true);
        return;
      }
    }
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      case 'Escape':
        onGameEnd(score);
        break;
    }
  }, [direction, gameStarted, onGameEnd, score]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = window.setInterval(moveSnake, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, moveSnake]);

  useEffect(() => {
    if (gameOver) {
      setTimeout(() => onGameEnd(score), 2000);
    }
  }, [gameOver, score, onGameEnd]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

  const renderGrid = () => {
    const grid = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let cellType = 'empty';
        
        // Check if this is snake body
        const isSnakeBody = snake.some(segment => segment.x === x && segment.y === y);
        const isSnakeHead = snake[0] && snake[0].x === x && snake[0].y === y;
        const isFood = food.x === x && food.y === y;
        
        if (isSnakeHead) cellType = 'head';
        else if (isSnakeBody) cellType = 'body';
        else if (isFood) cellType = 'food';
        
        grid.push(
          <div
            key={`${x}-${y}`}
            className={cn(
              'w-4 h-4 border border-green-800/30',
              {
                'bg-lime-400': cellType === 'head',
                'bg-green-500': cellType === 'body',
                'bg-red-500': cellType === 'food',
                'bg-black/50': cellType === 'empty'
              }
            )}
          />
        );
      }
    }
    
    return grid;
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4 p-4", className)}>
      <div className="text-center text-green-400 font-mono">
        <h2 className="text-xl font-bold mb-2">🐍 SNAKE GAME</h2>
        <div className="flex justify-center gap-8 text-sm">
          <span>Score: {score}</span>
          <span>High Score: {Math.max(score, parseInt(localStorage.getItem('snakeHighScore') || '0'))}</span>
        </div>
      </div>

      <div 
        className="grid grid-cols-20 gap-0 border-2 border-green-400/50 bg-black/80 p-2"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {renderGrid()}
      </div>

      <div className="text-center text-green-400 font-mono text-sm space-y-2">
        {!gameStarted && !gameOver && (
          <div>
            <p>Press SPACE to start</p>
            <p>Use arrow keys to control</p>
          </div>
        )}
        
        {gameOver && (
          <div>
            <p className="text-red-400 font-bold">GAME OVER!</p>
            <p>Final Score: {score}</p>
            <button 
              onClick={resetGame}
              className="mt-2 px-4 py-1 border border-green-400 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
        
        {gameStarted && !gameOver && (
          <p>Press ESC to quit</p>
        )}
      </div>
    </div>
  );
};
