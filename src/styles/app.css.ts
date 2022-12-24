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
export const textBox = style({
  backgroundColor: "#222222",
  border: "1px solid grey",
  borderRadius: 2,
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
  "@media": {
    "screen and (min-width: 768px)": {
      fontSize: 24,
    },
    "screen and (min-width: 1200px)": {
      fontSize: 28,
    },
  }
})
export const usernameSearchBox = style([textBox, {
  width: "20ch",
  fontSize: "0.9em",
  padding: 4,
}])
export const errorText = style({
  color: "rgb(255, 40, 40)",
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
                      "playlist secondary tertiary"`,
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
    backgroundColor: "rgba(200, 200, 200, 0.25)",
    cursor: "pointer",
  }
})
export const iconButton = style([listButton, {
  height: "min-content",
  width: "min-content",
  borderRadius: "50%",
  lineHeight: 0,
  selectors: {
    "a.&": {
      color: "unset",
    }
  }
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
  display: "flex",
  justifyItems: "center",
  alignItems: "center",
  gap: "2px 0px"
})
export const secondary = style({
  gridArea: "secondary",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  fontSize: "2em",
  paddingBottom: "20%",
})
export const tertiary = style({
  gridArea: "tertiary",
  width: "100%",
  height: "100%",
})

export const gameButton = style({
  backgroundColor: "#8c4ed7",
  fontSize: 24,
  border: 0,
  padding: 8,
  borderRadius: 6,
  height: "min-content",
  ":hover": {
    backgroundColor: "#bb98e5",
    cursor: "pointer",
  }
})

export const startButton = style([gameButton, {
  width: "100%",
  maxWidth: "25ch",
  display: "grid",
  gridTemplateAreas: `"img label" "img desc"`,
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: "0px 1ch",
  paddingLeft: "0.25ch",
  textAlign: "left"
}])
export const startImg = style({
  gridArea: "img",
  
})
export const startLabel = style({
  gridArea: "label",
  fontSize: "1.5em",
  lineHeight: "0.9"
})
export const startDesc = style({
  gridArea: "desc",
  fontSize: ".75em"
})

export const gameArea = style({
  gridArea: "secondary",
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "min-content auto 1fr auto min-content",
  justifyItems: "center",

})
export const wordCount = style({
  fontSize: 12,
  textAlign: "center",
  alignSelf: "end",
})
export const bigWord = style({
  fontSize: 32,
  textAlign: "center",
  alignSelf: "end",
  lineHeight: "0.9",
  paddingBottom: "20px"
})
export const controlsContainer = style({
  display: "flex",
  gap: 12,
})
export const gameControlButton = style([gameButton, {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "8ch",
}])
export const timerContainer = style({
  display: "flex",
  fontSize: 32,
  width: "100%",
  maxWidth: "50ch",
})
