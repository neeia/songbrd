import { style } from "@vanilla-extract/css";


const word = style({
})

export const successWord = style([word, {
  color: "#AAFFAA"
}])
export const failureWord = style([word, {
  color: "#FFAAAA"
}])