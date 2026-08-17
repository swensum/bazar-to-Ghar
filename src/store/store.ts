import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Define a type for your state
interface CounterState {
  value: number;
}


const initialState: CounterState = { value: 0 };

// Create a slice
const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

// Export actions
export const { increment, decrement, setValue } = counterSlice.actions;

// Create store
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

// Infer types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
