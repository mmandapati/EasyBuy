import { Link, useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PRODUCT':
      return {
        ...state,
        product: action.payload,
      };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    // case 'REVIEW_REQUEST':
    //   return { ...state, loading: true };
    // case 'REVIEW_SUCCESS':
    //   return { ...state, loading: false, reviews: action.payload };
    case 'REVIEW_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function ProductScreen() {
  let reviewsRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const params = useParams();
  const { id: productId } = params;
  const [{ loading, product, error, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      loading: true,
      product: [],
      error: '',
    });
  //const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/${productId}`);
        //const result = await axios.get(`/api/products/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }

      //setProducts(result.data);
    };
    fetchData();
  }, [productId]);

  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      //dispatch({ type: 'REVIEW_REQUEST' });
      try {
        const { data } = await axios.get(`/api/review/${productId}`);
        setReviews(data);
        console.log('useEffect reviews', data);
        console.log('setReviews', reviews);
        //dispatch({ type: 'REVIEW_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'REVIEW_FAIL', payload: getError(err) });
      }
    };
    fetchReviews();
  }, [productId]);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const addToCartHandler = async () => {
    const existIteminCart = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existIteminCart ? existIteminCart.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      window.alert('Sorry. Quantity not available, Please check');
      return;
    }
    if (
      cart.cartItems.length > 0 &&
      data.seller._id !== cart.cartItems[0].seller._id
    ) {
      ctxDispatch({
        type: 'CART_ADD_ITEM_FAIL',
        payload: `Please add products from ${cart.cartItems[0].seller.seller.name}. Place an other order for ${data.seller.seller.name} Products`,
      });
    } else {
      ctxDispatch({
        type: 'CART_ADD_ITEM',
        payload: { ...product, quantity },
      });
    }
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      // const { data } = await axios.post(
      //   `/api/products/${product._id}/reviews`,
      //   { rating, comment, name: userInfo.name },
      //   {
      //     headers: { Authorization: `Bearer ${userInfo.token}` },
      //   }
      // );
      // dispatch({
      //   type: 'CREATE_SUCCESS',
      // });
      // toast.success('Review submitted successfully');
      // product.reviews.unshift(data.review);
      // product.numReviews = data.numReviews;
      // product.rating = data.rating;
      // dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      // window.scrollTo({
      //   behavior: 'smooth',
      //   top: reviewsRef.current.offsetTop,
      // });
      dispatch({ type: 'CREATE_REQUEST' });
      const { data } = await axios.post(
        '/api/review',
        {
          name: userInfo.name,
          user: userInfo._id,
          product: product._id,
          comment,
          rating,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      var newReviews = reviews.concat([data.review]);
      setReviews(newReviews);
      console.log('reviews', reviews);
      dispatch({ type: 'CREATE_SUCCESS' });
      toast.success('Review submitted successfully');
      product.numReviews = data.numReviews;
      product.rating = data.rating;
      dispatch({ type: 'REFRESH_PRODUCT', payload: product });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };

  const notifyHandler = async () => {
    if (userInfo) {
      try {
        //check if he is already enrolled
        const { data } = await axios.put(
          `/api/products/${product._id}/notified`,
          { user: userInfo },
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({
          type: 'NOTIFY_SUCCESS',
        });
        toast.success('You will be notified via mail when the product returns');
        product.notified.unshift(data.user);
      } catch (error) {
        toast.error(getError(error));
        dispatch({ type: 'NOTIFY_FAIL' });
      }
    } else {
      navigate(`/signin?redirect=/product/${product._id}`);
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row>
        <Col md={5}>
          <img
            className="product-image"
            src={product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={4}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              {' '}
              <Rating rating={product.rating} numReviews={product.numReviews} />
            </ListGroup.Item>
            <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
            <ListGroup.Item>
              Description:
              <p>{product.description}</p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Link
                      to={`/seller/sellerview/${product.seller._id}`}
                      style={{ color: '#bb8130', textDecoration: 'none' }}
                    >
                      {product.seller.seller.name}
                    </Link>
                    <Rating
                      rating={product.seller.seller.rating}
                      numReviews={product.seller.seller.numReviews}
                    />
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>${product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.countInStock > 0 ? (
                        <Badge bg="success">In Stock</Badge>
                      ) : (
                        <Badge bg="danger">Out of Stock</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    {product.countInStock > 0 ? (
                      <Button
                        onClick={addToCartHandler}
                        variant="outline-primary"
                      >
                        Add to Cart
                      </Button>
                    ) : (
                      <Button onClick={notifyHandler} variant="warning">
                        Get Notified
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="my-3">
        <h2 ref={reviewsRef}>Reviews</h2>
        <div className="mb-3">
          {reviews.length === 0 && <MessageBox>There is no review</MessageBox>}
        </div>
        <ListGroup>
          {reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=" "></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <Form onSubmit={submitHandler}>
              <h2>Want to rate and review the product?</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="1">1-Poor</option>
                  <option value="2">2-Fair</option>
                  <option value="3">3-Good</option>
                  <option value="4">4-Very good</option>
                  <option value="5">5-Excellent</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="Comments"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>
              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </Form>
          ) : (
            <MessageBox>
              Please{' '}
              <Link to={`/signin?redirect=/product/${product._id}`}>
                SignIn
              </Link>{' '}
              to write a review
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductScreen;
