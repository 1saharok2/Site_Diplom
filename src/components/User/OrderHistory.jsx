// components/User/OrderHistory.jsx
import { useOrders } from '../../context/OrderContext';

const OrderHistory = () => {
  const { userOrders, loading, error, loadUserOrders } = useOrders();

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h2>Мои заказы</h2>
      {userOrders.map(order => (
        <div key={order.id}>
          Заказ #{order.order_number} - {order.status}
        </div>
      ))}
    </div>
  );
};