import { inlineButton, inlineContainer } from "styles/app.css";
import { HistoryEntry } from "types/game";
import { useState } from "react";
import Menu from "../Menu";
import Song from "../menu/Song";

interface Props {
  history: HistoryEntry[];
}
const Review = (props: Props) => {
  const { history } = props;
  const [word, setWord] = useState<HistoryEntry | undefined>();
  const [open, setOpen] = useState<boolean>(false);

  return <div className={inlineContainer}>
    {history.map((w, i) =>
      <button key={i} className={inlineButton} onClick={() => { setWord(w); setOpen(true); }}>
        {w.word.word}
      </button>
    )}
    <Menu title={word?.word.word ?? ""} open={open} onClose={() => setOpen(false)}>
      {word && word.word.songs.map((t, i) => <Song track={t} key={i} />)
      }
    </Menu>
  </div>
}

export default Review;