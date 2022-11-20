import { style } from '@vanilla-extract/css';
import { ellipsisText, listButton, sectionCard } from './app.css';

export const songContainer = style([sectionCard, {
  gridArea: "song",
}])

export const songListItem = style({
  display: "grid",
  gridTemplateAreas: `"img name" "img artist"`,
  gridTemplateColumns: "min-content 1fr",
  gap: "0px 12px",
  backgroundColor: "transparent",
  border: 0,
  padding: "8px",
})
export const songButton = style([listButton, songListItem])
export const songImage = style({
  gridArea: "img",
})
export const songName = style([ellipsisText, {
  gridArea: "name",
  fontSize: 16,
  alignSelf: "center"
}])
export const songArtist = style([ellipsisText, {
  gridArea: "artist",
  fontSize: 14,
  color: "darkgrey",
  alignSelf: "center"
}])
