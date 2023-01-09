import { iconButton, listContainer, playlistTitle } from "styles/app.css";
import { BiChevronLeft } from "react-icons/bi";
import { Track } from "types/playlist";
import Song from "./Song";
import { textOverflow } from "./Playlist.css";
import { convertTrackToId } from "../../util/track";

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
      {tracks.map(t => <Song track={t} key={convertTrackToId(t)} />)}
    </div>
  </>
}

export default SongList;