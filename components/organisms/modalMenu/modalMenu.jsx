/* Icons */
import { MdClose } from 'react-icons/md';

/* Own components */
import Button from 'components/atoms/button/button';

/* Styles */
import styles from './modalMenu.module.css';

function ModalMenu(props) {
  const { children, isOpen, onClose, title } = props;
  const containerClasses = [styles.container];

  if (isOpen) {
    containerClasses.push(styles.open);
  }

  return (
    <aside className={containerClasses.join(' ')}>
      <header className={styles.header}>
        {
          title
            ? (<h1 className={styles.title}>{title}</h1>)
            : null
        }

        <Button onClick={onClose}><MdClose /></Button>
      </header>

      <div className={styles.content}>
        { children }
      </div>
    </aside>
  );
}

export default ModalMenu;
