import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Track } from "../types/playlist";
import { convertTrackToId } from "../util/track";
import { autocomplete, autocompleteItem, autocompleteItemContainer, autoForm, focus, hidden, hiddenItemContainer, songName, strong, submit, textBox } from "./Autocomplete.css";

interface Props {
  track?: Track;
  setTrack: (track: Track | undefined) => void;
  tracks: Track[];
  disabled?: boolean;
}
const Autocomplete = (props: Props) => {
  const { track, setTrack, tracks, disabled } = props;

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const [filteredTracks, setFilteredTracks] = useState(tracks);
  useEffect(() => {
    setFilteredTracks(tracks.filter(tr => tr.name.toLowerCase().includes(search.toLowerCase())))
  }, [search])

  const selectedRef = useRef<HTMLButtonElement>(null);
  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        setIndex(i => {
          return i && i - 1;
        })
        break;
      case "ArrowDown":
        event.preventDefault();
        setIndex(i => {
          return Math.min(i + 1, filteredTracks.length - 1);
        })
        break;
      case "Enter":
        event.preventDefault();
        const t = filteredTracks[index];
        setSearch(t.name);
        setTrack(t);
        setOpen(false);
        console.log(`track ${index} of ${filteredTracks.length}: ${t.name}`);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [index])

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
          setIndex(0);
        }}
        onKeyDown={handleKeydown}
        onFocus={() => { setOpen(true); setIndex(0); }}
        onBlur={() => { setOpen(false); }}
        disabled={disabled}
      />
      <div id="autocomplete-list" className={open ? autocompleteItemContainer : hiddenItemContainer}>
        {tracks.map((track, i) => {
          const match = track.name.toLowerCase().indexOf(search.toLowerCase());
          const imgSrc = track.album.images[0]?.url;
          const refProps = filteredTracks[index] === track ? { ref: selectedRef } : {};
          return <button
            tabIndex={-1}
            key={convertTrackToId(track)}
            className={`${autocompleteItem} ${!(match + 1) && hidden} ${filteredTracks[index] === track && focus}`}
            onClick={(e) => {
              e.preventDefault();
              setSearch(track.name);
              setTrack(track);
              setOpen(false);
              //closeAllLists();
            }}
            onMouseDown={e => e.preventDefault()}
            {...refProps}
          >
            <img src={imgSrc} width="40px" height="40px" alt="" />
            <span className={songName}>
              {track.name.substring(0, match)}
              <strong className={strong}>{track.name.substring(match, match + search.length)}</strong>
              {track.name.substring(match + search.length)}
            </span>
          </button>
        })}
      </div>
    </div>
  </form>
}

export default Autocomplete;