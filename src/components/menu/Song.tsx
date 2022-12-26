import { songArtist, songButton, songImage, songName } from "./Song.css";
import { Track } from "types/playlist";

interface Props {
  track: Track;
}
const Song = (props: Props) => {
  const { track } = props;

  const imgSrc = track.album.images[0]?.url;
  const name = track.name;

  return <div className={songButton}>
    <img src={imgSrc} className={songImage} width="48px" height="48px" loading="lazy" alt="" />
    <div className={songName}>{name}</div>
    <div className={songArtist}>{track.artists.map(a => a.name).join(", ")}</div>
  </div>
}

export default Song;