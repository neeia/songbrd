import FocusTrap from "focus-trap-react";
import { BiX } from "react-icons/bi";
import { scroller } from "../styles/app.css";
import { closeButton, hideMenu, menuHeader, showMenu } from "./Menu.css";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
}
const Menu = (props: Props) => {
  const { open, onClose, title, children } = props;
  const checkEsc = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  return <FocusTrap active={open} focusTrapOptions={{ fallbackFocus: "#modal" }}>
    <dialog className={open ? showMenu : hideMenu} open data-open={open} id="modal" tabIndex={-1} onKeyDown={checkEsc}>
      <div className={menuHeader}>
        <h3>{title}</h3>
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