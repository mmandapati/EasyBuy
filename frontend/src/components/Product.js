import axios from 'axios';
import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Store } from '../Store';
import Rating from './Rating';

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
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...item, quantity },
    });
  };
  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
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
        <Link to={`/product/${product.slug}`} style={{ color: '#4447e0' }}>
          <Card.Title style={{ color: '#4447e0' }}>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>${product.price}</Card.Text>
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
      </Card.Body>
    </Card>
  );
}
export default Product;
