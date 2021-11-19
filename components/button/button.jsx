import styles from './button.module.css';

function Button(props) {
  const { onClick, text } = props;
  const buttonClasses = [styles.button];

  return (
    <button className={buttonClasses.join(' ')} onClick={onClick}>{ text }</button>
  );
}

export default Button;
