import React, { useState } from "react";
import "./ContactsPage.css";
import YandexMap from "../../../components/YandexMap";
import axios from "axios";

const ContactsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Отправляем запрос на сервер
      const response = await axios.post('/api/support/create-ticket.php', formData);
      
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: ""
        });
        
        // Сбрасываем успешное сообщение через 5 секунд
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        setError(response.data.message || "Ошибка при отправке");
      }
    } catch (err) {
      console.error("Ошибка отправки формы:", err);
      setError("Произошла ошибка при отправке формы. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contacts-root">
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
                    <p>info@electronik.ru</p>
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

      {/* === ФОРМА ОБРАЩЕНИЯ В ПОДДЕРЖКУ === */}
      <section className="support-form-section fade-in">
        <div className="container">
          <div className="support-form-wrapper">
            <div className="support-form-info">
              <h2 className="section-title">Обращение в поддержку</h2>
              <p className="form-subtitle">
                Заполните форму ниже, и наша служба поддержки свяжется с вами в кратчайшие сроки.
                Мы отвечаем на все обращения в течение 24 часов.
              </p>
              
              <div className="support-features">
                <div className="feature-item">
                  <div className="feature-icon">✅</div>
                  <div className="feature-text">
                    <strong>Быстрый ответ</strong>
                    <p>Отвечаем в течение 24 часов</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">
                    <strong>Конфиденциальность</strong>
                    <p>Ваши данные защищены</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <div className="feature-icon">👨‍💼</div>
                  <div className="feature-text">
                    <strong>Профессионалы</strong>
                    <p>Команда опытных специалистов</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="support-form-card">
              <form onSubmit={handleSubmit}>
                {success && (
                  <div className="success-message">
                    ✅ Ваше обращение успешно отправлено! Мы свяжемся с вами в ближайшее время.
                  </div>
                )}
                
                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Имя *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Ваше имя"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Телефон</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Тема обращения *</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Выберите тему</option>
                      <option value="Вопрос по товару">Вопрос по товару</option>
                      <option value="Проблема с заказом">Проблема с заказом</option>
                      <option value="Техническая поддержка">Техническая поддержка</option>
                      <option value="Сотрудничество">Сотрудничество</option>
                      <option value="Другое">Другое</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Сообщение *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Опишите вашу проблему или вопрос подробно..."
                  ></textarea>
                </div>
                
                <div className="form-footer">
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading}
                  >
                    {loading ? "Отправка..." : "Отправить обращение"}
                  </button>
                  
                  <p className="form-note">
                    * Поля, обязательные для заполнения
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactsPage;