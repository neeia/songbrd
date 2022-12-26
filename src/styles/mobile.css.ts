import { style } from "@vanilla-extract/css";

export const mobileLayout = style({
  height: "100vh",
  width: "100vw",
  position: "relative",
})
export const mobileAppBar = style({
  backgroundColor: "#8c4ed7",
  display: "flex",
})

export const mobileContainer = style({
  width: "100%",
  height: "calc(100vh - 52px)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  fontSize: "2em",
})
