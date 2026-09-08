import { Link } from 'react-router-dom';
import type { Product } from '../../types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
      {product.image && <img src={product.image} alt={product.name} style={{ width: '100%' }} />}
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <p>{product.in_stock ? 'In stock' : 'Out of stock'}</p>
      <Link to={`/products/${product.slug}`}>View Details</Link>
    </div>
  );
}