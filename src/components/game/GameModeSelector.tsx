import { BiInfinite, BiMusic, BiTimeFive } from "react-icons/bi";
import { startButton, startDesc, startImg, startLabel } from "../../styles/app.css";
import { Mode } from "../../types/game";
import { checkbox, checkboxContainer } from "../Switch.css";

interface Props {
  disabled: boolean;
  initGame: (mode: Mode) => void;
  typeGuess: boolean;
  setTypeGuess: (ck: boolean) => void;
}
const GameModeSelector = (props: Props) => {
  const { disabled, initGame, typeGuess, setTypeGuess } = props;
  return <>
    <h3>Modes:</h3>
    <button className={startButton} disabled={disabled} onClick={() => initGame(Mode.STANDARD)}>
      <BiMusic size="36px" className={startImg} />
      <label className={startLabel}>Standard</label>
      <div className={startDesc}>Test your knowledge!</div>
    </button>
    <button className={startButton} disabled={disabled} onClick={() => initGame(Mode.BLITZ)}>
      <BiTimeFive size="36px" className={startImg} />
      <label className={startLabel}>Blitz</label>
      <div className={startDesc}>Race against the clock!</div>
    </button>

    <button className={startButton} disabled={disabled} onClick={() => initGame(Mode.REHEARSAL)}>
      <BiInfinite size="36px" className={startImg} />
      <label className={startLabel}>Rehearsal</label>
      <div className={startDesc}>Hone your skills!</div>
    </button>
    <label className={checkboxContainer}>
      <span>Typing Mode</span>
      <input
        type="checkbox"
        checked={typeGuess}
        className={checkbox}
        onChange={(e) => setTypeGuess(e.target.checked)}
      />
    </label>
  </>
}

export default GameModeSelector;