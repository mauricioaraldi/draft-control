/* Third party */
import { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

/* Icons */
import { MdMenu } from 'react-icons/md';

/* Own components */
import Button from 'components/atoms/button/button';
import Input from 'components/atoms/input/input';
import LanguageSelect from 'components/molecules/languageSelect/languageSelect';
import ModalMenu from 'components/organisms/modalMenu/modalMenu';
import Select from 'components/atoms/select/select';

/* Constants */
import { APP_NAME } from 'constants/app.const';

/* Styles */
import styles from './server.module.css';

export default function Counter() {
  const { t } = useTranslation(['common', 'server']);
  const draftName = 'Draft Name that is very long';

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className={styles.header}>
        <Button onClick={toggleMenu}><MdMenu /></Button>

        <h1>{ draftName || APP_NAME }</h1>
      </header>

      <main className={styles.main}>
        <h2>{ t('server:createANewDraft') }</h2>
        <Input placeholder={t('server:myDraft')} />
        <Button>{t('common:create')}</Button>
  
        <h2 className={styles.secondTitle}>{t('server:orLoadOne')}</h2>
        <Select></Select>
        <Button>{t('common:load')}</Button>
      </main>

      <ModalMenu title={APP_NAME} isOpen={isMenuOpen} onClose={toggleMenu}>
        <LanguageSelect className={styles.languageSelect} />
      </ModalMenu>
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'language', 'server'])),
    },
  };
}
