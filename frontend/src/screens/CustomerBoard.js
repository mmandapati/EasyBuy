//import data from '../data';
import axios from 'axios';
import logger from 'use-reducer-logger';
import { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { toast } from 'react-toastify';
import { getError } from '../utils';

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
  return (
    <div>
      <Helmet>
        <title>EasyBuy</title>
      </Helmet>
      <h1>Welcome to Easy Buy</h1>
      <h2>Choose the category or search for the products</h2>
      <div className="category">
        <Row>
          {categories.map((category) => (
            <Col key={category} sm={8} md={6} lg={4} className="mb-3">
              <Card className="mb-3">
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
      <h1> Recommendations:</h1>
    </div>
  );
}

export default CustomerBoard;
