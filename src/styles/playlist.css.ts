import { style } from '@vanilla-extract/css';
import { ellipsisText, iconButton, listButton } from './app.css';

export const playlistContainer = style({
  gridArea: "playlist",
  maxHeight: "100%",
  width: "40ch",
  borderBottom: "8px solid #8c4ed7",
  borderRadius: "0px 0px 8px 0px",
})

export const playlistTitle = style({
  backgroundColor: "#8c4ed7",
  display: "flex",
  borderRadius: "0px 8px 0px 0px",
})
export const textOverflow = style({
  textOverflow: "ellipsis",
})
export const refreshButton = style([iconButton, {
  marginLeft: "auto",
}])
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
