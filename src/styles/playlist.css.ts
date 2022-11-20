import { style } from '@vanilla-extract/css';
import { ellipsisText, listButton, sectionCard } from './app.css';

export const playlistContainer = style([sectionCard, {
  gridArea: "playlist",
}])

export const playlistTitle = style({
  display: "flex",
  justifyContent: "space-between",
})
export const playlistButton = style([listButton, {
  display: "grid",
  gridTemplateAreas: `"img name name" "img desc count"`,
  gridTemplateColumns: "min-content 1fr",
  alignItems: "center",
  gap: "0px 12px",
  width: "100%",
}]);
export const playlistImage = style({
  gridArea: "img",
})
export const playlistName = style([ellipsisText, {
  gridArea: "name",
  fontSize: 16,
}])
export const playlistDesc = style([ellipsisText, {
  gridArea: "desc",
  fontSize: 16,
  color: "darkgrey",
}])
export const playlistCount = style({
  gridArea: "count",
  fontSize: 16,
  color: "darkgrey",
  display: "flex",
  justifyContent: "space-between",
})
