import { appWithTranslation } from 'next-i18next';

import 'styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      { /* eslint-disable-next-line react/jsx-props-no-spreading */ }
      <Component {...pageProps} />
    </>
  );
}

export default appWithTranslation(MyApp);
