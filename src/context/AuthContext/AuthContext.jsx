const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (email, password) => {
    // API запрос
    const userData = {
      id: 1,
      email: email,
      role: 'admin', // или 'user', 'moderator'
      // ... другие данные
    };
    setCurrentUser(userData);
  };

  // Проверка ролей
  const isAdmin = () => currentUser?.role === 'admin';
  const hasRole = (role) => currentUser?.role === role;

  return (
    <AuthContext.Provider value={{ currentUser, login, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};