import Image from "next/image";
import { inlineIcon } from "styles/app.css";

const Title = () => {

  return <>
    Songb<Image src="/songbrd.svg" width={128} height={128} className={inlineIcon} alt="i" />rd
  </>
}

export default Title;