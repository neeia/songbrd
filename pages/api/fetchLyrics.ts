import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { convertNameAndArtistToId } from 'util/track';

const firebaseConfig = {
  apiKey: "AIzaSyCQ0mcy2XyM6hJITjsGOjTbtUrIg_VIRRg",
  authDomain: "songbrd-d2e27.firebaseapp.com",
  projectId: "songbrd-d2e27",
  storageBucket: "songbrd-d2e27.appspot.com",
  messagingSenderId: "841279454824",
  appId: "1:841279454824:web:84a4098a0977b344a045dd"
};

function htmlDecodeWithLineBreaks($: CheerioAPI, html: string) {
  var breakToken = '_______break_______',
    lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken).replace(/<p\.*?>(.*?)<\/p>/gi, breakToken + '$1' + breakToken);
  return $('<div>').html(lineBreakedHtml).text().replace(new RegExp(breakToken, 'g'), '\n');
}

function fbClean(s: string) {
  return s.replaceAll("/", "").replaceAll(".", "").replaceAll("[", "(").replaceAll("]", ")");
}
type Data = {
  lyrics: Record<string, number>;
}
type Request = {
  name: string;
  artist: string;
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (!getApps().length) initializeApp(firebaseConfig);
  let app = getApp();
  const db = getFirestore(app);
  const today = new Date().toISOString().slice(0, 10)
  try {
    const q = req.query as Request;
    const songArtist = q.artist;
    const cleanSongArtist = fbClean(songArtist);
    const songName = q.name
      .split(/\([Ff]eat/, 1)[0]
      .split(/\- [Ff]rom/, 1)[0]
      .split(/\([Ff]rom/, 1)[0]
      .split(/-(.*)Remaster/, 1)[0]
      .split("- Single Version", 1)[0]
      .split("- Bonus Track", 1)[0];
    const cleanSongName = fbClean(songName);

    // Check if song is already indexed in db
    const docRef = doc(db, "artists", cleanSongArtist, "songs", cleanSongName);
    const checkDoc = await getDoc(docRef)
    if (checkDoc.exists()) {
      return res.status(200).json({ lyrics: checkDoc.data() })
    }

    // Search Genius API for artist + song name
    const searchResults = await axios.get(`https://api.genius.com/search?q=${encodeURIComponent(songArtist)}%20${encodeURIComponent(songName)}`, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      },
    });

    console.log(`${songName} by ${songArtist}: Searching Genius`);
    const hits = searchResults.data.response.hits;
    let songUrl = "";
    let hitSongName = "";
    let hitSongArtist = "";

    // Loop through search results
    for (const hitResult of hits) {
      console.log(`${songName} by ${songArtist}: ${hitResult.result.id}: Found result of id`);
      const hitSong = await axios.get(`https://api.genius.com/songs/${hitResult.result.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
        },
      });

      const song = hitSong.data.response.song;
      const songRelationships: {
        relationship_type: string;
        songs: {
          language: string;
          url: string;
          title: string;
          primary_artist: { name: string }
        }[]
      }[] = song.song_relationships;
      const translationOf = songRelationships.find(el => el.relationship_type === "translation_of");
      console.log(`${songName} by ${songArtist}: ${song.title}: Result with title`);
      hitSongName = song.title;
      hitSongArtist = song.primary_artist.name;
      if (hitSongArtist === "Spotify") continue;

      // Check if song is a translation of another song
      if (translationOf && translationOf.songs.length > 0) {
        // If it is, then make sure the other song is in English
        const originalSong = translationOf.songs[0];
        if (originalSong.language === "en") {
          hitSongName = originalSong.title;
          hitSongArtist = originalSong.primary_artist.name;
          songUrl = originalSong.url;
        }
      }
      else {
        // Otherwise, make sure our own song is in English
        if (song.language === "en") songUrl = song.url;
      }

      // If we have a valid url, we're done
      if (songUrl) break;
    }

    // If we've gone through the entire array without hitting a good url, then give up
    if (!songUrl) {
      console.log(`${songName} by ${songArtist}: No good url!`);
      const failureRef = doc(db, "failure", today);
      await getDoc(failureRef).then(d => {
        if (!d.exists()) {
          setDoc(failureRef, { date: today }, { merge: true });
        }
        updateDoc(failureRef, songArtist, songName);
      })
      return res.status(204).end();
    }

    // Now we scrape the song's data
    const targetSongData = await axios.get(songUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GENIUS_ACCESS_TOKEN}`
      },
    })

    const html = targetSongData.data;
    const $ = cheerio.load(html);
    const words: Record<string, number> = {};

    // Select the song's container
    $('div[data-lyrics-container="true"]').each((_idx, el) => {
      const lyrics = htmlDecodeWithLineBreaks($, $.html(el))
        .split("\n").filter(s => s.length > 0 && !s.includes("["));
      lyrics.forEach(line => {
        // Get rid of invalid & non-UTF8 chars
        line
          .replaceAll(/[.,?!:;()"\/\~]/ig, "")
          .replaceAll(/[-&]/ig, " ")
          .replaceAll(/[^\x00-\x7f]/ig, " ")
          .split(" ")
          .forEach(word => {
            if (!word) return;
            const w = word.toLocaleLowerCase();
            words[w] ??= 0;
            words[w] += 1;
          })
      })
    });

    // Save resulting object to db
    try {
      if (hitSongArtist.toLocaleLowerCase().replaceAll(" ", "") !== songArtist.toLocaleLowerCase().replaceAll(" ", "")
        && hitSongName.toLocaleLowerCase().replaceAll(" ", "") !== songName.toLocaleLowerCase().replaceAll(" ", "")) {
        console.log(`${songName} by ${songArtist}: ${hitSongName} by ${hitSongArtist}: Mismatch`);
        const warningRef = doc(db, "warnings", today);
        await getDoc(warningRef).then(d => {
          if (!d.exists()) {
            setDoc(warningRef, { date: today }, { merge: true });
          }
          updateDoc(warningRef,
            convertNameAndArtistToId(cleanSongName, cleanSongArtist),
            convertNameAndArtistToId(fbClean(hitSongName), fbClean(hitSongArtist))
          );
          return res.status(204).end();
        })
      } else {
        console.log(`${songName} by ${songArtist}: Saving to Log`);
        setDoc(docRef, words);

        const logRef = doc(db, "logs", today);
        await getDoc(logRef).then(d => {
          if (!d.exists()) {
            setDoc(logRef, { date: today }, { merge: true });
          }
          updateDoc(logRef,
            convertNameAndArtistToId(cleanSongName, cleanSongArtist),
            convertNameAndArtistToId(fbClean(hitSongName), fbClean(hitSongArtist))
          );
          return res.status(200).json({ lyrics: words });
        })
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    return res.status(500).end();
  } catch (error) {
    throw error;
  }
}
