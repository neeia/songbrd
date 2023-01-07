import { answerContainer, bigWord, controlsContainer, footer, gameControlButton, gameMode, wordCount } from "./Game.css";
import { GameSettings, GameState, Mode, State } from "types/game";
import { BiChevronLeft, BiDoorOpen, BiExit, BiMicrophone, BiNotepad, BiSkipNext } from "react-icons/bi";
import { iconButton, mobileHidden, startButton, startDesc, startImg, startLabel } from "styles/app.css";
import Song from "../menu/Song";
import GameOver from "./GameOver";
import Review from "./Review";
import Autocomplete from "../Autocomplete";
import { Track } from "types/playlist";
import { useState } from "react";

interface Props {
  game: State;
  settings: GameSettings;
  tracks: Track[];
  skipWord: () => void;
  getWord: () => void;
  guess: (track: Track) => void;
  endGame: () => void;
  exit: () => void;
  restart: () => void;
  review: () => void;
}
const Game = (props: Props) => {
  const { game, settings, tracks, skipWord, getWord, guess, endGame, exit, restart, review } = props;

  const [track, setTrack] = useState<Track | undefined>();

  switch (game.state) {
    case GameState.GUESSING:
    case GameState.ANSWERS:
      return <>
        <div>
          <br />
          <div className={wordCount}>
            Word {game.history.length + 1}{settings.wordLimit[game.mode] > 0 && ` of ${settings.wordLimit[game.mode]}`}
          </div>
          <div className={bigWord}>
            {game.activeWord.word.toLocaleUpperCase()}
          </div>
        </div>
        {game.typing && <div>
          <Autocomplete key={game.activeWord.word}
            track={track}
            setTrack={setTrack}
            tracks={tracks.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))}
          />
        </div>}
        <div className={controlsContainer}>
          <button className={gameControlButton} onClick={skipWord}>
            <BiSkipNext size="48px" />
            Skip
          </button>
          <button
            className={gameControlButton}
            disabled={game.state === GameState.ANSWERS || (game.typing && !track)}
            onClick={ game.typing ? () => guess(track!) : getWord }
          >
            <BiMicrophone size="48px" />
            {game.typing ? "Submit" : "Done"}
          </button>
          {game.mode === Mode.REHEARSAL &&
            <button className={gameControlButton} disabled={game.state === GameState.ANSWERS} onClick={endGame}>
              <BiExit size="48px" />
              End
            </button>
          }
        </div>
        {game.state === GameState.ANSWERS
          && <>
            <br />
            <div>Answers</div>
            <div className={answerContainer}>
              {game.activeWord.songs.slice(0, 3).map((t, i) => <Song track={t} key={i} />)}
              <span className={wordCount}>
                {game.activeWord.songs.slice(3).length > 0 && `+ ${game.activeWord.songs.slice(3).length} more`}
              </span>
            </div>
          </>
        }
        <div className={footer}>
          <div>
            Score: {game.history.filter(w => w.solved).length}
          </div>
          <br />
          <hr />
          <div className={gameMode}>
            <button className={`${iconButton} ${mobileHidden}`} onClick={exit}>
              <BiChevronLeft size="24px" />
            </button>
            {game.mode.toString()}
          </div>
        </div>
      </>
    case GameState.END:
      return <GameOver score={game.history.filter(w => w.solved).length} maxScore={game.history.length}>
        <button className={startButton} onClick={restart}>
          <div className={startImg}>𝄇</div>
          <label className={startLabel}>Encore</label>
          <div className={startDesc}>One more, from the top.</div>
        </button>
        <button className={startButton} onClick={review}>
          <BiNotepad size="32px" className={startImg} />
          <label className={startLabel}>Review</label>
          <div className={startDesc}>Check for your mistakes.</div>
        </button>
        <button className={startButton} onClick={exit}>
          <BiDoorOpen size="32px" className={startImg} />
          <label className={startLabel}>Take a Bow</label>
          <div className={startDesc}>Head backstage and relax.</div>
        </button>
      </GameOver>
    case GameState.REVIEW:
      return <Review history={game.history} />
    default:
      return null;
  }
}

export default Game;