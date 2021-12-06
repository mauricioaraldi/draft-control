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
import PlayerCounter from 'components/organisms/playerCounter/playerCounter';

/* Styles */
import styles from 'styles/counter.module.css';

export default function Counter() {
  const { t } = useTranslation('counter');
  const draftName = 'Draft Name that is very long';
  const players = [
    {
      id: 1,
      name: 'Player 1',
    },
    {
      id: 2,
      name: 'Player 2',
    },
    {
      id: 3,
      name: 'Player 3',
    }
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDieMenuOpen, setIsDieMenuOpen] = useState(false);
  const [startGameTime, setStartGameTime] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDieMenu = () => {
    setIsDieMenuOpen(!isDieMenuOpen);
  };

  const rollDie = sides => {
    let randomNumber = Math.floor(Math.random() * sides) + 1;

    setIsDieMenuOpen(false);

    alert(randomNumber);
  };

  const confirmReset = () => {
    const resetConfirmed = confirm(t('areYouSureReset'));

    if (!resetConfirmed) {
      return;
    }

    setIsMenuOpen(false);
    setStartGameTime(new Date().getTime());
  };

  return (
    <>
      <header className={styles.header}>
        <Button onClick={toggleMenu}><MdMenu /></Button>
        <h1>{ draftName }</h1>
        <Button onClick={toggleDieMenu}><GiInvertedDice5 /></Button>
      </header>

      <main className={styles.counters}>
        <PlayerCounter key={`${startGameTime}_1`} className={styles.firstPlayer} players={players} />
        <PlayerCounter key={`${startGameTime}_2`} players={players} />
      </main>

      <ModalMenu isOpen={isMenuOpen} onClose={toggleMenu}>
        <Button id="endGame">{ t('endGame') }</Button>
        <Button id="reset" onClick={confirmReset}>{ t('reset') }</Button>

        <LanguageSelect className={styles.languageSelect} />
      </ModalMenu>

      <ModalMenu isOpen={isDieMenuOpen} onClose={toggleDieMenu} title={t('sides')}>
        <Button onClick={() => rollDie(10)}>10</Button>
        <Button onClick={() => rollDie(20)}>20</Button>
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
