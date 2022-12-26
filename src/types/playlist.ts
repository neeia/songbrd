export interface Playlist {
  collaborative: boolean;
  description: string;
  href: string;
  id: string;
  images: PlaylistImage[];
  name: string;
  public: boolean;
  snapshot_id: string;
  tracks: Tracklist;
  type: string;
  uri: string;
}

export interface Tracklist {
  href: string;
  total: number;
}

export interface PlaylistImage {
  url: string;
  height: number;
  width: number;
}

export interface Track {
  name: string;
  artists: Artist[];
  album: Album;
  is_local: boolean;
}

export interface Artist {
  name: string;
}

export interface Album {
  name: string;
  type: string;
  images: Image[];
}

export interface Image {
  url: string;
  height: number;
  width: number;
}