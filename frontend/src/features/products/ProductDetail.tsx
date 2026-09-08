import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { productsApi } from './productsApi';
import type { Product } from '../../types';
import type { RootState } from '../../store/store';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  


  useEffect(() => {
    if (!slug) return;
    let ignore = false;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productsApi.getProduct(slug);
        if (!ignore) setProduct(response.data);
      } catch {
        if (!ignore) setError('Product not found');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchProduct();
    return () => { ignore = true; };
  }, [slug]);

  const handleDelete = async () => {
    if (!product || !window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await productsApi.deleteProduct(product.slug);
      navigate('/');
    } catch {
      setError('Could not delete product.');
      setDeleting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error || !product) return <p style={{ color: 'red' }}>{error || 'Not found'}</p>;

  const isOwner = currentUser?.username === product.owner;
  console.log('currentUser:', currentUser);
  console.log('product.owner:', product.owner);
  console.log('isOwner:', isOwner);
  return (
    <div>
      {product.image && <img src={product.image} alt={product.name} style={{ maxWidth: '400px' }} />}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>${product.price}</p>
      <p>{product.in_stock ? `${product.stock} in stock` : 'Out of stock'}</p>
      <p>Category: {product.category.name}</p>

      {isOwner && (
        <button onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting...' : 'Delete Product'}
        </button>
      )}
    </div>
  );
}