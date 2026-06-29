import { createContext, useContext, useState } from 'react';

// 1. Create the bulletin board
const AuthContext = createContext(null);

// 2. The board manager — wraps your entire app
export function AuthProvider({ children }) {
  // Read saved login from localStorage (survives page refresh)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    // Save to memory (state) AND disk (localStorage)
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    // 3. Put the board up where everyone can see it
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Easy hook so any component can read the board
export function useAuth() {
  return useContext(AuthContext);
}