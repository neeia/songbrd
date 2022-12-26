import { style } from "@vanilla-extract/css";
import { iconButton } from "../styles/app.css";

export const menu = style([{
  position: "fixed",
  display: "grid",
  alignContent: "start",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  margin: "auto",
  transition: "transform 1s cubic-bezier(0, 1, 0, 1), opacity .1s ease-in-out, visibility .5s",
  width: "100vw",
  height: "100vh",
  zIndex: 1000,
  backgroundColor: "#121212",
  boxShadow: "0px 0px 12px 4px #000",
  border: 0,
  padding: "1rem",
  "@media": {
    "screen and (min-width: 769px)": {
      maxHeight: "800px",
      maxWidth: "600px",
      boxShadow: "0px 0px 12px 4px #000, 0 0 0 10000vh rgba(0,0,0,.5)",
    },
  },
  selectors: {
    "&[data-open='false']": {
      visibility: "hidden",
    },
    "&[data-open='true']": {
      visibility: "visible",
    }
  }
}])

export const hideMenu = style([menu, {
  transform: "translate(0, 100vh)",
  opacity: 0,
}])
export const showMenu = style([menu, {
  transform: "translate(0, 0vh)",
  opacity: 1,
}])

export const menuHeader = style({
  display: "flex",
  justifyContent: "center",
  fontSize: "1.25em",
  marginBottom: 4,
})

export const closeButton = style([iconButton, {
  position: "absolute",
  top: 0,
  right: 0,
  backgroundColor: "transparent",
  padding: 4,
  margin: 16,
}])
