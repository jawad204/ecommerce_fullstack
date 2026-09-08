import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { logout } from '../features/auth/authSlice';




export default function NavBar() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  console.log("User:", user);
  console.log("Authenticated:", isAuthenticated);

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
      <Link to="/">Home</Link>
      {isAuthenticated ? (
        <>
          <button onClick={() => dispatch(logout())}>Logout</button>
          {user?.is_seller && <Link to="/sell">Sell an Item</Link>}
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}