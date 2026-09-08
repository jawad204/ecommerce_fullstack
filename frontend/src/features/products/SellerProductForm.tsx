import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from './productsApi';
import type { Category } from '../../types';

export default function SellerProductForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
 
  
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    productsApi.getCategories().then((response) => setCategories(response.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('category_id', String(categoryId));
      if (imageFile) {
        formData.append('image', imageFile);
      }
   

      const response = await productsApi.createProduct(formData);
      navigate(`/products/${response.data.slug}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not create product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input type="text" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} required />

      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <input type="number" step="0.01" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />

      <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required />

      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')} required>
        <option value="">Select a category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
      />


      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}