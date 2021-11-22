/* Third party */
import { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

/* Icons */
import { MdMenu } from 'react-icons/md';
import { GiInvertedDice5 } from 'react-icons/gi'

/* Own components */
import Button from 'components/atoms/button/button';
import LanguageSelect from 'components/molecules/languageSelect/languageSelect';
import ModalMenu from 'components/organisms/modalMenu/modalMenu';

/* Styles */
import styles from 'styles/counter.module.css';

export default function Counter() {
  const { t } = useTranslation('counter');
  const draftName = 'Draft Name that is very long';
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
        <Button onClick={toggleMenu}><MdMenu /></Button>
        <h1>{ draftName }</h1>
        <Button onClick={toggleDieMenu}><GiInvertedDice5 /></Button>
      </header>

      <ModalMenu isOpen={isMenuOpen} onClose={toggleMenu}>
        <Button class="button" id="endGame">{ t('endGame') }</Button>
        <Button class="button" id="reset">{ t('reset') }</Button>

        <LanguageSelect className={styles.languageSelect} />
      </ModalMenu>

      <ModalMenu isOpen={isDieMenuOpen} onClose={toggleDieMenu}>
        <h1>{ t('sides') }</h1>
        <Button class="button">10</Button>
        <Button class="button">20</Button>
      </ModalMenu>
      </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['counter', 'language'])),
    },
  };
}
