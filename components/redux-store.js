// Redux store setup using Redux Toolkit (browser-safe, no build step)
// This file exposes the store and actions for use in Lit components

import { configureStore, createSlice } from 'https://esm.sh/@reduxjs/toolkit@1.9.5';

const initialState = {
  tasks: [],
  filter: 'all',
  theme: 'light',
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action) {
      state.tasks = action.payload;
    },
    addTask(state, action) {
      state.tasks.unshift(action.payload);
    },
    editTask(state, action) {
      const { id, text } = action.payload;
      const task = state.tasks.find(t => t.id === id);
      if (task) task.text = text;
    },
    toggleTask(state, action) {
      const id = action.payload;
      const task = state.tasks.find(t => t.id === id);
      if (task) task.completed = !task.completed;
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    setFilter(state, action) {
      state.filter = action.payload;
    },
    setTheme(state, action) {
      state.theme = action.payload;
    },
  },
});

export const {
  setTasks, addTask, editTask, toggleTask, deleteTask, setFilter, setTheme
} = tasksSlice.actions;

export const store = configureStore({
  reducer: tasksSlice.reducer,
});
