import Image from "next/image";
import { buttonGroup, endImg, endScore } from "./Game.css";

interface Props {
  score: number;
  maxScore: number;
  children?: React.ReactNode;
}
const GameOver = (props: Props) => {
  const { score, maxScore, children } = props;

  return <>
    <h2>End</h2>
    <Image width="120" height="60" src="/img/endbar.svg" alt="" className={endImg} />
    <br />
    <div className={endScore}>
      <h4>Your Score</h4>
      <span>{score} / {maxScore}</span>
    </div>
    <div className={endScore}>
      <h4>Accuracy</h4>
      <span>{Math.floor(score / maxScore * 100)}%</span>
    </div>
    <div className={buttonGroup}>
      {children}
    </div>
  </>
}

export default GameOver;