import type { NextPage } from "next";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Playlist, SpotifyUser, Track } from "types/playlist";
import { server } from "config/index";
import { layout, authContainer, mainContainer, failedContainer, utilContainer, titleContainer, spotifyLogin, infoContainer, listContainer, iconButton, spotifyLoggedIn } from "styles/app.css";
import { playlistContainer, playlistTitle, playlistButton, playlistImage, playlistName, playlistDesc, playlistCount } from "styles/playlist.css";
import { songArtist, songButton, songListItem, songContainer, songImage, songName } from "styles/song.css";
import { convertTrackToId } from "util/track";
import Head from "next/head";
import { useRouter } from "next/router";
import { BiCog, BiRefresh, BiSun, BiMoon, BiLogOut } from "react-icons/bi";

export const CLIENT_ID = "a70d66f34db04d7e86f52acc1615ec37"
export const REDIRECT_URI = `${server}/callback/`
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
const RESPONSE_TYPE = "code"
const SCOPE = "user-library-read playlist-read-private"

interface Token {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}

const App: NextPage = () => {
  const [words, setWords] = useState<Record<string, Record<string, number>>>({});
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
    let data: { items: any[]; next: string | null; };
    let items: Track[] = [];
    setTracks([]);
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
      setTracks(oldTracks => {
        const newTracks = [...oldTracks];
        newTracks.push(...data.items.map((t: { track: Track }) => t.track).filter(track => !track.is_local));
        items = newTracks;
        return newTracks;
      });
      if (data.next) s = data.next;
    } while (data.next);

    items
      .filter((track: Track) => !track.is_local)
      .forEach((track: Track) => {
        if (!words[convertTrackToId(track)]) {
          getSong(track).then(res => {
            if (res) setWords(oldWords => {
              const newWords = { ...oldWords };
              newWords[convertTrackToId(track)] = res.lyrics;
              return newWords;
            })
            else setFailedSongs(fs => [...fs, track]);
          })
        }
      })
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

  const signOut = () => {
    window.location.reload();
  }

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>();
  const [selectedTrack, setSelectedTrack] = useState<Track>();
  return <div className={layout}>
    <Head>
      <title>Songbrd</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <section className={titleContainer}>
      <h1>Songbrd</h1>
    </section>
    <section className={authContainer}>
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
          Login with <img src="img/spotify.svg" width="32px" height="32px" /> Spotify
        </a>
      }
    </section>
    <section className={playlistContainer}>
      <div className={playlistTitle}>
        <h2>Playlists</h2>
        {user
          ? <button onClick={getPlaylists} className={iconButton}>
            <BiRefresh size="24px" />
          </button>
          : null
        }
      </div>
      <div className={listContainer}>
        {playlists.map(p => {
          const imgSrc = p.images[0].url;
          const playlistUrl = p.tracks.href;
          return <button key={playlistUrl} className={playlistButton} onClick={() => { getSongs(playlistUrl); setSelectedPlaylist(p); }}>
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
    </section>
    <section className={songContainer}>
      <h2>{selectedPlaylist?.name ?? "Songs"}</h2>
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
    </section>
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
        <progress id="download-progress" max={selectedPlaylist.tracks.total} value={Object.keys(words).length + failedSongs.length}>
          {Object.keys(words).length + failedSongs.length} of {selectedPlaylist.tracks.total}
        </progress>
      }
    </section>
    <section className={infoContainer}>
      <h2>Settings:</h2>
      <button className={iconButton}>
        <BiCog fontSize="32px" />
      </button>
      <button className={iconButton}>
        <BiSun fontSize="32px" />
      </button>
    </section>
  </div>
}
export default App;