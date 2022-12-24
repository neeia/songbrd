import type { NextPage } from "next";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Playlist, SpotifyUser, Track } from "types/playlist";
import { server } from "config/index";
import {
  layout, loginContainer, titleContainer, iconButton, spotifyLoggedIn,
  loginLayout, inlineIcon, settingsContainer, loggedInTitleContainer,
  listContainer, primary, secondary, gameButton, bigWord, timerContainer,
  controlsContainer, spotifyLogin, usernameSearchBox, startButton, startImg, startLabel, startDesc, errorText, gameArea, wordCount, gameControlButton
} from "styles/app.css";
import { convertTrackToId } from "util/track";
import Head from "next/head";
import { BiRefresh, BiLogOut, BiChevronLeft, BiTimer, BiLogInCircle, BiTimeFive, BiInfinite, BiMusic, BiSkipNext, BiMicrophone } from "react-icons/bi";
import Title from "components/Title";
import {
  playlistButton, playlistContainer, playlistCount, playlistDesc, playlistImage,
  playlistName, playlistTitle, refreshButton, textOverflow
} from "styles/playlist.css";
import { songArtist, songButton, songImage, songName } from "styles/song.css";
import Image from "next/image";
import ProgressBar from "components/ProgressBar";
import ControlPane from "components/ControlPane";

export const CLIENT_ID = "a70d66f34db04d7e86f52acc1615ec37"
export const REDIRECT_URI = `${server}/`

interface User {
  name: string;
  verified: boolean;
}

const getToken = async () => {
  const response = await fetch(`${server}/api/auth`);

  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  try {
    return await response.json();
  }
  catch (e) {
    return null;
  }
};

const getPlaylists = async (username: string, token: string) => {
  let data: { items: Playlist[]; next: string | null; };
  let s = `https://api.spotify.com/v1/users/${username}/playlists`;
  const out = [];
  try {
    do {
      const res = await axios.get(s, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 50,
        }
      })
      data = res.data;
      out.push(...data.items);
      if (data.next) s = data.next;
    } while (data.next);
  }
  catch (e) {
    return [];
  }
  return out;
}

const processWords = (words: Record<string, Lyrics>) => {
  const out: Record<string, WordData> = {};
  Object.values(words).forEach(lyrics => {
    Object.keys(lyrics.words).forEach(word => {
      out[word] ??= { frequency: 0, songs: [] };
      out[word].frequency += 1;
      out[word].songs.push(lyrics.song);
    })
  })
  return out;
}

interface Lyrics {
  song: Track;
  words: Record<string, number>
}

interface WordData {
  frequency: number;
  songs: Track[];
}

enum GAMEMODE {
  NONE = "None",
  STANDARD = "Standard",
  BLITZ = "Blitz",
  REHEARSAL = "Rehearsal",
}

enum GAMESTATE {
  NONE = 0,
  GUESSING = 1,
  ANSWERS = 2,
}

interface GameState {
  mode: GAMEMODE;
  state: GAMESTATE;
  activeWord: string;
  history: string[];
  timer: number;
  paused: boolean;
}
const DEFAULT_GAME_STATE = {
  state: 0,
  mode: GAMEMODE.NONE,
  history: [],
  timer: -1,
  activeWord: "",
  paused: false,
}

export interface GameSettings {
  initialTime: Record<GAMEMODE, number>;
  wordLimit: Record<GAMEMODE, number>;
  answersTime: number;
}

