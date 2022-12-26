import { iconButton, listContainer, playlistTitle } from "styles/app.css";
import { BiChevronLeft } from "react-icons/bi";
import { Track } from "types/playlist";
import Song from "./Song";
import { textOverflow } from "./playlist.css";

interface Props {
  name: string;
  tracks: Track[];
  onExit: () => void;
}
const SongList = (props: Props) => {
  const { name, tracks, onExit } = props;

  return <>
    <div className={playlistTitle}>
      <button className={iconButton} onClick={onExit}>
        <BiChevronLeft size="24px" />
      </button>
      <h2 className={textOverflow}>{name}</h2>
    </div>
    <div className={listContainer}>
      {tracks.map((t, i) => <Song track={t} key={i} />)}
    </div>
  </>
}

export default SongList;