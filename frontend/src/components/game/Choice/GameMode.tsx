'use client';

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

export default function GameMode({
  setGameMode,
}: {
  setGameMode: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleGameMode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGameMode(event.currentTarget.value);
  };

  return (
    <>
      <FormControl>
        <FormLabel id="game-type-selection">게임 난이도</FormLabel>
        <RadioGroup
          aria-labelledby="game-type-selection"
          name="radio-buttons-group"
          onChange={handleGameMode}
        >
          <FormControlLabel
            value="easy"
            control={<Radio />}
            label="일반 모드"
          />
          <FormControlLabel
            value="hard"
            control={<Radio />}
            label="가속 모드"
          />
        </RadioGroup>
      </FormControl>
    </>
  );
}
