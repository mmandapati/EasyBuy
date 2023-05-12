//import data from '../data';
import axios from 'axios';
import logger from 'use-reducer-logger';
import { useContext, useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Carousel from 'react-bootstrap/Carousel';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import RecommendProduct from '../components/recommendProduct';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, topSellers: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'RECOMMEND_REQUEST':
      return { ...state, loadingRecommend: true };
    case 'RECOMMEND_SUCCESS':
      return {
        ...state,
        loadingRecommend: false,
        contentProducts: action.payload.contentProducts,
        collabProducts: action.payload.collabProducts,
      };
    case 'RECOMMEND_FAIL':
      return {
        ...state,
        loadingRecommend: false,
      };
    default:
      return state;
  }
};

function CustomerBoard() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  const [
    {
      loading,
      topSellers,
      error,
      loadingRecommend,
      contentProducts,
      collabProducts,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    topSellers: [],
    error: '',
    loadingRecommend: true,
    contentProducts: [],
    collabProducts: [],
  });
  const { state } = useContext(Store);
  const { userInfo } = state;
  useEffect(() => {
    const fetchTopSellers = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/users/top-sellers');
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchTopSellers();
  }, []);
  useEffect(() => {
    const fetchContentRecommend = async () => {
      dispatch({ type: 'RECOMMEND_REQUEST' });
      try {
        const { data } = await axios.get(`/api/recommends/${userInfo._id}`);
        dispatch({ type: 'RECOMMEND_SUCCESS', payload: data });
        console.log('recommend', data.recommend);
      } catch (err) {
        dispatch({ type: 'RECOMMEND_FAIL', payload: err.message });
      }
    };
    fetchContentRecommend();
  }, [userInfo]);
  //console.log('after recommend', recommend);
  return (
    <div>
      <Helmet>
        <title>EasyBuy</title>
      </Helmet>
      <h4>TOP PICKS FOR YOU</h4>
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          {topSellers.length === 0 && <MessageBox>No Seller Found</MessageBox>}
          <Carousel variant="dark">
            {topSellers.map((seller) => (
              <Carousel.Item interval={2000}>
                <Link to={`/seller/sellerview/${seller._id}`}>
                  <img
                    className="d-block w-100"
                    src={seller.seller.logo}
                    alt={seller.seller.name}
                    style={{
                      height: '400px',
                    }}
                  />
                </Link>
                <Carousel.Caption>
                  <h5>{seller.seller.name}</h5>
                  <p>{seller.seller.description}</p>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </>
      )}

      <h4>CATEGORIES TO BAG</h4>
      <div className="category">
        <Row>
          {categories.map((category) => (
            <Col key={category} sm={8} md={6} lg={2} className="mb-3">
              <Card className="mb-3">
                <Link to={`/search?category=${category}`}>
                  <img
                    src={`https://easybuy-images.s3.us-west-1.amazonaws.com/${category}.png`}
                    className="card-img-top"
                    alt={category}
                  />
                </Link>
                <Card.Body>
                  <Card.Text>
                    <Link to={`/search?category=${category}`}>
                      <strong>{category}</strong>
                    </Link>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {loadingRecommend ? (
        <LoadingBox></LoadingBox>
      ) : (
        <div>
          {contentProducts.length > 0 && (
            <div>
              <h4>YOU MAY ALSO LIKE</h4>
              <Row>
                {contentProducts.map((productId) => (
                  <Col sm={8} lg={2} key={productId}>
                    <RecommendProduct productId={productId}></RecommendProduct>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          {collabProducts.length > 0 && (
            <div>
              <h4>CUSTOMERS ALSO BOUGHT</h4>
              <Row>
                {collabProducts.map((productId) => (
                  <Col sm={8} lg={2} key={productId}>
                    <RecommendProduct productId={productId}></RecommendProduct>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerBoard;
