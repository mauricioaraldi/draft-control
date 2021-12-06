/* Third party */
import { useState } from 'react';

/* Own components */
import Header from 'components/organisms/header/header';
import SideMenu from 'components/organisms/sideMenu/sideMenu';

/* Styles */
import styles from './serverLayout.module.css';

function ServerLayout(props) {
  const { children, className, draftName } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainClasses = [styles.main];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (className) {
    mainClasses.push(className);
  }

  return (
    <>
      <Header onMenu={toggleMenu} title={draftName} />

      <main className={mainClasses.join(' ')}>
        { children }
      </main>

      <SideMenu isOpen={isMenuOpen} onClose={toggleMenu} />
    </>
  );
}

export default ServerLayout;
