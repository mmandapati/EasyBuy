import React, { useContext, useEffect, useReducer } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Product from '../components/Product';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/orders/seller/?seller=${userInfo._id}`,
          {}
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div>
      <div className="products">
        <h2>Top 5 sold products</h2>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          //   <table className="table">
          //     <thead>
          //       <tr>
          //         <th>ID</th>
          //         <th>NAME</th>
          //         <th>PRICE</th>
          //         <th>ACTIONS</th>
          //       </tr>
          //     </thead>
          //     <tbody>
          //       {summary.products.map((product) => (
          //         <tr key={product._id}>
          //           <td>{product._id}</td>
          //           <td>{product.name}</td>
          //           <td>{product.price}</td>
          //           <td>
          //             {userInfo.isAdmin && (
          //               <Button
          //                 type="button"
          //                 variant="outline-primary"
          //                 onClick={() =>
          //                   navigate(`/admin/product/${product._id}`)
          //                 }
          //               >
          //                 Edit
          //               </Button>
          //             )}
          //             {userInfo.isSeller && (
          //               <Button
          //                 type="button"
          //                 variant="outline-primary"
          //                 onClick={() =>
          //                   navigate(`/seller/product/${product._id}`)
          //                 }
          //               >
          //                 Edit
          //               </Button>
          //             )}
          //             &nbsp;
          //           </td>
          //         </tr>
          //       ))}
          //     </tbody>
          //   </table>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Qunatity Sold In the Current week</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {summary.sortedEntries.map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value.name}</td>
                  <td>{value.quantity}</td>
                  <td>
                    {userInfo.isSeller && (
                      <Button
                        type="button"
                        variant="outline-primary"
                        onClick={() => navigate(`/seller/product/${key}`)}
                      >
                        Edit
                      </Button>
                    )}
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* <h1>Dashboard</h1> */}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <div className="my-3">
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                ]}
              ></Chart>
            )}
          </div>
          <div>
            <div className="my-3">
              <h5>Sales Velocity</h5>
              {loading ? (
                <LoadingBox />
              ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Products {'<'} $30</th>
                      <th>Products between $30-60</th>
                      <th>Products {'>'} $60</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.resultArray.map((product) => (
                      <tr key={product._id}>
                        <td>{product._id}</td>
                        <td>{product.totalCounter30}</td>
                        <td>{product.totalCounter60}</td>
                        <td>{product.totalCounter90}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div className="my-3">
            <h2>Categories</h2>
            {summary.productCategories.length === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading Chart...</div>}
                data={[
                  ['Category', 'Products'],
                  ...summary.productCategories.map((x) => [x._id, x.count]),
                ]}
              ></Chart>
            )}
          </div>
        </>
      )}
    </div>
  );
}
