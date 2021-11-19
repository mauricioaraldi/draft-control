import styles from './modalMenu.module.css';

function ModalMenu(props) {
  const { children, isOpen, title } = props;
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

        <button>X</button>
      </header>

      { children }
    </aside>
  );
}

export default ModalMenu;
