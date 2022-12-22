import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Playlist, SpotifyUser, Track } from "types/playlist";
import { server } from "config/index";
import { layout, loginContainer, titleContainer, spotifyLogin, iconButton, spotifyLoggedIn, loginLayout, inlineIcon, settingsContainer, loggedInTitleContainer, listContainer, primary, secondary, generateButton, bigWord, timerContainer } from "styles/app.css";
import { convertTrackToId } from "util/track";
import Head from "next/head";
import { useRouter } from "next/router";
import { BiCog, BiRefresh, BiLogOut, BiHelpCircle, BiCodeAlt, BiChevronLeft, BiTimer } from "react-icons/bi";
import Title from "components/Title";
import Menu from "components/Menu";
import { playlistButton, playlistContainer, playlistCount, playlistDesc, playlistImage, playlistName, playlistTitle, refreshButton, textOverflow } from "styles/playlist.css";
import { songArtist, songButton, songImage, songName } from "styles/song.css";

export const CLIENT_ID = "a70d66f34db04d7e86f52acc1615ec37"
export const REDIRECT_URI = `${server}/callback/`
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code"
const SCOPE = "user-library-read playlist-read-private"

const initialTime = 10;

const signOut = () => {
  window.location.reload();
}

const processWords = (words: Record<string, Record<string, number>>) => {
  const out: Record<string, Word> = {};
  Object.keys(words).forEach(song => {
    Object.keys(words[song]).forEach(word => {
      out[word] ??= { frequency: 0, songs: [] };
      out[word].frequency += 1;
      out[word].songs.push(song);
    })
  })
  return out;
}

interface Token {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}

interface Word {
  frequency: number;
  songs: string[];
}

