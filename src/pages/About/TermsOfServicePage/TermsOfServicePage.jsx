import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const TermsOfServicePage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Условия пользования сайтом
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph align="center" sx={{ mb: 5 }}>
          Действующие с {new Date().toLocaleDateString('ru-RU')}
        </Typography>

        <Box sx={{ '& > section': { mb: 4 } }}>
          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              1. Общие положения
            </Typography>
            <Typography variant="body1" paragraph>
              Настоящие Условия пользования (далее — Условия) регулируют отношения между интернет-магазином «ElectroShop» (далее — Магазин) и Пользователем (далее — Пользователь) по использованию сайта https://electronic.tw1.ru и его услуг.
            </Typography>
            <Typography variant="body1" paragraph>
              Используя сайт Магазина, Пользователь подтверждает, что ознакомился с настоящими Условиями и согласен с ними в полном объеме.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              2. Регистрация и учетная запись
            </Typography>
            <Typography variant="body1" paragraph>
              2.1. Для совершения покупок Пользователь может пройти регистрацию или использовать сайт без регистрации.
            </Typography>
            <Typography variant="body1" paragraph>
              2.2. При регистрации Пользователь обязуется предоставить достоверную и полную информацию о себе.
            </Typography>
            <Typography variant="body1" paragraph>
              2.3. Пользователь несет ответственность за сохранность своих учетных данных (логина и пароля) и за все действия, совершенные под его учетной записью.
            </Typography>
            <Typography variant="body1" paragraph>
              2.4. Магазин вправе отказать в регистрации или заблокировать учетную запись Пользователя в случае нарушения настоящих Условий.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              3. Товары и цены
            </Typography>
            <Typography variant="body1" paragraph>
              3.1. Все товары, представленные на сайте, сопровождаются описаниями, техническими характеристиками и фотографиями.
            </Typography>
            <Typography variant="body1" paragraph>
              3.2. Цены на товары указаны в рублях и включают НДС (если применимо).
            </Typography>
            <Typography variant="body1" paragraph>
              3.3. Магазин оставляет за собой право изменять цены на товары без предварительного уведомления.
            </Typography>
            <Typography variant="body1" paragraph>
              3.4. Наличие товара на сайте не гарантирует его наличие на складе. Окончательное наличие товара подтверждается менеджером при оформлении заказа.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              4. Оформление и оплата заказов
            </Typography>
            <Typography variant="body1" paragraph>
              4.1. Заказ считается оформленным после подтверждения менеджером Магазина.
            </Typography>
            <Typography variant="body1" paragraph>
              4.2. Доступные способы оплаты:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Банковской картой (Visa, MasterCard, Мир)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Электронными деньгами" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Наложенным платежом при получении" />
              </ListItem>
            </List>
            <Typography variant="body1" paragraph>
              4.3. Срок обработки заказа составляет от 1 до 3 рабочих дней.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              5. Доставка товаров
            </Typography>
            <Typography variant="body1" paragraph>
              5.1. Магазин осуществляет доставку товаров по всей территории России.
            </Typography>
            <Typography variant="body1" paragraph>
              5.2. При получении товара Пользователь обязан проверить его целостность и комплектность.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              6. Возврат и обмен товара
            </Typography>
            <Typography variant="body1" paragraph>
              6.1. Возврат товара надлежащего качества возможен в течение 14 дней с момента получения, если товар не был в употреблении и сохранены его товарный вид и упаковка.
            </Typography>
            <Typography variant="body1" paragraph>
              6.2. Возврат товара ненадлежащего качества осуществляется в соответствии с Законом РФ «О защите прав потребителей».
            </Typography>
            <Typography variant="body1" paragraph>
              6.3. Для оформления возврата необходимо связаться с службой поддержки Магазина.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              7. Интеллектуальная собственность
            </Typography>
            <Typography variant="body1" paragraph>
              7.1. Все материалы сайта (тексты, изображения, дизайн, логотипы) являются интеллектуальной собственностью Магазина или его партнеров.
            </Typography>
            <Typography variant="body1" paragraph>
              7.2. Любое копирование, воспроизведение или распространение материалов сайта без письменного разрешения Магазина запрещено.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              8. Ответственность сторон
            </Typography>
            <Typography variant="body1" paragraph>
              8.1. Магазин не несет ответственности за:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Неправильное использование товаров Пользователем" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Задержки доставки по вине транспортных компаний" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Действия третьих лиц" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Временную недоступность сайта по техническим причинам" />
              </ListItem>
            </List>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              9. Изменение условий
            </Typography>
            <Typography variant="body1" paragraph>
              9.1. Магазин вправе вносить изменения в настоящие Условия в одностороннем порядке.
            </Typography>
            <Typography variant="body1" paragraph>
              9.2. Новая редакция Условий вступает в силу с момента ее публикации на сайте.
            </Typography>
            <Typography variant="body1" paragraph>
              9.3. Продолжение использования сайта после внесения изменений означает согласие Пользователя с новой редакцией Условий.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              10. Контактная информация
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body1">
                <strong>Название организации:</strong> ООО «ElectroShop»
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>ИНН:</strong> 1234567890
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>ОГРН:</strong> 1234567890123
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Юридический адрес:</strong> г. Курск, ул. Белгородская, д. 14
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Электронная почта:</strong> info@electronic.ru
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Телефон:</strong> +7 (999) 123-45-67
              </Typography>
            </Box>
          </section>
        </Box>

        <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body1" paragraph>
            <strong>Примечание:</strong> Настоящие Условия составлены в соответствии с законодательством Российской Федерации. Все споры и разногласия решаются путем переговоров, а при невозможности достичь согласия — в судебном порядке по месту нахождения Магазина.
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body1" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              Политика конфиденциальности
            </Typography>
          </Link>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body1" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              Вернуться на главную
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfServicePage;