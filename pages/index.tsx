import type { NextPage } from "next";
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Playlist, SpotifyUser, Track } from "types/playlist";
import { server } from "config/index";
import {
  layout, loginContainer, titleContainer, iconButton, spotifyLoggedIn,
  loginLayout, inlineIcon, settingsContainer, loggedInTitleContainer,
  listContainer, primary, secondary, generateButton, bigWord, timerContainer,
  controlsContainer, spotifyLogin, usernameSearchBox
} from "styles/app.css";
import { convertTrackToId } from "util/track";
import Head from "next/head";
import {
  BiCog, BiRefresh, BiLogOut, BiHelpCircle, BiCodeAlt, BiChevronLeft,
  BiTimer, BiLogInCircle
} from "react-icons/bi";
import Title from "components/Title";
import Menu from "components/Menu";
import {
  playlistButton, playlistContainer, playlistCount, playlistDesc, playlistImage,
  playlistName, playlistTitle, refreshButton, textOverflow
} from "styles/playlist.css";
import { songArtist, songButton, songImage, songName } from "styles/song.css";
import Image from "next/image";
import ProgressBar from "../src/components/ProgressBar";
import ControlPane from "../src/components/ControlPane";

export const CLIENT_ID = "a70d66f34db04d7e86f52acc1615ec37"
export const REDIRECT_URI = `${server}/`

const initialTime = 15;
const answersTime = 5;

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

enum GAMESTATE {
  NOTHING = 0,
  GUESSING = 1,
  ANSWERS = 2,
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

  const [username, setUsername] = useState<string>("");
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
    if (username) {
      setPlaylists([]);
      getPlaylists(username, token).then(value => {
        setPlaylists(value);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

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

  const [activeWord, setActiveWord] = useState<string>("");
  const [timer, setTimer] = useState<number>(0);
  const [gameState, setGameState] = useState<GAMESTATE>(0);
  const loadNextWord = useCallback(() => {
    const words = Object.keys(procWords);
    setActiveWord(words[words.length * Math.random() | 0]);
    setTimer(initialTime);
    setGameState(1);
  }, [procWords])
  const showAnswers = () => {
    setGameState(2);
    setTimer(answersTime);
    console.log(procWords[activeWord].songs.map(track => track.name));
  }
  useEffect(() => {
    const interval = setTimeout(() => {
      if (!activeWord || gameState === GAMESTATE.NOTHING) return;
      setTimer(timer - 1)
      if (timer === 0) {
        switch (gameState) {
          case 1:
            showAnswers();
            break;
          case 2:
            loadNextWord();
            break;
          default:
            break;
        }
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, activeWord, loadNextWord, showAnswers]);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
  const [selectedTrack, setSelectedTrack] = useState<Track>();

  return <div className={username ? layout : loginLayout}>
    <Head>
      <title>Songb♪rd</title>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
    <section className={username ? loggedInTitleContainer : titleContainer}>
      <h1><Title /></h1>
    </section>
    <section className={loginContainer}>
      {username
        ? <div className={spotifyLoggedIn}>
          <Image src="/img/spotify.svg" width={32} height={32} className={inlineIcon} alt="Spotify" />
          <div>
            {username}
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
                setUsername(usernameSearch);
              }}
            >
              <BiLogInCircle size="32px" /></button>
          </label>
        </form>
      }
    </section>
    <ControlPane />
    {username && playlists &&
      <>
        <section className={playlistContainer}>
          {!selectedPlaylist || !tracks
            // Playlist has not yet been selected
            ? <>
              <div className={playlistTitle}>
                <h2 className={textOverflow}>Playlists</h2>
                <button onClick={() => getPlaylists(username, token)} className={refreshButton}>
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
                  setActiveWord("");
                }}>
                  <BiChevronLeft size="24px" />
                </button>
                <h2 className={textOverflow}>{selectedPlaylist?.name ?? "Songs"}</h2>
              </div>
              <div className={listContainer}>
                {tracks.filter(track => !!words[convertTrackToId(track)]).map((t, i) => {
                  const imgSrc = t.album.images[0]?.url;
                  const name = t.name;
                  return <button key={i} className={songButton} onClick={() => setSelectedTrack(t)}>
                    <img src={imgSrc} className={songImage} width="48px" height="48px" loading="lazy" alt="" />
                    <div className={songName}>{name}</div>
                    <div className={songArtist}>{t.artists.map(a => a.name).join(", ")}</div>
                  </button>
                })}
              </div>
              <ProgressBar
                max={tracks.length}
                value={Object.keys(words).length + failedSongs.length}
              />
            </>
          }
        </section>
        {selectedPlaylist &&
          <section className={primary}>
            {!activeWord
              ? <>
                <button className={generateButton} disabled={tracks.length === 0} onClick={loadNextWord}>
                  Start
                </button>
              </>
              : <>
                <div className={timerContainer}>
                  <BiTimer size="24px" />
                  {timer}
                </div>
                <div className={bigWord}>
                  {activeWord.toLocaleUpperCase()}
                </div>
                <div className={controlsContainer}>
                  <button className={generateButton} onClick={loadNextWord}>
                    Next
                  </button>
                </div>
              </>
            }
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