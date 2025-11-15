const initialState = {
  home: {},
  cart: [],
  user: {},
  isLoggedIn: false,
};

export const RootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isLoggedIn: true,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: {},
        isLoggedIn: false,
      };

    case 'SET_HOME':
      return {
        ...state,
        home: action.payload,
      };

    case 'ADD_TO_CART':
      return {
        ...state,
        cart: action.payload,
      };

    default:
      return state;
  }
};
