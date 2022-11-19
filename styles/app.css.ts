import { style } from '@vanilla-extract/css';

export const layout = style({
  display: "grid",
  gridTemplateColumns: "auto auto auto 1fr",
})

export const listContainer = style({
  display: "flex",
  flexDirection: "column",
  gap: 10,
})

export const playlistButton = style({
  display: "grid",
  gridTemplateColumns: "min-content 1fr auto",
  alignItems: "center",
  padding: "8px",
  backgroundColor: "#212121",
  border: 0,
});

export const playlistImage = style({
  width: 60,
  height: 60,
})

export const playlistName = style({
  fontSize: 16,
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
})

export const playlistDesc = style({
  fontSize: 16,
})