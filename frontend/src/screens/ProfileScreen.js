import React, { useContext, useState, useReducer } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import Container from 'react-bootstrap/Container';

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};
export default function ProfileScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo } = state;
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [isSeller, setIsSeller] = useState(userInfo.isSeller);
  const [sellerName, setSellerName] = useState(
    userInfo.isSeller ? userInfo.sellerName : ''
  );
  const [sellerLogo, setSellerLogo] = useState(
    userInfo.isSeller ? userInfo.sellerLogo : ''
  );
  const [sellerDescription, setSellerDescription] = useState(
    userInfo.isSeller ? userInfo.sellerDescription : ''
  );

  const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
    loadingUpdate: false,
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
          isSeller,
          sellerName,
          sellerLogo,
          sellerDescription,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      ctxDispatch({ type: 'USER_SIGNIN', payload: data });
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('User updated successfully');
    } catch (err) {
      dispatch({
        type: 'FETCH_FAIL',
      });
      toast.error(getError(err));
    }
  };
  async function sellerHandler() {
    setIsSeller(true);
  }

  return (
    <Container style={{ maxWidth: '500px' }}>
      <Helmet>
        <title>User Profile</title>
      </Helmet>
      <h1 className="my-3">User Profile</h1>
      <form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>EmailId</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="confirmpassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
        </Form.Group>
        {(userInfo.isSeller || isSeller) && (
          <div>
            <h2>Retailer</h2>
            <Form.Group className="mb-3" controlId="sellername">
              <Form.Label>Retailer Name</Form.Label>
              <Form.Control
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="sellerlogo">
              <Form.Label>Retailer Logo</Form.Label>
              <Form.Control
                value={sellerLogo}
                onChange={(e) => setSellerLogo(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Retailer Description</Form.Label>
              <Form.Control
                value={sellerDescription}
                onChange={(e) => setSellerDescription(e.target.value)}
              />
            </Form.Group>
          </div>
        )}
        <div className="mb-3">
          <Button type="submit">Update</Button>
        </div>
      </form>
      {!userInfo.isSeller && !isSeller && (
        <Button type="button" onClick={sellerHandler}>
          Want to Register as Retailer?
        </Button>
      )}
    </Container>
  );
}
