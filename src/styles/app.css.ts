import { style } from '@vanilla-extract/css';

export const layout = style({
  display: "grid",
  gridTemplateAreas: `"auth title info"
                      "playlist main song"
                      "playlist main fail"
                      "playlist main util"`,
  gridTemplateColumns: "1fr 2fr 1fr",
  gridTemplateRows: "72px 2fr 1fr 10%",
  gap: "1rem",
  padding: "1rem",
  height: "100vh",
  width: "100vw",
  boxSizing: "border-box",
})

export const scroller = style({
  maxHeight: "100%",
  overflowY: "auto",
  scrollbarColor: "rgba(155, 155, 155, 0.5)",
  scrollbarWidth: "thin",
  "::-webkit-scrollbar": {
    width: "12px",
  },
  "::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(155, 155, 155, 0.5)",
    border: "transparent",
  },
})

export const sectionCard = style({
  backgroundColor: "#121212",
  borderRadius: "8px",
  padding: "8px",
  overflow: "hidden",
})
export const listContainer = style([scroller, {
  display: "flex",
  flexDirection: "column",
}])

export const titleContainer = style([sectionCard, {
  gridArea: "title",
}])
export const authContainer = style([sectionCard, {
  gridArea: "auth",
}])
export const failedContainer = style([sectionCard, {
  gridArea: "fail",
}])
export const mainContainer = style([sectionCard, {
  gridArea: "main",
}])
export const infoContainer = style([sectionCard, {
  gridArea: "info",
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
}])
export const utilContainer = style([sectionCard, {
  gridArea: "util",
}])

export const listButton = style({
  backgroundColor: "transparent",
  border: 0,
  padding: "8px",
  ":hover": {
    backgroundColor: "#323232",
    cursor: "pointer",
  }
})
export const iconButton = style([listButton, {
  height: "min-content",
  width: "min-content",
  borderRadius: "50%",
  lineHeight: "0px"
}])

export const ellipsisText = style({
  textAlign: "left",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
})

export const spotifyLogin = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5ch",
  color: "#1ED760",
  width: "100%",
  height: "100%",
  fontSize: 24,
  fontWeight: 500,
})
export const spotifyLoggedIn = style({
  display: "grid",
  gridTemplateColumns: "min-content 1fr auto",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5ch",
  width: "100%",
  height: "100%",
  fontSize: 24,
  fontWeight: 500,
})
