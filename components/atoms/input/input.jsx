/* Styles */
import styles from './input.module.css';

function Input(props) {
  const { children, className, ...otherProps } = props;
  const inputClasses = [styles.input];

  if (className) {
    inputClasses.push(className);
  }

  return (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <input className={inputClasses.join(' ')} { ...otherProps }>{ children }</input>
  );
}

export default Input;
