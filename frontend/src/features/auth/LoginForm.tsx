import { useState } from 'react';
import { useDispatch,useSelector } from 'react-redux';
import type { AppDispatch ,RootState} from '../../store/store';
import { login, fetchProfile } from './authSlice';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { loading , error } = useSelector((state: RootState) => state.auth);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  const result = await dispatch(login({ username, password }));
  if (login.fulfilled.match(result)) {
    dispatch(fetchProfile());
  };
  }
  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}