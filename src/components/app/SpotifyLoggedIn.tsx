import Image from "next/image";
import { BiLogOut } from "react-icons/bi";
import { iconButton, inlineIcon } from "styles/app.css";
import { spotifyContainer } from "./Spotify.css";

interface Props {
  username: string;
}
const SpotifyLogin = (props: Props) => {
  const { username } = props;

  return <div className={spotifyContainer}>
    <Image src="/img/spotify.svg" width={32} height={32} className={inlineIcon} alt="Spotify" />
    <div>
      {username}
    </div>
    <button onClick={() => window.location.reload()} className={iconButton}>
      <BiLogOut size="24px" />
    </button>
  </div>
}

export default SpotifyLogin;