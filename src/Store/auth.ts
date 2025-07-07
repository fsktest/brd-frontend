import { create } from "zustand";

type User = {
  id: number;
  email: string;
  name?: string;
};

type AuthState = {
  isLoggedIn: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

// Simulated API call - replace with actual authentication
const authenticateUser = async (
  email: string,
  password: string
): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (email === "demo@example.com" && password === "password") {
    return { id: 1, email, name: "Demo User" };
  }

  throw new Error("Invalid email or password");
};

// Load from localStorage
const savedUser = localStorage.getItem("user");
const savedLogin = localStorage.getItem("isLoggedIn") === "true";

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: savedLogin,
  user: savedUser ? JSON.parse(savedUser) : null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const user = await authenticateUser(email, password);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");

      set({
        isLoggedIn: true,
        user,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoggedIn: false,
        user: null,
        isLoading: false,
        error: error instanceof Error ? error.message : "Login failed",
      });
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");

    set({
      isLoggedIn: false,
      user: null,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useAuthStore;
