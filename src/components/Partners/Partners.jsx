import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import partnersData from '../../data/PartnersData.js';
import { useDebug } from '../../debug/DebugContext';
import styles from './Partners.module.css';

export default function Partners() {
    const { settings } = useDebug();
    const revealed = settings.revealPartnerLogos;
    const highlight = revealed && settings.highlightRevealed ? 'debug-revealed' : '';

    return (
        <section className={styles.partners}>
            <div className={`container ${styles.partnersContainer}`}>
                {revealed && (
                    <h2 className={highlight}>
                        CONHEÇA NOSSOS PARCEIROS
                    </h2>
                )}
                <Swiper
                    modules={[Autoplay]}
                    className={`mySwiper ${styles.mySwiper}`}
                    slidesPerView={1}
                    spaceBetween={30}
                    autoplay={{ delay: 3000 }}
                    pagination={{ clickable: true }}
                    breakpoints={{
                        600: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        800: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        }
                    }}
                >
                    {partnersData.map((partner, index) => (
                        <SwiperSlide key={index}>
                            {revealed && (
                                <div className={`${styles.avatarPartner} ${highlight}`}>
                                    <a href={partner.href} target="_blank" rel="noreferrer">
                                        <img src={partner.image} alt={partner.alt} />
                                    </a>
                                </div>
                            )}
                        </SwiperSlide>
                    ))}

                </Swiper>
            </div>
        </section>
    );
}
