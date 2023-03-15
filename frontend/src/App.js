import './App.css';
import data from './data';

function App() {
  return (
    <div>
      <header>
        <a href="/">EasyBuy</a>
      </header>
      <main>
        <h1>Featured Products</h1>
        <div className="products">
          {data.products.map((product) => (
            <div className="product" key={product.slug}>
              <a href={`/product/${product.slug}`}>
                <img src={product.image} alt={product.name} />
              </a>
              <div className="product-info">
                <p>{product.brand}</p>
                <p> {product.name}</p>
                <button className="btn btn-sm btn-primary">Add to cart</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
