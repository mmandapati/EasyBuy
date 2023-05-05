import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Product from '../components/Product';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import { LinkContainer } from 'react-router-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SELLER_REQUEST':
      return { ...state, sellerLoading: true };
    case 'SELLER_SUCCESS':
      return { ...state, sellerLoading: false, userDetails: action.payload };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        countProducts: action.payload.countProducts,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function SellerScreen() {
  const params = useParams();
  const { id } = params;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const page = searchParams.get('page') || '1';

  const [
    {
      loading,
      error,
      products,
      pages,
      countProducts,
      sellerLoading,
      userDetails,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],
    sellerLoading: true,
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `/api/products/seller/?seller=${id}&&page=${page}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };
    fetchData();
  }, [dispatch, id, page]);

  useEffect(() => {
    const fetchSellerData = async () => {
      dispatch({ type: 'SELLER_REQUEST' });
      try {
        console.log('seller id', id);
        const { data } = await axios.get(`/api/users/${id}`);
        dispatch({ type: 'SELLER_SUCCESS', payload: data });
        console.log('seller userDetails', data);
      } catch (err) {}
    };
    fetchSellerData();
  }, [dispatch, id]);
  return (
    <div>
      <Helmet>
        <title> Retailer Products</title>
      </Helmet>
      <Row>
        <Col md={2}>
          {sellerLoading ? (
            <LoadingBox></LoadingBox>
          ) : (
            <Card>
              <img
                src={userDetails.seller.logo}
                alt={userDetails.seller.name}
              />
              <Card.Body>
                <Card.Title>{userDetails.seller.name}</Card.Title>
                <Rating
                  rating={userDetails.seller.rating}
                  numReviews={userDetails.seller.numReviews}
                />
                <Card.Text>{userDetails.seller.description}</Card.Text>
              </Card.Body>
            </Card>
          )}
        </Col>
        <Col md={10}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>
              <div>
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={{
                      pathname: `/seller/sellerview/${id}`,
                      search: `?page=${x + 1}`,
                    }}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
