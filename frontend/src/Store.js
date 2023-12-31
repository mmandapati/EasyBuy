import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : [],
    paymentInfo: localStorage.getItem('paymentInfo')
      ? JSON.parse(localStorage.getItem('paymentInfo'))
      : [],
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
};

function reducer(state, action) {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      //add to cart
      const newItem = action.payload;
      const itemExistinCart = state.cart.cartItems.find(
        (x) => x._id === newItem._id
      );
      const cartItems = itemExistinCart
        ? state.cart.cartItems.map((item) =>
            item._id === itemExistinCart._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems,
          error: '',
        },
      };
    case 'CART_REMOVE_ITEM': {
      //Remove Item from cart
      const removeItem = action.payload;
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== removeItem._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return {
        ...state,
        cart: {
          ...state.cart,
          cartItems,
          error: '',
        },
      };
    }
    case 'CART_ADD_ITEM_FAIL': {
      return {
        ...state,
        cart: { ...state.cart, error: action.payload },
      };
    }
    case 'CLEAR_CART':
      return { ...state, cart: { ...state.cart, error: '', cartItems: [] } };
    case 'USER_SIGNIN':
      return { ...state, userInfo: action.payload };
    case 'USER_SIGNOUT':
      return {
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentInfo: {},
        },
      };
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };
    case 'SAVE_PAYMENT_INFO':
      return {
        ...state,
        cart: {
          ...state.cart,
          paymentInfo: action.payload,
        },
      };
    default:
      return state;
  }
}
export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
}
