import FocusTrap from "focus-trap-react";
import { useEffect } from "react";
import { BiX } from "react-icons/bi";
import { scroller } from "../styles/app.css";
import { closeButton, hideMenu, menu, menuHeader, showMenu } from "./Menu.css";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}
const Menu = (props: Props) => {
  const { open, onClose, title, children } = props;

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <FocusTrap active={open} focusTrapOptions={{ fallbackFocus: "#modal" }}>
    <dialog className={open ? showMenu : hideMenu} open data-open={open} id="modal" tabIndex={-1}>
      <div className={menuHeader}>
        <h2>{title}</h2>
        <button onClick={onClose} className={closeButton}>
          <BiX fontSize="36px" />
        </button>
      </div>
      <div className={scroller}>
        {children}
      </div>
    </dialog>
  </FocusTrap>
}

export default Menu;