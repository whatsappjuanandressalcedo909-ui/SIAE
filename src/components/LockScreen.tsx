import { useState, useEffect, ReactNode } from 'react';
import { generateChallenge, bufferToBase64URLString, base64URLStringToBuffer } from '../utils/webauthn';
import { Fingerprint, Lock } from 'lucide-react';
import { User } from 'firebase/auth'; // Ensure you've imported this
import { auth } from '../firebase'; // Import your auth if you want to sign out
import { safeStorage } from '../utils/storage';

export default function LockScreen({ children, user }: { children: ReactNode, user: any }) {
  const [locked, setLocked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isBiometricEnabled = safeStorage.getItem('biometric_app_lock') === 'true';
  const savedCredentialId = safeStorage.getItem('biometric_credential_id');

  useEffect(() => {
    // Si no está habilitado, o NO hay usuario (está en login), no bloqueamos la app
    if (!isBiometricEnabled || !savedCredentialId || !user) {
      setLocked(false);
    }
  }, [isBiometricEnabled, savedCredentialId, user]);


  const unlockApp = async () => {
    if (!savedCredentialId) return;

    setLoading(true);
    setError('');

    try {
      const challenge = generateChallenge();
      const credentialIdBuffer = base64URLStringToBuffer(savedCredentialId);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challenge,
          rpId: window.location.hostname,
          allowCredentials: [{
            id: credentialIdBuffer,
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required', 
          timeout: 60000,
        }
      }) as PublicKeyCredential;

      if (assertion) {
        setLocked(false);
      } else {
        setError('No se pudo verificar la credencial.');
      }
    } catch (err: any) {
      console.error('Error al desbloquear:', err);
      if (err.name === 'NotAllowedError') {
        setError('Desbloqueo cancelado. Inténtalo de nuevo.');
      } else {
        setError('Error al iniciar con biometría. Usa tu contraseña.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Pedir biometría automáticamente al montar si está bloqueado
  useEffect(() => {
    if (locked && isBiometricEnabled) {
      // Small timeout to allow UI to render first
      const t = setTimeout(() => {
        unlockApp();
      }, 500);
      return () => clearTimeout(t);
    }
  }, []); // Solo una vez al montar

  if (!locked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center mb-8">
        <Lock size={40} className="text-gray-900" />
      </div>
      
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">App Bloqueada</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Por tu seguridad, usa tu huella dactilar o Face ID para acceder a la aplicación.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 w-full max-w-sm border border-red-100">
          {error}
        </div>
      )}

      <button 
        onClick={unlockApp}
        disabled={loading}
        className="w-full max-w-sm flex items-center justify-center gap-3 bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <Fingerprint size={20} />
        {loading ? 'Verificando...' : 'Desbloquear'}
      </button>

      <button 
        onClick={() => {
          safeStorage.removeItem('biometric_app_lock');
          auth.signOut();
          window.location.reload(); 
        }}
        className="mt-6 text-sm text-gray-500 hover:text-gray-900 font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Ingresar con contraseña (cerrar sesión local)
      </button>
    </div>
  );
}
