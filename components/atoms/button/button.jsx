/* Styles */
import styles from './button.module.css';

function Button(props) {
  const { children, className, onClick } = props;
  const buttonClasses = [styles.button];

  if (className) {
    buttonClasses.push(className);
  }

  return (
    <button className={buttonClasses.join(' ')} onClick={onClick}>{ children }</button>
  );
}

export default Button;
