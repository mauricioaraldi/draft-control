/* Own components */
import LanguageSelect from 'components/molecules/languageSelect/languageSelect';

import ModalMenu from 'components/organisms/modalMenu/modalMenu';

/* Constants */
import { APP_NAME } from 'constants/app.const';

/* Styles */
import styles from './sideMenu.module.css';

function SideMenu(props) {
  const { children, isOpen, onClose, title = APP_NAME } = props;

  return (
    <ModalMenu title={APP_NAME} isOpen={isOpen} onClose={onClose}>
      { children }

      <LanguageSelect className={styles.languageSelect} />
    </ModalMenu>
  );
}

export default SideMenu;
