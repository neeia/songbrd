import type { NextPage } from "next";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Playlist, Track } from "types/playlist";
import { server } from "config/index";
import {
  layout, titleContainer, iconButton,
  loginLayout, loggedInTitleContainer,
  listContainer, primary, secondary, timerContainer,
  startButton, startImg, startLabel, startDesc, menuButton,
  playlistContainer, playlistTitle, refreshButton, gameArea, utilContainer
} from "styles/app.css";
import { convertTrackToId } from "util/track";
import Head from "next/head";
import { BiRefresh, BiChevronLeft, BiTimer, BiTimeFive, BiInfinite, BiMusic, BiMenu } from "react-icons/bi";
import Title from "components/Title";
import ControlPane from "components/ControlPane";
import useWindowSize from "util/useWindowSize";
import SpotifyLogin from "components/app/SpotifyLogin";
import SongList from "components/menu/SongList";
import Song from "components/menu/Song";
import { mobileAppBar, mobileLayout, mobileContainer } from "styles/mobile.css";
import { DEFAULT_STATE, GameSettings, GameState, Lyrics, Mode, State, WordData } from "types/game";
import Game from "components/game/Game";
import PlaylistList from "components/menu/PlaylistList";
import { textOverflow } from "components/menu/playlist.css";
import SpotifyLoggedIn from "components/app/SpotifyLoggedIn";

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
      out[word] ??= { word, frequency: 0, songs: [] };
      out[word].frequency += 1;
      out[word].songs.push(lyrics.song);
    })
  })
  return out;
}

enum AppState {
  LOGIN = "Login",
  PLAYLIST = "Playlist",
  SONG = "Song",
  GAME = "Game",
}

