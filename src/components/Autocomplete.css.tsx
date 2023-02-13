import { style } from "@vanilla-extract/css";

export const autoForm = style({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 4,
  alignItems: "center",
})
export const autocomplete = style({
  position: "relative",
})

export const textBox = style({
  border: "none",
  padding: "10px 6px",
  width: "30ch",
})

export const submit = style({
  border: "none",
  padding: 4,
  cursor: "pointer",
  height: "100%",
  backgroundColor: "#8c4ed7"
})

export const autocompleteItemContainer = style({
  position: "absolute",
  border: "1px solid grey",
  borderTop: "none",
  zIndex: 50,
  top: "100%",
  left: 0,
  right: 0,
  maxHeight: "50vh",
  overflowY: "auto",
  transition: "max-height 0.15s ease-in-out"
})
export const hiddenItemContainer = style([autocompleteItemContainer, {
  maxHeight: 0,
  pointerEvents: "none",
}])

export const autocompleteItem = style({
  display: "flex",
  textAlign: "left",
  border: "none",
  width: "100%",
  backgroundColor: "rgba(10, 10, 10, 0.9)",
  padding: 8,
  gap: 8,
  alignItems: "center",
  overflow: "hidden",
  margin: 0,
  cursor: "pointer",
  borderBottom: "1px solid grey",
  selectors: {
    "&:hover": {
      backgroundColor: "grey"
    },
    "&:active": {
      backgroundColor: "lightgrey"
    }
  }
})

export const songName = style({
  maxHeight: 44,
  overflow: "hidden",
  color: "whitesmoke",
})
export const strong = style({
  color: "white"
})
export const hidden = style({
  display: "none",
})
export const focus = style({
  backgroundColor: "darkgrey"
})