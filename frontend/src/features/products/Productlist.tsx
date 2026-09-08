import { useEffect, useState } from 'react';
import { productsApi } from './productsApi';
import ProductCard from './Productcard';
import type { Product ,Category} from '../../types';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories ONCE, when the component first mounts
  useEffect(() => {
    productsApi.getCategories().then((response) => setCategories(response.data));
  }, []);

  // Fetch products EVERY TIME selectedCategory changes
  useEffect(() => {
    setLoading(true);
    productsApi
      .getProducts(selectedCategory ? { category: selectedCategory } : undefined)
      .then((response) => setProducts(response.data))
      .catch(() => setError('Could not load products'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <select
        value={selectedCategory ?? ''}
        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}