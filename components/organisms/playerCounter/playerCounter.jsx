/* Third party */
import { useCallback, useRef, useState } from 'react';

/* Own components */
import Button from 'components/atoms/button/button';
import Select from 'components/atoms/select/select';

/* Icons */
import { MdUndo } from 'react-icons/md';

/* Styles */
import styles from './playerCounter.module.css';

function PlayerCounter(props) {
  const { children, className, debounce = 400, initialHP = 20, players = [] } = props;
  const containerClasses = [styles.container];
  const [currentHP, setCurrentHP] = useState(initialHP);
  const [history, setHistory] = useState([]);
  const currentHPDelta = { hp: 0, time: 0 };
  const hpRef = useRef(null);
  const historyRef = useRef(null);

  if (className) {
    containerClasses.push(className);
  }

  const changeHP = amount => {
    currentHPDelta = {
      hp: currentHPDelta.hp + amount,
      time: new Date().getTime(),
    };

    hpRef.current.textContent = currentHP + currentHPDelta.hp;

    setTimeout(() => {
      if (new Date().getTime() - currentHPDelta.time < debounce) {
        return;
      }

      if (currentHPDelta.hp === 0) {
        currentHPDelta = {
          hp: 0,
          time: 0,
        };

        return;
      }

      history.push(currentHPDelta.hp);
      setHistory(history);

      historyRef.current.scrollTo(0, 0);

      setCurrentHP(currentHP + currentHPDelta.hp);

      currentHPDelta = {
        hp: 0,
        time: 0,
      };
    }, debounce);
  };

  const undo = () => {
    if (!history.length || currentHPDelta.time) {
      return;
    }

    const lastHpEntry = history.pop();

    setCurrentHP(currentHP - lastHpEntry);

    setHistory(history);
  };

  return (
    <div className={containerClasses.join(' ')}>
      <Select className={styles.name}>
        { players.map(player => <option key={player.id} value={player.id}>{player.name}</option>) }
      </Select>

      <span className={styles.hp} ref={hpRef}>{currentHP + currentHPDelta.hp}</span>

      <Button className={styles.undo} onClick={() => undo()}><MdUndo /></Button>

      <div className={styles.buttons}>
        <Button onClick={() => changeHP(1)}>+1</Button>
        <Button onClick={() => changeHP(5)}>+5</Button>
        <Button onClick={() => changeHP(-1)}>-1</Button>
        <Button onClick={() => changeHP(-5)}>-5</Button>
      </div>

      <div className={styles.history} ref={historyRef}>
        { 
          history.map((entry, index) => <span key={index}>{entry < 0 ? entry : `+${entry}`}</span>)
        }
      </div>
    </div>
  );
}

export default PlayerCounter;
