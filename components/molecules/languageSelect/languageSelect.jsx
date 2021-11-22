/* Third party */
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

/* Own components */
import Select from 'components/atoms/select/select';

/* Styles */
import styles from './languageSelect.module.css';

function LanguageSelect(props) {
  const { className } = props;
  const { t } = useTranslation('language');
  const router = useRouter();

  const selectLanguage = ev => {
    router.push(router.basePath, router.basePath, { locale: ev.target.value });
  };

  return (
    <Select className={className || ''} defaultValue={router.locale} onChange={selectLanguage}>
      { router.locales.map(locale => <option key={locale} value={locale}>{t(locale)}</option>) }
    </Select>
  );
}

export default LanguageSelect;
