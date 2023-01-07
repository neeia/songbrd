import { ChangeEvent, useState } from "react";
import { Track } from "../types/playlist";
import { convertTrackToId } from "../util/track";
import { autocomplete, autocompleteItem, autocompleteItemContainer, autoForm, hidden, hiddenItemContainer, songName, submit, textBox } from "./Autocomplete.css";

interface Props {
  track?: Track;
  setTrack: (track: Track | undefined) => void;
  tracks: Track[];
}
const Autocomplete = (props: Props) => {
  const { track, setTrack, tracks } = props;

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  return <form autoComplete="off" className={autoForm}>
    <div className={autocomplete} >
      <input id="myInput"
        type="text"
        className={textBox}
        name="songInput"
        placeholder="Song Name"
        value={search}
        onChange={(e) => {
          setOpen(true);
          setSearch(e.target.value);
          setTrack(undefined);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      <div id="autocomplete-list" className={open ? autocompleteItemContainer : hiddenItemContainer}>
        {tracks.map((track, i) => {
          const match = track.name.toLowerCase().indexOf(search.toLowerCase());
          const imgSrc = track.album.images[0]?.url;
          return <button
            key={convertTrackToId(track)}
            className={`${autocompleteItem} ${!(match + 1) && hidden}`}
            onClick={(e) => {
              e.preventDefault();
              setSearch(track.name);
              setTrack(track);
              setOpen(false);
              //closeAllLists();
            }}
            onMouseDown={e => e.preventDefault()}
          >
            <img src={imgSrc} width="40px" height="40px" alt="" />
            <span className={songName}>
              {track.name.substr(0, match)}<strong>{track.name.substr(match, search.length)}</strong>{track.name.substr(match + search.length)}
            </span>
          </button>
        })}
      </div>
    </div>
  </form>
}

export default Autocomplete;