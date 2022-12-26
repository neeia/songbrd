import { style } from "@vanilla-extract/css";
import { textBox } from "styles/app.css";

export const spotifyLogin = style({
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5ch",
  color: "#1ED760",
  fontSize: 20,
  fontWeight: 500,
  "@media": {
    "screen and (min-width: 769px)": {
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

export const spotifyContainer = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 4,
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
