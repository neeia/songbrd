import { useState } from "react";
import { BiCodeAlt, BiHelpCircle } from "react-icons/bi";
import { iconButton, settingsContainer } from "styles/app.css";
import { GameSettings } from "types/game";
import Menu from "./Menu";

interface Props {
  settings: GameSettings;
  setSettings: (settings: GameSettings) => void;
}
const ControlPane = (props: Props) => {

  const [help, openHelp] = useState(false);
  const closeHelp = () => openHelp(false);

  return <div role="group" className={settingsContainer}>
    <button className={iconButton} onClick={() => openHelp(true)}>
      <BiHelpCircle size="32px" />
    </button>
    <Menu open={help} onClose={closeHelp} title="About">
      <h3>What is Songbird?</h3>
      <p>
        Songbird is a personalized web-based version of the
        <a href="https://www.elle.com/song-association/" target="_blank" rel="noopener noreferrer"> Song Association </a>
        game. Enter your Spotify ID, choose a playlist, and get started!
      </p>
      <h3>What is Song Association?</h3>
      <p>
        Song Association is a game that tests your ability to remember song lyrics.
        You are given a word, and you must sing a section of a song that contains that word.
        Depending on the mode, you might have a time limit, so think fast! If time&apos;s up before you get to your word,
        then you lose that word. If you get your word out, then you earn a point. Once the game ends, you
        tally up all your points, and that&apos;s your score.
      </p>
      <h3>What are the game modes?</h3>
      <p>
        <b>Standard Mode</b> is the original way to play. Each word has a short time limit,
        and up to fifteen words are given. Score is given as a number out of fifteen.
      </p>
      <p>
        <b>Blitz Mode</b> is a fast-paced round. Within the total time limit of two minutes,
        you must answer as many words as possible. Score is given as a flat amount of points.
      </p>
      <p>
        <b>Rehearsal Mode</b> is a casual, relaxed mode. In rehearsal mode, there is no time
        or word limit. Score is given as a percentage of words answered.
      </p>
      <h3>How does it work?</h3>
      <p>
        Once you link your Spotify account, you can choose a playlist to generate words from.
        Songbird will then find all of the lyrics to each and every song in that playlist,
        and once everything&apos;s finished, you can start receiving words. The words are
        carefully chosen by an algorithm that weighs the frequency of each word with the
        number of songs that word appears in, in order to carefully control the difficulty.
        These settings are adjustable in the settings menu.
      </p>
    </Menu>
    <a className={iconButton} href="https://github.com/neeia/songbrd" target="_blank" rel="noopener noreferrer">
      <BiCodeAlt size="32px" />
    </a>
  </div>
}

export default ControlPane;