const App: NextPage = () => {
  // song => word => frequency
  const [words, setWords] = useState<Record<string, Lyrics>>({});

  // target: word => frequency, 
  const [procWords, setProcWords] = useState<Record<string, WordData>>({});
  useEffect(() => {
    const out = processWords(words)
    setProcWords(out);
  }, [words])

  const [failedSongs, setFailedSongs] = useState<Track[]>([]);

  const [user, setUser] = useState<User>({ name: "", verified: false });
  const [loginError, setLoginError] = useState<string>("");
  const [usernameSearch, setUsernameSearch] = useState<string>("")

  const [token, setToken] = useState<string>("");
  useEffect(() => {
    getToken().then(value => {
      setToken(value.access_token);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  useEffect(() => {
    if (user.name) {
      setPlaylists([]);
      getPlaylists(user.name, token).then(value => {
        if (value.length > 0) {
          setUser({ name: user.name, verified: true });
          setPlaylists(value);
        } else {
          setLoginError("Could not find user's playlists.")
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.name])

  const [tracks, setTracks] = useState<Track[]>([]);
  const getSongs = async (s: string) => {
    setWords({});
    setTracks([]);
    setFailedSongs([]);
    let data: { items: any[]; next: string | null; };
    let items: Track[] = [];
    do {
      const res = await axios.get(s, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          limit: 50,
        }
      });
      data = res.data;
      items.push(...data.items.map((t: { track: Track }) => t.track).filter(track => !track.is_local));

      if (data.next) s = data.next;
    } while (data.next);

    setTracks(items);
    items.forEach((track: Track) => {
      getSong(track).then(res => {
        if (res) setWords(oldWords => {
          const newWords = { ...oldWords };
          newWords[convertTrackToId(track)] = { song: track, words: res.lyrics };
          return newWords;
        })
        else setFailedSongs(fs => [...fs, track]);
      })
    });
  }

  const getSong = async (s: Track) => {
    const response = await fetch(`${server}/api/fetchLyrics?${new URLSearchParams({ name: s.name, artist: s.artists[0].name })}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    try {
      return await response.json();
    }
    catch (e) {
      return null;
    }
  };

  const [game, setGame] = useState<GameState>(DEFAULT_GAME_STATE);
  const [settings, setSettings] = useState<GameSettings>({
    initialTime: {
      "None": -1,
      "Standard": 15,
      "Blitz": 120,
      "Rehearsal": -1
    },
    wordLimit: {
      "None": -1,
      "Standard": 15,
      "Blitz": -1,
      "Rehearsal": -1
    },
    answersTime: 5
  });
  const getWord = () => {
    const words = Object.keys(procWords);
    return words[words.length * Math.random() | 0];
  }
  const initGame = (gameMode: GAMEMODE) => {
    const cl = { ...game };
    cl.activeWord = getWord();
    cl.mode = gameMode;
    cl.timer = settings.initialTime[gameMode];
    // GUESSING
    cl.state = 1;
    setGame(cl);
  }

  const getNextWord = () => {
    const cl = { ...game };
    cl.activeWord = getWord();
    cl.timer = settings.initialTime[cl.mode];
    // GUESSING
    cl.state = 1;
    setGame(cl);
  }

  const showAnswers = () => {
    const cl = { ...game };
    cl.timer = settings.answersTime;
    // SHOWING ANSWERS
    cl.state = 2;
    setGame(cl);
    console.log(procWords[cl.activeWord].songs.map(track => track.name));
  }

  // GAME LOOP
  useEffect(() => {
    const interval = setTimeout(() => {
      if (game.state === GAMESTATE.NONE) return;
      const cl = { ...game };
      cl.timer--;
      setGame(cl);
      if (cl.timer === 0) {
        switch (cl.state) {
          case 1:
            showAnswers();
            break;
          case 2:
            getNextWord();
            break;
          default:
            break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();

  return <div className={user.verified ? layout : loginLayout}>
    <Head>
      <title>Songb♪rd</title>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
    <section className={user.verified ? loggedInTitleContainer : titleContainer}>
      <h1><Title /></h1>
    </section>
    <section className={loginContainer}>
      {user.verified
        ? <div className={spotifyLoggedIn}>
          <Image src="/img/spotify.svg" width={32} height={32} className={inlineIcon} alt="Spotify" />
          <div>
            {user.name}
          </div>
          <button onClick={() => window.location.reload()} className={iconButton}>
            <BiLogOut size="24px" />
          </button>
        </div>
        : <form>
          <label className={spotifyLogin}>
            <Image src="/img/spotify.svg" width={32} height={32} className={inlineIcon} alt="Spotify" /> ID:
            <input value={usernameSearch} className={usernameSearchBox} onChange={e => setUsernameSearch(e.target.value)} />
            <button type="submit"
              className={iconButton}
              onClick={e => {
                e.preventDefault();
                setUser({ name: usernameSearch, verified: false });
              }}
            >
              <BiLogInCircle size="32px" /></button>
          </label>
          <div className={errorText}>{loginError}</div>
        </form>
      }
    </section>
    <ControlPane settings={settings} setSettings={setSettings} />
    {user.verified && playlists && <>
      <section className={playlistContainer}>
        {!selectedPlaylist || !tracks
          // Playlist has not yet been selected
          ? <>
            <div className={playlistTitle}>
              <h2 className={textOverflow}>Playlists</h2>
              <button onClick={() => getPlaylists(user.name, token)} className={refreshButton}>
                <BiRefresh size="24px" />
              </button>
            </div>
            <div className={listContainer}>
              {playlists.map(p => {
                const img = p.images[0];
                const playlistUrl = p.tracks.href;
                return <button key={playlistUrl} className={playlistButton} onClick={() => { setSelectedPlaylist(p); getSongs(playlistUrl); }}>
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
          </>
          // Playlist has been selected
          : <>
            <div className={playlistTitle}>
              <button className={iconButton} onClick={() => {
                setSelectedPlaylist(undefined);
                setTracks([]);
                setFailedSongs([]);
                setGame(DEFAULT_GAME_STATE);
              }}>
                <BiChevronLeft size="24px" />
              </button>
              <h2 className={textOverflow}>{selectedPlaylist?.name ?? "Songs"}</h2>
            </div>
            <div className={listContainer}>
              {tracks.filter(track => !!words[convertTrackToId(track)]).map((t, i) => {
                const imgSrc = t.album.images[0]?.url;
                const name = t.name;
                return <div key={i} className={songButton}>
                  <img src={imgSrc} className={songImage} width="48px" height="48px" loading="lazy" alt="" />
                  <div className={songName}>{name}</div>
                  <div className={songArtist}>{t.artists.map(a => a.name).join(", ")}</div>
                </div>
              })}
            </div>
            <ProgressBar
              max={tracks.length}
              value={Object.keys(words).length + failedSongs.length}
            />
          </>
        }
      </section>
      {selectedPlaylist && <>
        <section className={primary}>
          {game.activeWord && game.mode !== GAMEMODE.REHEARSAL &&
            <div className={timerContainer}>
              <BiTimer size="36px" />
              {game.timer}
            </div>
          }
        </section>
        {game.mode === GAMEMODE.NONE
          ? <section className={secondary}>
            <h3>Modes:</h3>
            <button className={startButton} disabled={tracks.length === 0} onClick={() => initGame(GAMEMODE.STANDARD)}>
              <BiMusic size="36px" className={startImg} />
              <label className={startLabel}>Standard</label>
              <div className={startDesc}>Test your knowledge!</div>
            </button>
            <button className={startButton} disabled={tracks.length === 0} onClick={() => initGame(GAMEMODE.BLITZ)}>
              <BiTimeFive size="36px" className={startImg} />
              <label className={startLabel}>Blitz</label>
              <div className={startDesc}>Race against the clock!</div>
            </button>
            <button className={startButton} disabled={tracks.length === 0} onClick={() => initGame(GAMEMODE.REHEARSAL)}>
              <BiInfinite size="36px" className={startImg} />
              <label className={startLabel}>Rehearsal</label>
              <div className={startDesc}>Hone your skills!</div>
            </button>
          </section>
          : <div className={gameArea}>
            <div className={wordCount}>
              Word {game.history.length + 1}
            </div>
            <div className={bigWord}>
              {game.activeWord.toLocaleUpperCase()}
            </div>
            <div className={controlsContainer}>
              {game.state === GAMESTATE.ANSWERS
                ? <div className={listContainer}>
                  {procWords[game.activeWord].songs.map((t, i) => {
                    const imgSrc = t.album.images[0]?.url;
                    const name = t.name;
                    return <div key={i} className={songButton}>
                      <img src={imgSrc} className={songImage} width="48px" height="48px" loading="lazy" alt="" />
                      <div className={songName}>{name}</div>
                      <div className={songArtist}>{t.artists.map(a => a.name).join(", ")}</div>
                    </div>
                  })}
                </div>
                : <>
                  <button className={gameControlButton} onClick={showAnswers}>
                    <BiSkipNext size="48px" />
                    Skip
                  </button>
                  <button className={gameControlButton} onClick={getNextWord}>
                    <BiMicrophone size="48px" />
                    Done
                  </button>
                </>
              }
            </div>
            <hr />
            <div>
              <button className={iconButton} onClick={() => {
                setGame(DEFAULT_GAME_STATE);
              }}>
                <BiChevronLeft size="24px" />
              </button>
              {game.mode.toString()}
            </div>
          </div>
        }
      </>
      }
    </>
    }
  </div>
}
export default App;

/*


    <section className={failedContainer}>
      <h2>Failed to find:</h2>
      <div className={listContainer}>
        {tracks.filter(track => !!failedSongs.find(t => t.name === track.name && t.album === track.album)).map((t, i) => {
          const imgSrc = t.album.images[0]?.url;
          const name = t.name;
          return <div key={i} className={songListItem}>
            <img src={imgSrc} className={songImage} width="48px" height="48px" loading="lazy" />
            <div className={songName}>{name}</div>
            <div className={songArtist}>{t.artists.map(a => a.name).join(", ")}</div>
          </div>
        })}
      </div>
    </section>
    <section className={mainContainer}>
      <div></div>
      <div className={listContainer}>
        {selectedTrack && words[convertTrackToId(selectedTrack)]
          ? <div>
            {Object.entries(words[convertTrackToId(selectedTrack)])
              .sort((v1, v2) => v1[1] - v2[1])
              .map(v =>
                <div key={v[0]}>
                  {v[0]}: {v[1]}
                </div>)
            }
          </div>
          : null
        }
      </div>
    </section>
    <section className={utilContainer}>
    </section>
 */

  //const router = useRouter();
  //const [token, setToken] = useState<Token | undefined>();
  //useEffect(() => {
  //  if (router.isReady && !token) {
  //    const q = router.query as unknown as Token;
  //    setToken(q);
  //    router.replace({ pathname: "/", query: "" }, undefined, { shallow: true });
  //  }
  //  // eslint-disable-next-line react-hooks/exhaustive-deps
  //}, [router])

  //const [user, setUser] = useState<SpotifyUser>();
  //const getUser = async (accToken: string) => {
  //  const { data } = await axios.get("https://api.spotify.com/v1/me/", {
  //    headers: {
  //      Authorization: `Bearer ${accToken}`
  //    },
  //  })
  //  setUser(data);
  //}
  //useEffect(() => {
  //  if (token?.access_token) getUser(token.access_token);
  //}, [token]);

  // Reauthenticate user at 30 minute intervals
  //useEffect(() => {
  //  const interval = setTimeout(() => {
  //    if (token && user) fetch(`${server}/api/reauth?${new URLSearchParams({ token: token.refresh_token })}`)
  //      .then(response => {
  //        response.json().then(obj => {
  //          setToken(obj);
  //        })
  //      })
  //  }, 1800000);

  //  return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  //}, [token, user])