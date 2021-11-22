/* Styles */
import styles from './button.module.css';

function Button(props) {
  const { children, onClick } = props;
  const buttonClasses = [styles.button];

  return (
    <button className={buttonClasses.join(' ')} onClick={onClick}>{ children }</button>
  );
}

export default Button;
