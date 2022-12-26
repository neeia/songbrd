import { style } from '@vanilla-extract/css';
import { ellipsisText, listButton } from 'styles/app.css';

export const textOverflow = style({
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  marginRight: "0.5ch",
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
  width: 60,
  height: 60,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#424242",
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
