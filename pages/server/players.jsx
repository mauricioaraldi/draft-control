/* Third party */
import { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

/* Layouts */
import ServerLayout from 'layouts/server/serverLayout';

/* Own components */
import Input from 'components/atoms/input/input';

/* Styles */
import styles from 'styles/players.module.css';

export default function Counter() {
  const { t } = useTranslation(['common', 'server']);
  const draftName = 'Draft Name that is very long';
  const [players, setPlayers] = useState(['']);

  const onKeyUpPlayer = (ev, index) => {
    const value = ev.target.value.trim();
    const isLastPlayer = index === players.length - 1;

    players[index] = value;

    if (isLastPlayer && value) {
      players.push('');
    } else if (players.length > 1) {
      const lastPlayer = players[players.length - 1];
      const playerBeforeLast = players[players.length - 2];

      if (!lastPlayer && !playerBeforeLast) {
        players.pop();
      }
    }

    console.log(players);

    setPlayers(players);
  };

  return (
    <ServerLayout className={styles.main} draftName={draftName}>
      <h2>{ t('server:insertPlayers') }</h2>

      {
        players.map((player, index) =>
          <Input
            key={index}
            placeholder={t('common:player')}
            onKeyUp={ev => onKeyUpPlayer(ev, index)}
          />
        )
      }
    </ServerLayout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'language', 'server'])),
    },
  };
}
