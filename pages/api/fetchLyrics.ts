// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import cheerio, { CheerioAPI } from 'cheerio';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { addDoc, doc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import { convertNameAndArtistToId } from '../../src/util/track';

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
  try {
    const q = req.query as Request;
    const songArtist = q.artist;
    const songName = q.name
      .split("(Feat", 1)[0]
      .split("(feat", 1)[0]
      .split("- From", 1)[0]
      .split("- from", 1)[0]
      .split("(From", 1)[0]
      .split("(from", 1)[0];
    console.log(`${songName} by ${songArtist}: Received Song`);

    // Check if song is already indexed in db
    const docRef = doc(db, "artists", songArtist.replace("/", ""), "songs", songName.replace("/", ""));
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
      const songRelationships: { relationship_type: string; songs: { language: string; url: string }[] }[] = song.song_relationships;
      const translationOf = songRelationships.find(el => el.relationship_type === "translation_of");
      console.log(`${songName} by ${songArtist}: ${song.title}: Result with title`);
      hitSongName = song.title;
      hitSongArtist = song.primary_artist.name;
      if (hitSongArtist === "Spotify") continue;

      // Check if song is a translation of another song
      if (translationOf && translationOf.songs.length > 0) {
        // If it is, then make sure the other song is in English
        const originalSong = translationOf.songs[0];
        if (originalSong.language === "en") songUrl = originalSong.url;
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
      // TODO: Log the failure in firebase
      return res.status(204);
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
      console.log(`${songName} by ${songArtist}: Saving to Log`);
      setDoc(docRef, words);

      const today = new Date().toISOString().slice(0, 10)
      const logRef = doc(db, "logs", today);
      await getDoc(logRef).then(doc => {
        if (!doc.exists()) {
          setDoc(logRef, { date: today }, { merge: true });
        }
        updateDoc(logRef,
          convertNameAndArtistToId(songName.replace("/", ""), songArtist.replace("/", "")),
          convertNameAndArtistToId(hitSongName.replace("/", ""), hitSongArtist.replace("/", "")));
      })
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    return res.status(200).json({ lyrics: words });
  } catch (error) {
    throw error;
  }
}
