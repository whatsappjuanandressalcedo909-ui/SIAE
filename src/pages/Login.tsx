import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import Input from '../components/Input';
import { isValidEmail } from '../utils/validation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError('Formato de email inválido.');
    setLoading(true);
    try { 
      await signInWithEmailAndPassword(auth, email, password); 
    } catch (err: any) { 
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('El correo electrónico o la contraseña son incorrectos.');
      } else {
        setError(err.message || 'Error al iniciar sesión.');
      }
      setLoading(false); 
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked' || err.message.includes('popup')) {
        setError('Popup bloqueado. Abre la app en una nueva pestaña (ícono ↗ arriba a la derecha) para usar Google.');
      } else {
        setError(err.message || 'Error al iniciar sesión con Google.');
      }
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col h-full justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido de nuevo</h2>
        <p className="text-gray-500 mt-2">Ingresa a tu cuenta para continuar</p>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium border border-red-100">{error}</div>}
      
      <Input label="Correo electrónico" type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
      <Input label="Contraseña" type="password" placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} required />
      
      <div className="flex justify-end mt-1 mb-4">
        <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/10 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500 font-medium">O también</span>
        </div>
      </div>

      <button type="button" onClick={loginWithGoogle} disabled={loading} className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3.5 rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>
      
      <p className="mt-8 text-sm text-center text-gray-600">
        ¿No tienes cuenta? <Link to="/register" className="text-gray-900 font-semibold hover:underline">Regístrate aquí</Link>
      </p>
    </form>
  );
}
