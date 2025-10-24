const initialState = {
    home: {},
    cart: [],
    user: {},
    isLoggedIn: false,
  };
  
  export const RootReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER':
        state.user = action.payload;
        state.isLoggedIn = true;
        return {
          ...state,
          user: state.user,
          isLoggedIn: state.isLoggedIn,
        };
      case 'LOGOUT':
        state.user = {};
        state.isLoggedIn = false;
        return {
          ...state,
        };
      case 'SET_HOME':
        state.home = action.payload;
        return {
          ...state,
          home: state.home,
        };
      case 'ADD_TO_CART':
        state.cart = action.payload;
        return {
          ...state,
          cart: state.cart,
        };
      default:
        return state;
    }
  };
  