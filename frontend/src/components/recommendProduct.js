import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';

function RecommendProduct(props) {
  const { product } = props;

  return (
    <Card style={{ width: '13rem' }}>
      <Link to={`/product/${product._id}`}>
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
        <Link to={`/product/${product._id}`} style={{ color: '#4447e0' }}>
          <Card.Title style={{ color: '#4447e0' }}>{product.name}</Card.Title>
        </Link>
      </Card.Body>
    </Card>
  );
}
export default RecommendProduct;
