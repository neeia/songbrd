import { useState } from "react";
import { BiCodeAlt, BiCog, BiHelpCircle } from "react-icons/bi";
import { iconButton, settingsContainer } from "../styles/app.css";
import Menu from "./Menu";

const ControlPane = () => {

  const [settings, openSettings] = useState(false);
  const closeSettings = () => openSettings(false);
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
    <button className={iconButton} onClick={() => openSettings(true)}>
      <BiCog size="32px" />
    </button>
    <Menu open={settings} onClose={closeSettings} title="Settings">
      Dark Theme
      <button className={iconButton}>
      </button>
      Feedback
      Version
    </Menu>
    <a className={iconButton} href="https://github.com/neeia/songbrd" target="_blank" rel="noopener noreferrer">
      <BiCodeAlt size="32px" />
    </a>
  </div>
}

export default ControlPane;