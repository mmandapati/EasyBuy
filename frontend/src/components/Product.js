import axios from 'axios';
import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Store } from '../Store';
import Rating from './Rating';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;
  const addToCartHandler = async (item) => {
    const existIteminCart = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existIteminCart ? existIteminCart.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);

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
        payload: { ...item, quantity },
      });
    }
  };
  return (
    <Card>
      <Link to={`/product/${product._id}`}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{
            width: '290px',
            height: '400px',
            padding: '5px',
          }}
        />
      </Link>
      <Card.Body>
        <Link to={`/product/${product._id}`} style={{ color: '#4447e0' }}>
          <Card.Title style={{ color: '#4447e0' }}>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />

        <Card.Text>${product.price}</Card.Text>
        <Row>
          <Col>
            <Link
              to={`/seller/sellerview/${product.seller._id}`}
              style={{ color: '#bb8130', textDecoration: 'none' }}
            >
              {product.seller.seller.name}
            </Link>
          </Col>
          <Col>
            {product.countInStock === 0 ? (
              <Button variant="warning" disabled>
                Out of Stock
              </Button>
            ) : (
              <Button
                variant="outline-primary"
                onClick={() => addToCartHandler(product)}
              >
                Add to Cart
              </Button>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
export default Product;
