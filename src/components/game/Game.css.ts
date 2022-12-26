import { style } from "@vanilla-extract/css";
import { match } from "assert";
import { gameButton } from "../../styles/app.css";

export const wordCount = style({
  fontSize: 12,
  textAlign: "center",
})
export const bigWord = style({
  fontSize: 32,
  textAlign: "center",
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
export const footer = style({
  position: "absolute",
  bottom: 8,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  fontSize: 24,
})
export const gameMode = style({
  display: "flex",
  alignItems: "center",
})

export const endImg = style({
  filter: "invert(100%)",
  height: "3em",
  width: "6em",
})

export const endScore = style({
  lineHeight: "1.1",
  textAlign: "center"
})

export const buttonGroup = style([footer, {
  gap: 8,
}])

export const answerContainer = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: 8,
  alignItems: "center"
})

