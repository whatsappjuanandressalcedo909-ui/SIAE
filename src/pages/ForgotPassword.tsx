import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import Input from '../components/Input';
import { isValidEmail } from '../utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) return setError('Formato de email inválido.');
    
    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No hay un usuario registrado con este correo.');
      } else {
        setError(err.message || 'Error al enviar el correo de recuperación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Recuperar contraseña</h2>
        <p className="text-gray-500 mt-2">Ingresa tu correo para recibir un enlace de restablecimiento</p>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 font-medium border border-red-100">{error}</div>}
      
      {success ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-100 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h3 className="text-lg font-bold mb-2">Correo enviado</h3>
          <p className="text-sm mb-6">Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada o la carpeta de correos no deseados.</p>
          <Link to="/login" className="inline-block w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/10 transition-all">
            Volver al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Input label="Correo electrónico" type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
          
          <button disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/10 transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
          
          <p className="mt-8 text-sm text-center text-gray-600">
            ¿Recordaste tu contraseña? <Link to="/login" className="text-gray-900 font-semibold hover:underline">Inicia sesión</Link>
          </p>
        </form>
      )}
    </div>
  );
}
