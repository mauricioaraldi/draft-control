/* Styles */
import styles from './select.module.css';

function Select(props) {
  const { className, children, ...otherProps } = props;
  const selectClasses = [styles.select];

  if (className) {
    selectClasses.push(className);
  }

  return (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <select className={selectClasses.join(' ')} { ...otherProps }>{ children }</select>
  );
}

export default Select;
