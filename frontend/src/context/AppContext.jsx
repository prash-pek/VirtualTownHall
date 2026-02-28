import { createContext, useContext, useReducer } from 'react';

const initialState = {
  auth: { user: null, token: null, role: null },
  conversation: { id: null, messages: [], candidateId: null, isLoading: false },
  discovery: { zip: '', topics: [], candidates: [] }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, auth: { ...state.auth, ...action.payload } };
    case 'LOGOUT':
      return { ...state, auth: { user: null, token: null, role: null } };
    case 'SET_CONVERSATION':
      return { ...state, conversation: { ...state.conversation, ...action.payload } };
    case 'ADD_MESSAGE':
      return { ...state, conversation: { ...state.conversation, messages: [...state.conversation.messages, action.payload] } };
    case 'SET_DISCOVERY':
      return { ...state, discovery: { ...state.discovery, ...action.payload } };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
