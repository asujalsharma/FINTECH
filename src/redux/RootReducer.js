const initialState = {
  home: {},
  cart: [],
  user: {},
  isLoggedIn: false,
};

export const RootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER': {
      const payload = action.payload || {};
      const nestedData = payload.Data || payload.user || {};
      const token =
        payload.AccessToken ||
        payload.token ||
        payload.accessToken ||
        nestedData.AccessToken ||
        nestedData.token ||
        nestedData.accessToken ||
        state.user?.AccessToken ||
        state.user?.token ||
        state.user?.accessToken;
      return {
        ...state,
        user: {
          ...state.user,
          ...payload,
          ...nestedData,
          AccessToken: token,
          token: token,
        },
        isLoggedIn: Boolean(token || state.isLoggedIn),
      };
    }

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
