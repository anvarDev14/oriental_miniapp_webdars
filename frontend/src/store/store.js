import { create } from 'zustand';
import { authAPI } from '../api/api';

export const useStore = create((set, get) => ({
  // User state
  user: null,
  loading: true,
  error: null,

  // Actions
  fetchUser: async (initData) => {
    try {
      set({ loading: true });
      const response = await authAPI.login(initData);
      set({ user: response.data.user, loading: false, error: null });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } });
  },

  // Directions state
  directions: [],
  selectedDirection: null,

  setDirections: (directions) => set({ directions }),
  setSelectedDirection: (direction) => set({ selectedDirection: direction }),

  // Courses state
  courses: [],
  selectedCourse: null,

  setCourses: (courses) => set({ courses }),
  setSelectedCourse: (course) => set({ selectedCourse: course }),

  // Materials state
  materials: [],
  currentMaterial: null,

  setMaterials: (materials) => set({ materials }),
  setCurrentMaterial: (material) => set({ currentMaterial: material }),

  // Progress state
  progress: {},

  updateProgress: (materialId, progressData) => {
    set({
      progress: {
        ...get().progress,
        [materialId]: progressData,
      },
    });
  },

  // Favorites state
  favorites: [],

  setFavorites: (favorites) => set({ favorites }),

  addFavorite: (material) => {
    set({ favorites: [...get().favorites, material] });
  },

  removeFavorite: (materialId) => {
    set({
      favorites: get().favorites.filter((f) => f.id !== materialId),
    });
  },
}));
