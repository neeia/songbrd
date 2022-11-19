import type { NextPage } from "next";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Playlist, SpotifyUser, Track } from "types/playlist";
import { server } from "config/index";
import { layout, playlistButton, listContainer, playlistImage, playlistName } from "../styles/app.css";
import { convertTrackToId } from "util/track";

interface Token {
  access_token: string;
  token_type: string;
  expires_in: string;
}

const Callback: NextPage = () => {
  const [words, setWords] = useState<Record<string, Record<string, number>>>({});

  const [token, setToken] = useState<Token>();
  useEffect(() => {
    const hash = window.location.hash.substring(1).split("&");
    const hashObj = Object.fromEntries(hash.map(s => s.split("=")));
    setToken(hashObj);
    getUser(hashObj.access_token);
  }, [])

  const [user, setUser] = useState<SpotifyUser>();
  const getUser = async (accToken: string) => {
    const { data } = await axios.get("https://api.spotify.com/v1/me/", {
      headers: {
        Authorization: `Bearer ${accToken}`
      },
    })

    setUser(data);
  }

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const getPlaylists = async (e: any) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token?.access_token}`
      },
      params: {
        limit: 50,
      }
    })

    setPlaylists(data.items);
  }

  const [tracks, setTracks] = useState<Track[]>([]);
  const getSongs = async (s: string) => {
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
            setWords(oldWords => {
              const newWords = { ...oldWords };
              newWords[convertTrackToId(track)] = res.lyrics;
              return newWords;
            })
          })
        }
      })
  }
  console.log(words);
  const getSong = async (s: Track) => {
    const response = await fetch(`${server}/api/fetchLyrics?${new URLSearchParams({ name: s.name, artist: s.artists[0].name })}`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const res = await response.json();
    return res;
  };

  const [selectedTrack, setSelectedTrack] = useState<Track>();
  return <div className={layout} >
    <div>
      <div>
        current user: {user?.display_name}
      </div>
      <button onClick={getPlaylists}>
        get playlists
      </button>
    </div>
    <div className={listContainer}>
      {playlists.map(p => {
        const imgSrc = p.images[0].url;
        const name = p.name;
        const playlistUrl = p.tracks.href;
        return <button key={playlistUrl} className={playlistButton} onClick={() => getSongs(playlistUrl)}>
          <img src={imgSrc} className={playlistImage} />
          <div className={playlistName}>{name}</div>
        </button>
      })}
    </div>
    <div className={listContainer}>
      {tracks.map((t, i) => {
        const imgSrc = t.album.images[0]?.url;
        const name = t.name;
        return <button key={i} className={playlistButton} onClick={() => setSelectedTrack(t)}>
          <img src={imgSrc} className={playlistImage} />
          <div className={playlistName}>{name}</div>
        </button>
      })}
    </div>
    <div className={listContainer}>
      <div></div>
      {selectedTrack && words[convertTrackToId(selectedTrack)]
        ? <div>
          {Object.entries(words[convertTrackToId(selectedTrack)])
            .map(v =>
              <div>
                {v[0]}: {v[1]}
              </div>)
          }
        </div>
        : null
      }
    </div>
  </div>
}
export default Callback;