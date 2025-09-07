import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { currentUser, hasRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (!hasRole('admin') && !hasRole('moderator')) {
    return <Navigate to="/" />;
  }
  
  return children;
};