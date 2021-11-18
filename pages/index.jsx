import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import styles from 'styles/counter.module.css';

export default function Counter() {
  const { t } = useTranslation('common');

  const openMenu = () => {
    alert('open menu');
  };

  return (
    <>
      <header className={styles.header}>
        <button onClick={openMenu}>M</button>
        <button id="openDieMenu">D</button>
        <h1 id="draftName">Draft Name</h1>
      </header>
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
