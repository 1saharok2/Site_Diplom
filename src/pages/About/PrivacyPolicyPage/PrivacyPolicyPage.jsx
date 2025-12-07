import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
          Политика конфиденциальности
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph align="center" sx={{ mb: 5 }}>
          Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
        </Typography>

        <Box sx={{ '& > section': { mb: 4 } }}>
          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              1. Общие положения
            </Typography>
            <Typography variant="body1" paragraph>
              Настоящая Политика конфиденциальности (далее — Политика) действует в отношении всей информации, которую интернет-магазин «ElectroShop» (далее — Магазин), расположенный на доменном имени https://electronic.tw1.ru, может получить о Пользователе во время использования сайта Магазина, его услуг, программ и продуктов.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              2. Собираемая информация
            </Typography>
            <Typography variant="body1" paragraph>
              Магазин собирает следующую информацию о Пользователях:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Персональные данные, предоставленные при регистрации или оформлении заказа (ФИО, email, телефон, адрес доставки)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Информация о транзакциях (история покупок, статусы заказов)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Техническая информация (IP-адрес, данные cookie, информация о браузере и устройстве)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Данные о взаимодействии с сайтом (просмотренные страницы, время на сайте)" />
              </ListItem>
            </List>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              3. Цели сбора информации
            </Typography>
            <Typography variant="body1" paragraph>
              Магазин использует полученную информацию для следующих целей:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Предоставление услуг и обработка заказов" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Идентификация Пользователя при работе с сайтом" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Связь с Пользователем по вопросам заказов и обслуживания" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Улучшение качества услуг и разработка новых продуктов" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Проведение маркетинговых исследований и рассылок (только с согласия Пользователя)" />
              </ListItem>
            </List>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              4. Обработка персональных данных
            </Typography>
            <Typography variant="body1" paragraph>
              Обработка персональных данных осуществляется в соответствии с Федеральным законом № 152-ФЗ «О персональных данных». Магазин гарантирует:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Конфиденциальность персональных данных" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Неразглашение данных третьим лицам без согласия Пользователя, за исключением случаев, предусмотренных законодательством" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Защиту данных от несанкционированного доступа" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Возможность Пользователя удалить или изменить свои данные" />
              </ListItem>
            </List>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              5. Хранение данных
            </Typography>
            <Typography variant="body1" paragraph>
              Персональные данные Пользователей хранятся на защищенных серверах в течение срока, необходимого для выполнения целей их обработки, но не менее срока, установленного законодательством РФ.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              6. Использование файлов cookie
            </Typography>
            <Typography variant="body1" paragraph>
              Сайт использует технологию cookie для персонализации контента и анализа трафика. Пользователь может отключить cookie в настройках браузера, однако это может повлиять на функциональность сайта.
            </Typography>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              7. Права Пользователей
            </Typography>
            <Typography variant="body1" paragraph>
              Пользователь имеет право:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="• Получать информацию об обработке своих персональных данных" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Требовать уточнения, блокирования или уничтожения своих данных" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Отозвать согласие на обработку персональных данных" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Обжаловать действия или бездействие Магазина в уполномоченный орган" />
              </ListItem>
            </List>
          </section>

          <section>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              8. Контакты
            </Typography>
            <Typography variant="body1" paragraph>
              По вопросам, связанным с политикой конфиденциальности, обращайтесь:
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body1">
                <strong>Электронная почта:</strong> privacy@electronic.tw1.ru
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Телефон:</strong> +7 (999) 123-45-67
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Адрес:</strong> г. Курск, ул. Белгородская, д. 14
              </Typography>
            </Box>
          </section>
        </Box>

        <Box sx={{ mt: 6, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Нажимая кнопку «Зарегистрироваться» или «Оформить заказ» на сайте, Пользователь подтверждает свое согласие с настоящей Политикой конфиденциальности.
          </Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="body1" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              Вернуться на главную страницу
            </Typography>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;