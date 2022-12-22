import { style } from "@vanilla-extract/css";

const main = style({
  width: "100vw",
  height: "100vh",
  backgroundColor: "#121212",
  padding: "1rem",
  boxSizing: "border-box",
  marginLeft: "auto",
  marginRight: "auto",
  boxShadow: "0px 0px 36px 4px #000",
})

export const scroller = style({
  maxHeight: "calc(100% - 40px)",
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

export const listContainer = style([scroller, {
  display: "flex",
  flexDirection: "column",
}])

export const loginLayout = style([main, {
  display: "grid",
  gridTemplateAreas: `"title" "auth" "settings"`,
  gridTemplateRows: "40vh auto auto 1fr",
  alignItems: "end",
  justifyContent: "center",
  justifyItems: "center",
}])
export const titleContainer = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 36,
  padding: 16,
  "@media": {
    "screen and (min-width: 768px)": {
      fontSize: 48,
    },
    "screen and (min-width: 1200px)": {
      fontSize: 56,
    },
  }
})
export const loggedInTitleContainer = style([titleContainer, {
  gridArea: "title",
  fontSize: 12,
  padding: 16,
  "@media": {
    "screen and (min-width: 768px)": {
      fontSize: 16,
    },
    "screen and (min-width: 1200px)": {
      fontSize: 24,
    },
  }
}])

export const inlineIcon = style({
  height: "1.25em",
  width: "min-content",
})

export const loginContainer = style({
  gridArea: "auth",
})
export const spotifyLogin = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5ch",
  color: "#1ED760",
  fontSize: 20,
  fontWeight: 500,
  border: "1px solid #1ED760",
  padding: "4px 16px",
  borderRadius: 9999,
  ":hover": {
    borderColor: "white",
    backgroundColor: "#141D19",
  },
  "@media": {
    "screen and (min-width: 768px)": {
      fontSize: 24,
    },
    "screen and (min-width: 1200px)": {
      fontSize: 28,
    },
  }
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
export const settingsContainer = style({
  gridArea: "settings",
  display: "flex",
  marginTop: 6,
  gap: 4,
})



export const layout = style([main, {
  display: "grid",
  gridTemplateAreas: `"title content auth"
                      "title content settings"
                      "playlist secondary secondary"`,
  gridTemplateRows: "min-content min-content minmax(0, 100%)",
  gridTemplateColumns: "auto 1fr auto",
  gap: "0px 1rem",
  justifyContent: "center",
  justifyItems: "center",
}])

export const listButton = style({
  backgroundColor: "transparent",
  border: 0,
  padding: 8,
  ":hover": {
    backgroundColor: "#323232",
    cursor: "pointer",
  }
})
export const iconButton = style([listButton, {
  height: "min-content",
  width: "min-content",
  borderRadius: "50%",
  lineHeight: 0
}])

export const ellipsisText = style({
  textAlign: "left",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
})

export const primary = style({
  gridArea: "content",
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateAreas: `"word button" "timer button"`,
  gridTemplateColumns: "1fr 30%",
  gridTemplateRows: "1fr auto",
  justifyItems: "center",
  alignItems: "center",
  gap: "2px 0px"
})
export const secondary = style({
  gridArea: "secondary",
  width: "100%",
  height: "100%",
})

export const generateButton = style({
  gridArea: "button",
  backgroundColor: "#8c4ed7",
  fontSize: 24,
  border: 0,
  padding: 8,
  borderRadius: 6,
  height: "min-content",
  justifySelf: "start",
  ":hover": {
    backgroundColor: "#bb98e5",
    cursor: "pointer",
  }
})
export const bigWord = style({
  gridArea: "word",
  fontSize: 32,
  textAlign: "center",
  alignSelf: "end",
})
export const timerContainer = style({
  gridArea: "timer",
  display: "flex",
  fontSize: 18,
})
