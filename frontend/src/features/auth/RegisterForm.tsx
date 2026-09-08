import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from './authApi';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [is_seller,setIs_seller] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await authApi.register({ username, email, password, password2,is_seller });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.username?.[0] || err.response?.data?.password2?.[0] || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input type="password" placeholder="Confirm Password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
      <label>
        Seller
        <input
          type="checkbox"
          checked={is_seller}
          onChange={(e) => setIs_seller(e.target.checked)}
        />
      </label>
      <button type="submit">Register</button>
    </form>
  );
}