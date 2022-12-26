import Image from "next/image";
import { useState } from "react";
import { BiLogInCircle } from "react-icons/bi";
import { iconButton, inlineIcon } from "styles/app.css";
import { errorText, spotifyContainer, spotifyLogin, usernameSearchBox } from "./Spotify.css";

interface Props {
  onSubmit: (username: string) => void;
  error?: string;
}
const SpotifyLogin = (props: Props) => {
  const { onSubmit, error } = props;
  const [usernameSearch, setUsernameSearch] = useState<string>("");

  return <form>
    <label className={`${spotifyContainer} ${spotifyLogin}`}>
      <Image src="/img/spotify.svg" width={32} height={32} className={inlineIcon} alt="Spotify" /> ID:
      <input value={usernameSearch} className={usernameSearchBox} onChange={e => setUsernameSearch(e.target.value)} />
      <button type="submit"
        className={iconButton}
        onClick={e => {
          e.preventDefault();
          onSubmit(usernameSearch);
        }}
      >
        <BiLogInCircle size="32px" />
      </button>
    </label>
    <div className={errorText}>{error}</div>
  </form>
}

export default SpotifyLogin;