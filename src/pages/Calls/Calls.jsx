import IconCard from "../../components/IconCard/IconCard";
import { callsData, callsDataWithHidden } from "../../data/CardsListCalls";
import { useDebug } from "../../debug/DebugContext";

import styles from './Calls.module.css'

const Activities = () => {
  const { settings } = useDebug();
  const cards = settings.revealIdeathonCard ? callsDataWithHidden : callsData;

  return (
    <section className={`${styles.activitiesContainer}`}>
      <h1>Atividades</h1>

      <section className={`${styles.activitiesCardsSection}`}>
        {cards.map((activitieCard) => (
          <IconCard icon={activitieCard.icon} title={activitieCard.title} text={activitieCard.text} url={activitieCard.url} key={activitieCard.url} />
        ))}
      </section>
    </section>
  );
}

export default Activities;
