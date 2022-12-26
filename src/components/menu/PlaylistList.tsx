import { listContainer } from "styles/app.css";
import { Playlist } from "types/playlist";
import { playlistButton, playlistCount, playlistDesc, playlistImage, playlistName } from "./playlist.css";

interface Props {
  playlists: Playlist[]
  onClick: (playlist: Playlist) => void;
}
const PlaylistList = (props: Props) => {
  const { playlists, onClick } = props;

  return <div className={listContainer}>
    {playlists.map((p, i) => {
      const img = p.images[0];
      return <button key={i} className={playlistButton} onClick={() => onClick(p)}>
        <div className={playlistImage}>
          {img
            ? <img src={img.url} width="60px" height="60px" loading="lazy" alt="" />
            : <svg role="img" height="24" width="24" viewBox="0 0 24 24">
              <path
                d="M6 3h15v15.167a3.5 3.5 0 11-3.5-3.5H19V5H8v13.167a3.5 3.5 0 11-3.5-3.5H6V3zm0
                              13.667H4.5a1.5 1.5 0 101.5 1.5v-1.5zm13 0h-1.5a1.5 1.5 0 101.5 1.5v-1.5z"
                fill="#aaaaaa"
              />
            </svg>
          }
        </div>
        <div className={playlistName}>{p.name}</div>
        <div className={playlistDesc}>
          {p.description}
        </div>
        <div className={playlistCount}>
          {p.tracks.total} songs
        </div>
      </button>
    })}
  </div>
}

export default PlaylistList;