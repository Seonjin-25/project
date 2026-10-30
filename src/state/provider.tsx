'use client';
import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { INITIAL_STATE, reducer, type Action, type AppState } from './model';
const Context=createContext<{state:AppState;dispatch:Dispatch<Action>}|null>(null);
export function AppProvider({children}:{children:ReactNode}) { const [state,dispatch]=useReducer(reducer,INITIAL_STATE); return <Context.Provider value={{state,dispatch}}>{children}</Context.Provider>; }
export function useApp(){ const value=useContext(Context); if(!value) throw new Error('AppProvider is required'); return value; }
