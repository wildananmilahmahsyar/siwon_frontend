import { create } from 'zustand';

// Ambil token dari localStorage saat awal
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');
const storedRole = localStorage.getItem('role');

const useUserStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  role: storedRole || null,
  token: storedToken || null,

  setUser: (userData, role) => {
    const token = localStorage.getItem('token');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', role);
    set({ user: userData, role, token });
  },

  clearUser: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    set({ user: null, role: null, token: null });
  },
}));

export default useUserStore;
