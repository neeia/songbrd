import { style } from "@vanilla-extract/css";

const main = style({
  width: "100dvw",
  height: "100svh",
  boxSizing: "border-box",
  marginLeft: "auto",
  marginRight: "auto",
  boxShadow: "0px 0px 36px 4px #000",
  "@media": {
    "screen and (min-width: 769px)": {
      padding: "1rem",
    },
    "screen and (min-width: 1200px)": {
      padding: "1rem",
    },
  }
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

export const mobileHidden = style({
  "@media": {
    "screen and (max-width: 768px)": {
      display: "none"
    },
  }
})
export const listContainer = style([scroller, {
  display: "flex",
  flexDirection: "column",
}])
export const inlineContainer = style([scroller, {
  display: "block",
  textAlign: "justify",
}])

export const loginLayout = style([main, {
  display: "grid",
  gridTemplateAreas: `"title" "cfg"`,
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
    "screen and (min-width: 769px)": {
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
    "screen and (min-width: 769px)": {
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

export const settingsContainer = style({
  display: "flex",
  marginTop: 6,
  gap: 4,
  justifyContent: "center",
})

export const utilContainer = style({
  gridArea: "cfg",
})

export const layout = style([main, {
  display: "grid",
  gridTemplateAreas: `"title content cfg"
                      "playlist secondary tertiary"`,
  gridTemplateRows: "min-content minmax(0, 100%)",
  gridTemplateColumns: "auto 1fr auto",
  gap: "0px 1rem",
  justifyContent: "center",
  justifyItems: "center",
  "@media": {
    "screen and (max-width: 768px)": {
      gridTemplateAreas: "none",
      gridTemplateRows: "100%",
      gridTemplateColumns: "100%"
    },
  }
}])

export const playlistContainer = style({
  maxHeight: "100%",
  borderBottom: "8px solid #8c4ed7",
  position: "relative",
  gridArea: "playlist",
  borderRadius: "0px 0px 8px 0px",
  display: "grid",
  gridTemplateRows: "40px 1fr",
  gridTemplateColumns: "100%",
  width: "100%",
  "@media": {
    "screen and (min-width: 769px)": {
      maxWidth: "30ch",
    },
    "screen and (min-width: 1200px)": {
      maxWidth: "40ch",
    },
  }
})
export const playlistTitle = style({
  backgroundColor: "#8c4ed7",
  display: "flex",
  "@media": {
    "screen and (min-width: 769px)": {
      borderRadius: "0px 8px 0px 0px",
    },
    "screen and (min-width: 1200px)": {
      borderRadius: "0px 8px 0px 0px",
    },
  }
})

export const listButton = style({
  backgroundColor: "transparent",
  border: 0,
  padding: 8,
  ":hover": {
    backgroundColor: "rgba(200, 200, 200, 0.25)",
    cursor: "pointer",
  }
})
export const inlineButton = style([listButton, {
  display: "inline",
}])
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
export const refreshButton = style([iconButton, {
  marginLeft: "auto",
}])

export const menuButton = style([iconButton, {
  marginLeft: "auto",
  "@media": {
    "screen and (min-width: 769px)": {
      display: "none"
    },
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
  justifyContent: "center",
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

export const gameArea = style({
  gridArea: "secondary",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyItems: "center",
  position: "relative",
  gap: 8,
  fontSize: 28,
})

export const gameButton = style({
  backgroundColor: "#8c4ed7",
  fontSize: 24,
  border: 0,
  padding: 8,
  borderRadius: 6,
  height: "min-content",
  "@media": {
    "screen and (max-width: 768px)": {
      fontSize: 16,
    },
  },
  selectors: {
    "&:hover:enabled": {
      backgroundColor: "#bb98e5",
      cursor: "pointer",
    },
    "&:disabled": {
      filter: "brightness(0.5)",
      cursor: "unset"
    }
  }
})
export const startButton = style([gameButton, {
  width: "100%",
  maxWidth: "25ch",
  display: "grid",
  gridTemplateAreas: `"img label" "img desc"`,
  gridTemplateColumns: "32px 1fr",
  alignItems: "center",
  gap: "0px 1ch",
  paddingLeft: 12,
  textAlign: "left"
}])
export const startImg = style({
  gridArea: "img",
  fontSize: 32,
  textAlign: "center",
  lineHeight: "1",
})
export const startLabel = style({
  gridArea: "label",
  fontSize: "1.5em",
  lineHeight: "0.9",
  pointerEvents: "none"
})
export const startDesc = style({
  gridArea: "desc",
  fontSize: ".75em"
})

export const timerContainer = style({
  display: "flex",
  fontSize: 32,
  width: "4ch",
  marginLeft: "auto",
  alignItems: "center",
  "@media": {
    "screen and (min-width: 769px)": {
      marginRight: "auto",
    },
  }
})
