import { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import Button from 'components/button/button';
import ModalMenu from 'components/modalMenu/modalMenu';

import styles from 'styles/counter.module.css';

export default function Counter() {
  const { t } = useTranslation('common');
  const draftName = '';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDieMenuOpen, setIsDieMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDieMenu = () => {
    setIsDieMenuOpen(!isDieMenuOpen);
  };

  return (
    <>
      <header className={styles.header}>
        <Button onClick={toggleMenu}>M</Button>
        <Button onClick={toggleDieMenu}>D</Button>
        <h1>{ draftName }</h1>
      </header>

      <ModalMenu isOpen={isMenuOpen}>
        <Button class="button" id="endGame">End game</Button>
        <Button class="button" id="reset">Reset</Button>
        <Button class="button" id="closeMenu">Close</Button>
      </ModalMenu>

      <ModalMenu isOpen={isDieMenuOpen}>
        <h1>Sides</h1>
        <Button class="button">10</Button>
        <Button class="button">20</Button>
      </ModalMenu>
      </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['counter'])),
    },
  };
}
