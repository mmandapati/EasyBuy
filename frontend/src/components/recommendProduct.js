import axios from 'axios';
import { useEffect, useReducer } from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function RecommendProduct(props) {
  const { productId } = props;
  const [{ loading, product, error }, dispatch] = useReducer(reducer, {
    loading: true,
    product: [],
    error: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/products/${productId}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [productId]);

  return (
    <Card style={{ width: '13rem' }}>
      <Link to={`/product/${productId}`}>
        <img
          src={product.image}
          className="card-img-top"
          alt={product.name}
          style={{
            width: '200px',
            height: '300px',
            padding: '5px',
          }}
        />
      </Link>
      <Card.Body>
        <Link to={`/product/${productId}`} style={{ color: '#4447e0' }}>
          <Card.Title style={{ color: '#4447e0' }}>{product.name}</Card.Title>
        </Link>
      </Card.Body>
    </Card>
  );
}
export default RecommendProduct;
