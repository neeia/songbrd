import { useEffect, useState } from "react";
import { hide, progressBar, progressContainer } from "./ProgressBar.css";


interface Props {
  max: number;
  value: number;
}

const ProgressBar = (props: Props) => {
  const { max, value } = props;

  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (max > 0) {
      setHidden(false);
    }
    if (max === value) {
      setTimeout(() => {
        setHidden(true);
      }, 3000)
    }
  }, [value, max])

  return <div className={hidden ? hide : progressContainer}>
    <label htmlFor="download-progress">Songs Matched:</label>
    <progress id="download-progress" className={progressBar} max={max} value={value}>
    </progress>
    {`${value} of ${max}`}
  </div>
}

export default ProgressBar;