const App: NextPage = () => {
  // song => word => frequency
  const [words, setWords] = useState<Record<string, Record<string, number>>>({});

  // target: word => frequency, 
  const [procWords, setProcWords] = useState<Record<string, Word>>({});
  useEffect(() => {
    const out = processWords(words)
    setProcWords(out);
  }, [words])

  const [failedSongs, setFailedSongs] = useState<Track[]>([]);

  const router = useRouter();
  const [token, setToken] = useState<Token | undefined>();
  useEffect(() => {
    if (router.isReady && !token) {
      const q = router.query as unknown as Token;
      setToken(q);
      router.replace({ pathname: "/", query: "" }, undefined, { shallow: true });
    }
  }, [router])

  const [user, setUser] = useState<SpotifyUser>();
  const getUser = async (accToken: string) => {
    const { data } = await axios.get("https://api.spotify.com/v1/me/", {
      headers: {
        Authorization: `Bearer ${accToken}`
      },
    })
    setUser(data);
  }
  useEffect(() => {
    if (token?.access_token) getUser(token.access_token);
  }, [token]);

  useEffect(() => {
    const interval = setTimeout(() => {
      if (token && user) fetch(`${server}/api/reauth?${new URLSearchParams({ token: token.refresh_token })}`)
        .then(response => {
          response.json().then(obj => {
            setToken(obj);
          })
        })
    }, 1800000);

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [token, user])

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const getPlaylists = async () => {
    if (!user || !token) return;
    let data: { items: Playlist[]; next: string | null; };
    let s = "https://api.spotify.com/v1/me/playlists";
    setPlaylists([]);
    do {
      const res = await axios.get(s, {
        headers: {
          Authorization: `Bearer ${token?.access_token}`
        },
        params: {
          limit: 50,
        }
      })
      data = res.data;
      setPlaylists(oldPlaylists => {
        const newPlaylists = [...oldPlaylists];
        newPlaylists.push(...data.items);
        return newPlaylists;
      });
      if (data.next) s = data.next;
    } while (data.next);
  }
  useEffect(() => {
    if (user && token) getPlaylists();
  }, [user])

  const [tracks, setTracks] = useState<Track[]>([]);
  const getSongs = async (s: string) => {
    setTracks([]);
    setFailedSongs([]);
    let data: { items: any[]; next: string | null; };
    let items: Track[] = [];
    do {
      const res = await axios.get(s, {
        headers: {
          Authorization: `Bearer ${token?.access_token}`
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
      if (words[convertTrackToId(track)]) return;
      getSong(track).then(res => {
        if (res) setWords(oldWords => {
          const newWords = { ...oldWords };
          newWords[convertTrackToId(track)] = res.lyrics;
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
  const getRandomWord = () => {
    const words = Object.keys(procWords);
    setActiveWord(words[words.length * Math.random() | 0]);
    setTimer(initialTime);
  }
  useEffect(() => {
    const interval = setTimeout(() => {
      if (!activeWord) return;
      setTimer(timer - 1)
      if (timer === 0) {
        // TODO: Should display some valid songs
        getRandomWord();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, activeWord]);

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
  const [selectedTrack, setSelectedTrack] = useState<Track>();

  const [settings, openSettings] = useState(false);
  const closeSettings = () => openSettings(false);
  const [help, openHelp] = useState(false);
  const closeHelp = () => openHelp(false);

  return <div className={user ? layout : loginLayout}>
    <Head>
      <title>Songb♪rd</title>
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
    <section className={user ? loggedInTitleContainer : titleContainer}>
      <h1><Title /></h1>
    </section>
    <section className={loginContainer}>
      {user
        ? <div className={spotifyLoggedIn}>
          <img src="img/spotify.svg" width="32px" height="32px" />
          <div>
            {user?.display_name}
          </div>
          <button onClick={signOut} className={iconButton}>
            <BiLogOut size="24px" />
          </button>
        </div>
        : <a
          className={spotifyLogin}
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
        >
          Login with <img src="img/spotify.svg" className={inlineIcon} /> Spotify
        </a>
      }
    </section>
    <div role="group" className={settingsContainer}>
      <button className={iconButton} onClick={() => openHelp(true)}>
        <BiHelpCircle fontSize="32px" />
      </button>
      <Menu open={help} onClose={closeHelp} title="Help">
        Dark Theme
        <button className={iconButton}>
        </button>
        Feedback
        Version
      </Menu>
      <button className={iconButton} onClick={() => openSettings(true)}>
        <BiCog fontSize="32px" />
      </button>
      <Menu open={settings} onClose={closeSettings} title="Settings">
        Dark Theme
        <button className={iconButton}>
        </button>
        Feedback
        Version
      </Menu>
      <a className={iconButton} href="https://github.com/neeia/songbrd" target="_blank" rel="noopener noreferrer">
        <BiCodeAlt fontSize="32px" />
      </a>
    </div>
    {user && playlists &&
      <>
        <section className={playlistContainer}>
          {!selectedPlaylist || !tracks
            // Playlist has not yet been selected
            ? <>
              <div className={playlistTitle}>
                <h2 className={textOverflow}>Playlists</h2>
                <button onClick={getPlaylists} className={refreshButton}>
                  <BiRefresh size="24px" />
                </button>
              </div>
              <div className={listContainer}>
                {playlists.map(p => {
                  const imgSrc = p.images[0].url;
                  const playlistUrl = p.tracks.href;
                  return <button key={playlistUrl} className={playlistButton} onClick={() => { setSelectedPlaylist(p); getSongs(playlistUrl); }}>
                    <img src={imgSrc} className={playlistImage} width="60px" height="60px" loading="lazy" />
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
                <h2>{selectedPlaylist?.name ?? "Songs"}</h2>
              </div>
              <div className={listContainer}>
                {tracks.filter(track => !!words[convertTrackToId(track)]).map((t, i) => {
                  const imgSrc = t.album.images[0]?.url;
                  const name = t.name;
                  return <button key={i} className={songButton} onClick={() => setSelectedTrack(t)}>
                    <img src={imgSrc} className={songImage} width="48px" height="48px" loading="lazy" />
                    <div className={songName}>{name}</div>
                    <div className={songArtist}>{t.artists.map(a => a.name).join(", ")}</div>
                  </button>
                })}
              </div>
            </>
          }
        </section>
        {selectedPlaylist &&
          <section className={primary}>
            {!activeWord
              ? <>
                <button className={generateButton} disabled={tracks.length === 0} onClick={getRandomWord}>
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
                <button className={generateButton} onClick={getRandomWord}>
                  Next
                </button>
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
      <label htmlFor="download-progress"><h2>Songs Matched:</h2></label>
      {selectedPlaylist &&
        <progress id="download-progress" max={tracks.length} value={Object.keys(words).length + failedSongs.length}>
          {Object.keys(words).length + failedSongs.length} of {tracks.length}
        </progress>
      }
      {selectedPlaylist &&
        <div>
          {Object.keys(words).length + failedSongs.length} of {tracks.length}
        </div>
      }
    </section>
 */
