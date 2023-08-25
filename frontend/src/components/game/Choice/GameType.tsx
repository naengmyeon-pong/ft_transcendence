'use client';

import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';

export default function GameType({
  setGameType,
}: {
  setGameType: React.Dispatch<React.SetStateAction<string>>;
}) {
  const handleGameType = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGameType(event.currentTarget.value);
  };

  return (
    <>
      <FormControl>
        <FormLabel id="game-mode-selection">게임 타입</FormLabel>
        <RadioGroup
          aria-labelledby="game-mode-selection"
          name="radio-buttons-group"
          onChange={handleGameType}
        >
          <FormControlLabel
            value="normal"
            control={<Radio />}
            label="일반 게임"
          />
          <FormControlLabel
            value="rank"
            control={<Radio />}
            label="랭크 게임"
          />
        </RadioGroup>
      </FormControl>
    </>
  );
}