const App: NextPage = () => {
  const [controller] = useState(new AbortController());

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

  const [token, setToken] = useState<string>("");
  useEffect(() => {
    getToken().then(value => {
      setToken(value.access_token);
    })
    const interval = setInterval(() => {
      getToken().then(value => {
        setToken(value.access_token);
      })
    }, 1800000);
    return () => clearInterval(interval);
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
          setState(AppState.PLAYLIST)
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
    setState(AppState.SONG)
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

    const out: Record<string, Lyrics> = {};

    setTracks(items);
    await Promise.all(items.map(async (track: Track) => {
      const res = await getSong(track);
      if (res) out[convertTrackToId(track)] = { song: track, words: res.lyrics };
      else setFailedSongs(fs => [...fs, track]);
    }));
    setWords(out);
  }

  const getSong = async (s: Track) => {
    const response = await fetch(`${server}/api/fetchLyrics?${new URLSearchParams({ name: s.name, artist: s.artists[0].name })}`, {
      signal: controller.signal,
    });

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

  const [game, setGame] = useState<State>(DEFAULT_STATE);
  const [timer, setTimer] = useState<number>(-1);
  const [state, setState] = useState<AppState>(AppState.LOGIN);
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
    const words = Object.values(procWords)
      .filter(word => !(
        word.word.length < 3 || game.history.find(w => w.word === word)
      ));

    return words[words.length * Math.random() | 0];
  }
  const initGame = (gameMode: Mode) => {
    const cl = { ...game };
    cl.activeWord = getWord();
    cl.mode = gameMode;
    cl.history = [];
    setTimer(settings.initialTime[gameMode]);
    // GUESSING
    cl.state = GameState.GUESSING;
    setGame(cl);
    setState(AppState.GAME);
  }

  const getNextWord = (success?: boolean) => {
    const cl = { ...game };
    cl.history.push({ word: game.activeWord, solved: !!success });
    if (cl.history.length === settings.wordLimit[game.mode]) {
      // Game Over
      endGame();
    }
    else {
      // GUESSING
      cl.state = GameState.GUESSING;
      cl.activeWord = getWord();
      if (game.mode !== Mode.BLITZ) setTimer(settings.initialTime[game.mode]);
      setGame(cl);
    }
  }

  const showAnswers = () => {
    if (game.state === GameState.ANSWERS) {
      getNextWord();
    }
    else {
      const cl = { ...game };
      if (game.mode !== Mode.BLITZ) setTimer(settings.answersTime);
      // SHOWING ANSWERS
      cl.state = GameState.ANSWERS;
      setGame(cl);
    }
  }

  const endGame = () => {
    const cl = { ...game };
    setTimer(-1);
    cl.activeWord = { word: "", frequency: 0, songs: [] };
    // GAME OVER
    cl.state = GameState.END;
    setGame(cl);
  }

  // GAME LOOP
  useEffect(() => {
    const interval = setTimeout(() => {
      if (game.state !== GameState.GUESSING && game.state !== GameState.ANSWERS) return;
      const cl = { ...game };
      if (game.mode === Mode.REHEARSAL) return;
      setTimer(timer - 1);
      setGame(cl);
      if (timer === 0) {
        switch (cl.mode) {
          case Mode.STANDARD:
            if (cl.state === GameState.GUESSING) showAnswers();
            else getNextWord();
            break;
          case Mode.BLITZ:
            endGame();
            break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [game]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
  const size = useWindowSize();
  const mobile = size.width && size.width <= 768;

  const [menuOpen, setMenuOpen] = useState(false);

  const GameTimer = () =>
    <div className={timerContainer}>
      <BiTimer size="36px" />
      {timer}
    </div>

  const GameModeSelector = () => <>
    <h3>Modes:</h3>
    <button className={startButton} disabled={Object.keys(procWords).length === 0} onClick={() => initGame(Mode.STANDARD)}>
      <BiMusic size="36px" className={startImg} />
      <label className={startLabel}>Standard</label>
      <div className={startDesc}>Test your knowledge!</div>
    </button>
    <button className={startButton} disabled={Object.keys(procWords).length === 0} onClick={() => initGame(Mode.BLITZ)}>
      <BiTimeFive size="36px" className={startImg} />
      <label className={startLabel}>Blitz</label>
      <div className={startDesc}>Race against the clock!</div>
    </button>
    <button className={startButton} disabled={Object.keys(procWords).length === 0} onClick={() => initGame(Mode.REHEARSAL)}>
      <BiInfinite size="36px" className={startImg} />
      <label className={startLabel}>Rehearsal</label>
      <div className={startDesc}>Hone your skills!</div>
    </button>
  </>

  const MobileHeader = () => {
    switch (state) {
      case AppState.PLAYLIST:
        return <> <h2 className={textOverflow}>Playlists</h2>
          <button onClick={() => getPlaylists(user.name, token)} className={iconButton}>
            <BiRefresh size="24px" />
          </button>
        </>;
      case AppState.SONG:
        return <h2 className={textOverflow}>{selectedPlaylist!.name}</h2>
      case AppState.GAME:
        switch (game.state) {
          case GameState.GUESSING:
          case GameState.ANSWERS:
            if (game.mode !== Mode.REHEARSAL) return <GameTimer />
            else return null;
          case GameState.END:
            return null
          case GameState.REVIEW:
            return <h2>History</h2>;
          default:
            return null;
        }
      default:
        return null;
    }
  }

  const handleBack = () => {
    if (state === AppState.GAME) {
      // In Game
      setGame(DEFAULT_STATE)
      setState(AppState.SONG)
    }
    else {
      setSelectedPlaylist(undefined);
      setTracks([]);
      setFailedSongs([]);
      setGame(DEFAULT_STATE);
      setState(AppState.PLAYLIST)
    }
  }

  const gameObj = <Game game={game}
    settings={settings}
    getWord={() => getNextWord(true)}
    skipWord={showAnswers}
    endGame={endGame}
    exit={() => {
      setState(AppState.SONG);
      setGame(DEFAULT_STATE);
    }}
    review={() => {
      setGame({ ...game, state: GameState.REVIEW });
    }}
    restart={() => initGame(game.mode)}
  />

  return <div>
    <Head>
      <title>Songb♪rd</title>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
    {!mobile
      ? //Desktop Version
      <div className={user.verified ? layout : loginLayout}>
        <section className={user.verified ? loggedInTitleContainer : titleContainer}>
          <h1><Title /></h1>
        </section>
        <section className={utilContainer}>
          {user.verified
            ? <SpotifyLoggedIn username={user.name} />
            : <SpotifyLogin onSubmit={(name: string) => setUser({ name, verified: false })} error={loginError} />
          }
          <ControlPane settings={settings} setSettings={setSettings} />
        </section>
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
                  <button onClick={() => console.log("open the menu!")} className={menuButton}>
                    <BiMenu size="24px" />
                  </button>
                </div>
                <PlaylistList playlists={playlists} onClick={(p) => { setSelectedPlaylist(p); getSongs(p.tracks.href); }} />
              </>
              // Playlist has been selected
              : <SongList
                name={selectedPlaylist.name}
                tracks={tracks.filter(track => !!words[convertTrackToId(track)])}
                onExit={() => {
                  controller.abort();
                  setSelectedPlaylist(undefined);
                  setTracks([]);
                  setFailedSongs([]);
                  setGame(DEFAULT_STATE);
                }}
              />
            }
          </section>
          {selectedPlaylist && <>
            <section className={primary}>
              {state === AppState.GAME && game.mode !== Mode.REHEARSAL && timer > 0 &&
                <GameTimer />
              }
              {game.state === GameState.REVIEW &&
                <h2>
                  <button className={iconButton} onClick={handleBack}>
                    <BiChevronLeft size="24px" />
                  </button>
                  History
                </h2>
              }
            </section>
            {game.mode === Mode.NONE
              ? <section className={secondary}>
                <GameModeSelector />
              </section>
              : <div className={gameArea}>
                {gameObj}
              </div>
            }
          </>
          }
        </>}
      </div>
      : // Mobile Version
      <>
        {!(user.verified && playlists)
          ? // Login
          <>
            <section className={titleContainer}>
              <h1><Title /></h1>
            </section>
            <section>
              <SpotifyLogin onSubmit={(name: string) => setUser({ name, verified: false })} error={loginError} />
              <ControlPane settings={settings} setSettings={setSettings} />
            </section>
          </>
          : // Game
          <section className={mobileLayout}>
            <div className={mobileAppBar}>
              {selectedPlaylist &&
                <button className={iconButton} onClick={handleBack}>
                  <BiChevronLeft size="24px" />
                </button>
              }
              <MobileHeader />
              <button onClick={() => console.log("open the menu!")} className={menuButton}>
                <BiMenu size="24px" />
              </button>
            </div>
            <section className={mobileContainer}>
              {!selectedPlaylist || !tracks
                // Playlist has not yet been selected
                ? <PlaylistList playlists={playlists} onClick={(p) => { setSelectedPlaylist(p); getSongs(p.tracks.href); }} />
                // Playlist has been selected
                : game.mode === Mode.NONE
                  // Not in game
                  ? <>
                    <GameModeSelector />
                    <h3>Tracks:</h3>
                    <div className={listContainer}>
                      {tracks.map((t, i) => <Song track={t} key={i} />)}
                    </div>
                  </>
                  // In a game
                  : <>{gameObj}</>
              }
            </section>
          </section>
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