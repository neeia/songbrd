import { Track } from "types/playlist"

export const convertNameAndArtistToId = (name: string, artist: string) => {
  return `${name}__${artist}`;
}
export const convertTrackToId = (track: Track) => {
  return `${track.name}__${track.artists[0].name}__${track.album.name}`;
}