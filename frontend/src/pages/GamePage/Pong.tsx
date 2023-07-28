import React, {
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import {Socket} from 'socket.io-client';

import {Coordinate, Ball, GameInfo} from '@/types/game';

const KEY_CODES = {
  S: 's',
  W: 'w',
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;

const BALL_RADIUS = 10;

Pong.defaultProps = {
  socket: null,
};

interface PongProps {
  socket: Socket | null;
  gameInfo: GameInfo | null;
}

function Pong({socket, gameInfo}: PongProps) {
  const canvasRef: RefObject<HTMLCanvasElement> =
    useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [leftScore, setLeftScore] = useState<number>(0);
  const [rightScore, setRightScore] = useState<number>(0);
  const [leftPaddle, setLeftPaddle] = useState<Coordinate>({
    x: 0,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  });
  const [rightPaddle, setRightPaddle] = useState<Coordinate>({
    x: CANVAS_WIDTH - PADDLE_WIDTH,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  });
  const [ball, setBall] = useState<Ball>({
    pos: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    },
    vel: {
      x: -1,
      y: 0,
    },
  });
  const keyStateRef = useRef<{[key: string]: boolean}>({});
  const requestAnimationIdRef = useRef<number>(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (
      event.key !== KEY_CODES.ARROW_DOWN &&
      event.key !== KEY_CODES.ARROW_UP
    ) {
      return;
    }
    keyStateRef.current[event.key] = true;
    if (socket) {
      socket.emit('update_key', {
        room_name: sessionStorage.getItem('room_name'),
        up: keyStateRef.current[KEY_CODES.ARROW_UP],
        down: keyStateRef.current[KEY_CODES.ARROW_DOWN],
      });
    }
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (
      event.key !== KEY_CODES.ARROW_DOWN &&
      event.key !== KEY_CODES.ARROW_UP
    ) {
      return;
    }
    keyStateRef.current[event.key] = false;
    if (socket) {
      socket.emit('update_key', {
        room_name: sessionStorage.getItem('room_name'),
        up: keyStateRef.current[KEY_CODES.ARROW_UP],
        down: keyStateRef.current[KEY_CODES.ARROW_DOWN],
      });
    }
  }, []);

  // Setting for context
  useEffect(() => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      setCtx(ctx);

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [canvasRef, handleKeyDown, handleKeyUp]);

  const drawPaddle = useCallback(
    (paddle: Coordinate) => {
      if (ctx !== null) {
        ctx.fillRect(paddle.x, paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      }
    },
    [ctx]
  );

  const drawBorder = useCallback(() => {
    if (ctx !== null) {
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [ctx]);

  const drawMiddleLine = useCallback(() => {
    if (ctx !== null) {
      ctx.strokeStyle = 'grey';
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(CANVAS_WIDTH / 2, 0);
      ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      ctx.stroke();
    }
  }, [ctx]);

  const drawBall = useCallback(() => {
    if (ctx !== null) {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.setLineDash([]);
      ctx.arc(ball.pos.x, ball.pos.y, BALL_RADIUS, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [ctx, ball]);

  const drawScores = useCallback(() => {
    if (ctx) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(leftScore.toString(), CANVAS_WIDTH / 4, 50);
      ctx.fillText(rightScore.toString(), (3 * CANVAS_WIDTH) / 4, 50);
    }
  }, [ctx, leftScore, rightScore]);

  const onAnimation = useCallback(() => {
    if (gameInfo) {
      setRightPaddle(gameInfo.rightPaddle);
      setLeftPaddle(gameInfo.leftPaddle);
      setBall(gameInfo.ball);
      setLeftScore(gameInfo.leftScore);
      setRightScore(gameInfo.rightScore);
    }

    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBorder();
      drawMiddleLine();
      drawBall();
      drawPaddle(leftPaddle);
      drawPaddle(rightPaddle);
      drawScores();
    }

    requestAnimationIdRef.current = window.requestAnimationFrame(onAnimation);
    window.cancelAnimationFrame(requestAnimationIdRef.current);
  }, [
    ctx,
    gameInfo,
    drawBorder,
    drawBall,
    drawMiddleLine,
    drawPaddle,
    drawScores,
  ]);

  useEffect(() => {
    requestAnimationIdRef.current = window.requestAnimationFrame(onAnimation);

    return () => {
      window.cancelAnimationFrame(requestAnimationIdRef.current);
    };
  }, [onAnimation]);

  return (
    <>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </>
  );
}

export default Pong;
