import data from '../data';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function HomeScreen() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get('/api/products');
      setProducts(result.data);
    };
    fetchData();
  }, []);
  return (
    <div>
      <h1>Featured Products</h1>
      <div className="products">
        {data.products.map((product) => (
          <div className="product" key={product.slug}>
            <Link to={`/product/${product.slug}`}>
              <img src={product.image} alt={product.name} />
            </Link>
            <div className="product-info">
              <p>{product.brand}</p>
              <p> {product.name}</p>
              <button className="btn btn-sm btn-primary">Add to cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomeScreen;
