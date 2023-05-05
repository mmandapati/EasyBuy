import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Product from '../components/Product';
import Rating from '../components/Rating';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload.products };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SellerScreen() {
  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],
  });

  const { state } = useContext(Store);
  const { userInfo } = state;
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `/api/products/seller/?seller=${userInfo._id}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchData();
  }, [userInfo]);

  return (
    <div className="row top">
      <div className="col-1">
        {loading ? (
          <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          //   <ul className="card card-body">
          //     <li>
          //       <div className="row start">
          //         <div className="p-1">
          //           <img
          //             className="small"
          //             src={userInfo.sellerLogo}
          //             alt={userInfo.sellerName}
          //           ></img>
          //         </div>
          //         <div className="p-1">
          //           <h1>{userInfo.sellerName}</h1>
          //         </div>
          //       </div>
          //     </li>
          //     <li>
          //       <Rating
          //         rating={userInfo.sellerRating}
          //         numReviews={userInfo.seller}
          //       ></Rating>
          //     </li>
          //     <li>
          //       <a href={`mailto:${userInfo.email}`}>Contact Seller</a>
          //     </li>
          //     {/* <li>{userInfo.seller.description}</li> */}
          //   </ul>
          <div>
            <h1>{userInfo.sellerName}</h1>
          </div>
        )}
      </div>
      {/* <div className="col-3">
        <div className="row center">
          {products.map((product) => (
            <Product key={product._id} product={product}></Product>
          ))}
        </div>
      </div> */}
      <Row>
        {products.map((product) => (
          <Col key={product._id} sm={6} md={4} lg={3} className="mb-3">
            <Product product={product}></Product>
          </Col>
        ))}
      </Row>
    </div>
  );
}
