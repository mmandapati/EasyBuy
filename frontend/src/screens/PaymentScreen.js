import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentInfo },
  } = state;
  const [cardName, setCardName] = useState(paymentInfo.cardName || '');
  const [cardNumber, setCardNumber] = useState(paymentInfo.cardNumber || '');
  const [expirationDate, setEpirationDate] = useState(
    paymentInfo.expirationDate || ''
  );
  const [cvv, setCvv] = useState(paymentInfo.cvv || '');

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    ctxDispatch({
      type: 'SAVE_PAYMENT_INFO',
      payload: {
        cardName,
        cardNumber,
        expirationDate,
        cvv,
      },
    });
    localStorage.setItem(
      'paymentInfo',
      JSON.stringify({
        cardName,
        cardNumber,
        expirationDate,
        cvv,
      })
    );
    navigate('/placeorder');
  };
  return (
    <div>
      <Helmet>
        <title>Payment</title>
      </Helmet>
      <CheckoutSteps step1 step2 step3></CheckoutSteps>
      <div className="container small-container" style={{ maxWidth: '500px' }}>
        <h1 className="my-3">Payment Information</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="cardName">
            <Form.Label>Name on card</Form.Label>
            <Form.Control
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="cardNumber">
            <Form.Label>Card Number</Form.Label>
            <Form.Control
              type="number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="expirateDate">
                <Form.Label>Expiration Date</Form.Label>
                <Form.Control
                  value={expirationDate}
                  onChange={(e) => setEpirationDate(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="cvv">
                <Form.Label>Security Code</Form.Label>
                <Form.Control
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="mb-3">
            <Button variant="outline-primary" type="submit">
              Continue
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
