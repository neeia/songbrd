import { style } from "@vanilla-extract/css"

export const progressContainer = style({
  position: "absolute",
  width: "100%",
  height: "min-content",
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "rgba(12, 12, 12, 0.9)",
})
export const hide = style({
  display: "none",
})

export const progressBar = style({
  appearance: "none",
  width: "100%",
  marginTop: "3px",
  paddingLeft: "8px",
  paddingRight: "8px",
  height: "0.5em",
  boxShadow: "0px 0px 4px -2px black",
  "::-webkit-progress-value": {
    backgroundColor: "#bb98e5"
  },
  "::-webkit-progress-bar": {
    backgroundColor: "rgba(80, 80, 80, 0.75)"
  },
  "::-moz-progress-bar": {
    backgroundColor: "#bb98e5"
  }
})
export const doneProgressBar = style([progressBar, {
  "::-webkit-progress-value": {
    backgroundColor: "green"
  },
}])
