import partnersData from '../../data/PartnersData.js';
import { useDebug } from '../../debug/DebugContext';
import styles from './Partners.module.css';

function Partners() {
    const { settings } = useDebug();
    const revealed = settings.revealPartnerLogos;
    const highlight = revealed && settings.highlightRevealed ? 'debug-revealed' : '';

    return (
        <section className="container">
            <h1 className="mainTitle">Conheça as instituições que apoiam o <strong>SERCOMP</strong></h1>

            {!revealed && (
                <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem' }}>
                    Os logos dos parceiros estão comentados no código original. Abra o painel DEBUG → “Conteúdo oculto” e ative “Logos de parceiros” para vê-los.
                </p>
            )}

            <div className={`container ${styles.patrocinadores}`}>
                <div className={styles.patrocinadoresContainer}>
                    {partnersData
                        .map((partner, index) => (
                            <article className={`${styles.patrocinadoresMember} ${highlight}`} key={index}>
                                {revealed && (
                                    <div className={styles.patrocinadoresMemberImage}>
                                        <a href={partner.href} target="_blank" rel="noreferrer">
                                            <img src={partner.image} alt={partner.alt} />
                                        </a>
                                    </div>
                                )}
                            </article>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}

export default Partners;
