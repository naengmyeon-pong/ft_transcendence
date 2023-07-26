import React, {
  RefObject,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';

interface Velocity {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

interface Ball {
  pos: Coordinate;
  vel: Velocity;
}

const KEY_CODES = {
  S: 's',
  W: 'w',
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
};

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

const PADDLE_STEP_SIZE = 10;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const PADDLE_DISTANCE_FROM_WALL = 20;

const BALL_RADIUS = 10;
const BALL_SPEED = 3;

const isCollidingPaddle = (ball: Ball, paddle: Coordinate): boolean => {
  const isCollidingPaddleLeft = paddle.x <= ball.pos.x + BALL_RADIUS;
  const isCollidingPaddleRight =
    paddle.x + PADDLE_WIDTH >= ball.pos.x - BALL_RADIUS;
  const isCollidingPaddleTop = paddle.y <= ball.pos.y + BALL_RADIUS;
  const isCollidingPaddleBottom =
    paddle.y + PADDLE_HEIGHT >= ball.pos.y - BALL_RADIUS;

  return (
    isCollidingPaddleLeft &&
    isCollidingPaddleRight &&
    isCollidingPaddleTop &&
    isCollidingPaddleBottom
  );
};

function Game() {
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
    x: CANVAS_WIDTH - PADDLE_DISTANCE_FROM_WALL,
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
  const ballDirectionRef = useRef<'left' | 'right'>('left');
  const keyStateRef = useRef<{[key: string]: boolean}>({});
  const requestAnimationIdRef = useRef<number>(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keyStateRef.current[event.key] = true;
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    keyStateRef.current[event.key] = false;
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

  const maxY = useMemo(() => CANVAS_HEIGHT - PADDLE_HEIGHT, []);
  const minY = useMemo(() => 0, []);

  const updatePaddlePosition = useCallback(
    (paddle: Coordinate, keyUp: string, keyDown: string) => {
      const newY =
        paddle.y +
        (keyStateRef.current[keyDown] ? PADDLE_STEP_SIZE : 0) -
        (keyStateRef.current[keyUp] ? PADDLE_STEP_SIZE : 0);

      const clampedY = Math.max(minY, Math.min(newY, maxY));
      return {...paddle, y: clampedY};
    },
    [maxY, minY]
  );

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

  const resetBall = useCallback(() => {
    if (ballDirectionRef.current === 'left') {
      ballDirectionRef.current = 'right';
    } else {
      ballDirectionRef.current = 'left';
    }

    setBall(() => ({
      pos: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
      },
      vel: {
        x: ballDirectionRef.current === 'left' ? -1 : 1, // Calculate initial direction based on the current position
        y: 0,
      },
    }));
  }, [ballDirectionRef]);

  const updateBallPosition = useCallback(() => {
    setBall(prevBall => {
      const nextBall: Ball = {
        pos: {x: prevBall.pos.x, y: prevBall.pos.y},
        vel: {x: prevBall.vel.x, y: prevBall.vel.y},
      };

      nextBall.pos.x = prevBall.pos.x + BALL_SPEED * prevBall.vel.x;
      nextBall.pos.y = prevBall.pos.y + BALL_SPEED * prevBall.vel.y;

      // Check if the ball is colliding with the left or right walls
      const isOutOfBoundsLeft = nextBall.pos.x - BALL_RADIUS <= 0;
      const isOutOfBoundsRight = nextBall.pos.x + BALL_RADIUS >= CANVAS_WIDTH;

      if (isOutOfBoundsLeft || isOutOfBoundsRight) {
        if (isOutOfBoundsLeft) {
          setRightScore(prevScore => prevScore + 1);
        } else {
          setLeftScore(prevScore => prevScore + 1);
        }
        resetBall();
        return prevBall; // Return the previous ball state to avoid multiple resets in one frame
      }

      // Check if the ball is colliding with the top or bottom walls
      const isCollidingTop = nextBall.pos.y - BALL_RADIUS <= 0;
      const isCollidingBottom = nextBall.pos.y + BALL_RADIUS >= CANVAS_HEIGHT;

      if (isCollidingTop || isCollidingBottom) {
        if (isCollidingTop) {
          nextBall.pos.y = 0 + BALL_RADIUS;
        } else {
          nextBall.pos.y = CANVAS_HEIGHT - BALL_RADIUS;
        }
        nextBall.vel.y = -prevBall.vel.y;
      }

      const paddle = nextBall.vel.x < 0 ? leftPaddle : rightPaddle;

      if (isCollidingPaddle(nextBall, paddle)) {
        let collidePoint = nextBall.pos.y - (paddle.y + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);

        const angleRadian = (Math.PI / 4) * collidePoint;
        const direction =
          nextBall.pos.x + BALL_RADIUS < CANVAS_WIDTH / 2 ? 1 : -1;
        nextBall.vel.x = direction * BALL_SPEED * Math.cos(angleRadian);
        nextBall.vel.y = BALL_SPEED * Math.sin(angleRadian);
      }

      return nextBall;
    });
  }, [leftPaddle, rightPaddle, resetBall]);

  const drawScores = useCallback(() => {
    if (ctx) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText(leftScore.toString(), CANVAS_WIDTH / 4, 50);
      ctx.fillText(rightScore.toString(), (3 * CANVAS_WIDTH) / 4, 50);
    }
  }, [ctx, leftScore, rightScore]);

  const onAnimation = useCallback(() => {
    setLeftPaddle(prevPaddle =>
      updatePaddlePosition(prevPaddle, KEY_CODES.W, KEY_CODES.S)
    );
    setRightPaddle(prevPaddle =>
      updatePaddlePosition(prevPaddle, KEY_CODES.ARROW_UP, KEY_CODES.ARROW_DOWN)
    );
    updateBallPosition();

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
  }, [
    ctx,
    leftPaddle,
    rightPaddle,
    updatePaddlePosition,
    updateBallPosition,
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
      <p>game</p>
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} />
    </>
  );
}

export default Game;
