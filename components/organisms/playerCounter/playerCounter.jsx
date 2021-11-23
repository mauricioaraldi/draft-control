/* Third party */
import { useRef, useState } from 'react';

/* Own components */
import Button from 'components/atoms/button/button';
import Select from 'components/atoms/select/select';

/* Icons */
import { MdUndo } from 'react-icons/md';

/* Styles */
import styles from './playerCounter.module.css';

function PlayerCounter(props) {
  const { children, className, debounce = 400, hp = 20, players = [] } = props;
  const containerClasses = [styles.container];
  const [currentHP, setCurrentHP] = useState(hp);
  const [history, setHistory] = useState([]);
  const [currentHPDelta, setCurrentHPDelta] = useState({ hp: 0, time: 0 });
  const historyRef = useRef(null);

  if (className) {
    containerClasses.push(className);
  }

  const changeHP = (amount, noHistory) => {
    setCurrentHPDelta({
      hp: currentHPDelta.hp + amount,
      time: new Date().getTime(),
    });

    setTimeout(() => {
      if (new Date().getTime() - currentHPDelta.time < debounce) {
        return;
      }

      if (currentHPDelta === 0) {
        setCurrentHPDelta({
          hp: 0,
          time: 0,
        });

        return;
      }

      const historyEntry = currentHPDelta.hp < 0 ? currentHPDelta.hp : `+${currentHPDelta.hp}`;

      if (!noHistory) {
        setHistory([ ...history, historyEntry ]);
      }

      historyRef.current.scrollTo(0, 0);

      setCurrentHP(currentHP + currentHPDelta.hp);

      setCurrentHPDelta({
        hp: 0,
        time: 0,
      });
    }, debounce);
  };

  return (
    <div className={containerClasses.join(' ')}>
      <Select className={styles.name}>
        { players.map(player => <option key={player.id} value={player.id}>{player.name}</option>) }
      </Select>

      <span className={styles.hp}>{currentHP + currentHPDelta.hp}</span>

      <Button className={styles.undo}><MdUndo /></Button>

      <div className={styles.buttons}>
        <Button onClick={() => changeHP(1)}>+1</Button>
        <Button onClick={() => changeHP(5)}>+5</Button>
        <Button onClick={() => changeHP(-1)}>-1</Button>
        <Button onClick={() => changeHP(-1)}>-5</Button>
      </div>

      <div className={styles.history} ref={historyRef}>
        { history.map((entry, index) => <span key={index}>{entry}</span>) }
      </div>
    </div>
  );
}

export default PlayerCounter;
