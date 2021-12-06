/* Own components */
import Button from 'components/atoms/button/button';

/* Constants */
import { APP_NAME } from 'constants/app.const';

/* Icons */
import { MdMenu } from 'react-icons/md';

/* Styles */
import styles from './header.module.css';

function Header(props) {
  const { onMenu, title = APP_NAME } = props;
  const containerClasses = [styles.container];

  return (
    <header className={styles.container}>
      {
        onMenu ? <Button onClick={onMenu}><MdMenu /></Button> : null
      }

      <h1>{ title }</h1>
    </header>
  );
}

export default Header;
