/* Third party */
import { useState } from 'react';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

/* Layouts */
import ServerLayout from 'layouts/server/serverLayout';

/* Own components */
import Button from 'components/atoms/button/button';
import Input from 'components/atoms/input/input';
import Select from 'components/atoms/select/select';

/* Styles */
import styles from 'styles/server.module.css';

export default function Counter() {
  const { t } = useTranslation(['common', 'server']);
  const draftName = 'Draft Name that is very long';

  return (
    <ServerLayout className={styles.main} draftName={draftName}>
      <h2>{ t('server:createANewDraft') }</h2>
      <Input placeholder={t('server:myDraft')} />
      <Button>{t('common:create')}</Button>

      <h2 className={styles.secondTitle}>{t('server:orLoadOne')}</h2>
      <Select></Select>
      <Button>{t('common:load')}</Button>
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
