import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { classMonitorsData } from "../../data/ClassMonitorsData";
import { useDebug } from '../../debug/DebugContext';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

import styles from './Committee.module.css';


function Committee() {
    const { settings } = useDebug();
    const revealed = settings.revealCommitteeInfo;
    const highlight = revealed && settings.highlightRevealed ? 'debug-revealed' : '';

    return (
        <section className="container">
            <h1 className="mainTitle">Conheça o comitê do <strong>SERCOMP</strong></h1>

            {!revealed && (
                <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '1rem' }}>
                    Foto, nome e área estavam comentados no código original. Abra o painel DEBUG → “Conteúdo oculto” e ative “Fotos e nomes do comitê” para revelar.
                </p>
            )}

            <section className={`container ${styles.orgsContainer} mySwiper`} >
                <div className="swiper-wrapper">
                    <Swiper
                        modules={[Autoplay]}
                        className="mySwiper"
                        spaceBetween={30}
                        autoplay={{ delay: 2000 }}
                        pagination={{ clickable: true }}
                        breakpoints={{
                            450: {
                                slidesPerView: 2,
                                spaceBetween: 30,
                            },
                            800: {
                                slidesPerView: 4,
                                spaceBetween: 30,
                            }
                        }}
                    >
                        {classMonitorsData.map((classMonitor, index) => (
                            <SwiperSlide key={index}>
                                <article className={`swiper-slide ${styles.org} ${highlight}`}>
                                    <div className={styles.avatar}>
                                        {revealed && (
                                            <img src={classMonitor.image} alt={classMonitor.name} />
                                        )}
                                    </div>
                                    <div className={styles.committeeInfo}>
                                        {revealed && (
                                            <>
                                                <h5>{classMonitor.name}</h5>
                                                <h6>{classMonitor.area}</h6>
                                            </>
                                        )}
                                    </div>
                                </article>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        </section>
    );
}


export default Committee;
