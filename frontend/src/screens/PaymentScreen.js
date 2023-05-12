import React, { useContext, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CheckoutSteps from '../components/CheckoutSteps';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { shippingAddress, paymentInfo },
  } = state;
  const [cardName, setCardName] = useState(paymentInfo.cardName || '');
  const [cardNumber, setCardNumber] = useState(paymentInfo.cardNumber || '');
  const [expirationDate, setExpirationDate] = useState('');
  // const [expirationDate, setEpirationDate] = useState(
  //   paymentInfo.expirationDate || ''
  // );
  const [cvv, setCvv] = useState(paymentInfo.cvv || '');

  const isValidCreditCardNumber = (cardNumber) => {
    const cardNumberRegex = /^([0-9]{4}[\s-]?){3}([0-9]{4})$/;
    return cardNumberRegex.test(cardNumber);
  };

  const handleExpirationDateChange = (e) => {
    setExpirationDate(e.target.value);
  };

  const handleCardNumberChange = (e) => {
    const input = e.target.value;
    // Remove non-numeric characters from the input
    const cardNumber = input.replace(/\D/g, '');
    setCardNumber(cardNumber);
  };

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('shipping');
    }
  }, [shippingAddress, navigate]);

  const isValidExpirationDate = (expirationDate) => {
    // Parse the input date as MM/YY
    const inputDate = moment(expirationDate, 'MM/YY');
    // Get the current date
    const currentDate = moment();
    // Check that the input date is a valid date in the future
    return inputDate.isValid() && inputDate.isAfter(currentDate, 'month');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!isValidCreditCardNumber(cardNumber)) {
      alert('Please enter a valid credit card number.');
      return;
    }
    if (!isValidExpirationDate(expirationDate)) {
      alert('Please enter a valid expiration date.');
      return;
    }
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
            {/* <Form.Control
              type="number"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required
            /> */}
            <Form.Control
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please enter a valid credit card number.
            </Form.Control.Feedback>
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="expirateDate">
                <Form.Label>Expiration Date (MM/YY)</Form.Label>
                <Form.Control
                  type="text"
                  value={expirationDate}
                  onChange={handleExpirationDateChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid expiration date (in the format MM/YY).
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="cvv">
                <Form.Label>Security Code</Form.Label>
                <Form.Control
                  type="number"
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
