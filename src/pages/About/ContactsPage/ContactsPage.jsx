import React from "react";
import "./ContactsPage.css";
import YandexMap from "../../../components/YandexMap";

const ContactsPage = () => {
  return (
    <div className="contacts-root">

      {/* === HERO === */}
      <section className="contacts-hero">
        <div className="container">
          <div className="hero-content fade-in">
            <h1 className="hero-title">Свяжитесь с нами</h1>
            <p className="hero-subtitle">
              Мы всегда готовы ответить на ваши вопросы и помочь с выбором оборудования.
            </p>
          </div>
        </div>
      </section>

      {/* === КАРТА С ИНФОРМАЦИЕЙ === */}
      <section className="map-section fade-in">
        <div className="container">
          <h2 className="section-title">Мы на карте</h2>
          
          <div className="map-content-wrapper">
            <div className="card map-card">
              <div className="map-wrapper">
                <YandexMap zoom={16} />
              </div>
            </div>
            
            {/* Информация справа от карты */}
            <div className="map-side-info">
              <div className="info-card">
                <h3>Контактная информация</h3>
                
                <div className="contact-detail">
                  <div className="detail-icon">📍</div>
                  <div className="detail-content">
                    <strong>Адрес</strong>
                    <p>г. Курск, ул. Белгородская, д. 14</p>
                  </div>
                </div>
                
                <div className="contact-detail">
                  <div className="detail-icon">📞</div>
                  <div className="detail-content">
                    <strong>Телефон</strong>
                    <p>+7 (999) 123-45-67</p>
                  </div>
                </div>
                
                <div className="contact-detail">
                  <div className="detail-icon">📧</div>
                  <div className="detail-content">
                    <strong>Email</strong>
                    <p>info@magazin.ru</p>
                  </div>
                </div>
                
                <div className="contact-detail">
                  <div className="detail-icon">🕒</div>
                  <div className="detail-content">
                    <strong>Режим работы</strong>
                    <div className="hours-details">
                      <div className="hours-item">
                        <span>Пн–Пт</span>
                        <span>9:00 – 18:00</span>
                      </div>
                      <div className="hours-item">
                        <span>Сб–Вс</span>
                        <span>10:00 – 16:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactsPage;