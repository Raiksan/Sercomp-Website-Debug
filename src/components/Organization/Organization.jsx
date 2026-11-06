import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import styles from './Organization.module.css';
import PropTypes from "prop-types";
import { useDebug } from '../../debug/DebugContext';

export default function Organization({title, members}) {
    const { settings } = useDebug();
    const revealed = settings.revealOrganization;
    const highlight = revealed && settings.highlightRevealed ? 'debug-revealed' : '';

    return (
        <section className={`${styles.orgsContainer} container mySwiper`}>
            {revealed && <h2 className={`baseTitle ${highlight}`}>{title}</h2>}
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
                {revealed && members.map((member, index) => (
                    <SwiperSlide key={index}>
                        <article className={`${styles.org} ${settings.highlightRevealed ? 'debug-revealed' : ''}`}>
                            <div className={styles.avatar}>
                                <img src={member.image} alt={member.alt}/>
                            </div>
                        </article>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

Organization.propTypes = {
    title: PropTypes.string.isRequired,
    members: PropTypes.arrayOf(
        PropTypes.shape({
            image: PropTypes.string.isRequired,
            alt: PropTypes.string.isRequired
        })
    )
}
