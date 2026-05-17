import { useState, useEffect } from 'react';
import { generateChallenge, bufferToBase64URLString } from '../utils/webauthn';
import { Fingerprint, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { User, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface BiometricLockToggleProps {
  user: User;
}

export default function BiometricLockToggle({ user }: BiometricLockToggleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    // Verificar soporte de WebAuthn
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(available => {
          setIsSupported(available);
          if (available) {
            setIsEnabled(localStorage.getItem('biometric_app_lock') === 'true');
          }
        })
        .catch(console.error);
    }
  }, []);

  const toggleBiometricLock = async () => {
    setError('');
    
    // Si ya está habilitado, lo deshabilitamos directamente
    if (isEnabled) {
      localStorage.removeItem('biometric_app_lock');
      localStorage.removeItem('biometric_credential_id');
      localStorage.removeItem('biometric_fast_login');
      setIsEnabled(false);
      return;
    }

    if (!showPasswordPrompt) {
      setShowPasswordPrompt(true);
      return;
    }

    if (!password) {
      setError('Por favor, ingresa tu contraseña para confirmar.');
      return;
    }

    setLoading(true);
    try {
      // 1. Reautenticar para validar la contraseña y poder usarla para el login rápido
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      // 2. Pedimos verificación biométrica para registrar la credencial (Lock)
      const challenge = generateChallenge();
      const userId = generateChallenge();
      
      const webAuthnCredential = await navigator.credentials.create({
        publicKey: {
          challenge: challenge,
          rp: {
            name: 'PWA App Lock',
            id: window.location.hostname
          },
          user: {
            id: userId,
            name: 'PWA_Local_User',
            displayName: 'Usuario Local PWA'
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required', 
          },
          timeout: 60000,
        }
      }) as PublicKeyCredential;

      if (webAuthnCredential) {
        // Guardamos el ID de la credencial
        const credentialIdBase64 = bufferToBase64URLString(webAuthnCredential.rawId);
        localStorage.setItem('biometric_credential_id', credentialIdBase64);
        localStorage.setItem('biometric_app_lock', 'true');
        // Guardamos las credenciales para el inicio de sesión rápido (No es lo más seguro, pero funciona para la PWA)
        localStorage.setItem('biometric_fast_login', JSON.stringify({ email: user.email!, password }));
        
        setIsEnabled(true);
        setShowPasswordPrompt(false);
        setPassword('');
      }
    } catch (err: any) {
      console.error('Error configurando biometría:', err);
      if (err.name === 'NotAllowedError') {
        setError('Configuración cancelada por el usuario o tiempo agotado.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
         setError('Contraseña incorrecta.');
      } else {
        setError(err.message || 'Error al intentar configurar el inicio biométrico.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 sm:p-8 flex items-start gap-4">
         <div className="bg-gray-200 p-3 rounded-full text-gray-500 shrink-0">
           <Fingerprint size={24} />
         </div>
         <div>
           <h4 className="font-bold text-gray-900">App Lock y Fast Login (Huella / Face ID)</h4>
           <p className="text-sm text-gray-500 mt-1">
             Tu dispositivo o navegador no soporta WebAuthn para autenticación biométrica en esta aplicación.
           </p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-start gap-6">
       <div className="flex items-start gap-4 w-full">
         <div className={`p-3 rounded-full shrink-0 transition-colors ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
           {isEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
         </div>
         <div className="flex-1">
           <h4 className="font-bold text-gray-900">Inicio de Sesión Rápido y Bloqueo</h4>
           <p className="text-sm text-gray-500 mt-1">
             Permite iniciar sesión rápidamente desde la pantalla de login con tu huella dactilar o Face ID.
           </p>
           {error && <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>}
         </div>
       </div>
       
       {showPasswordPrompt && (
         <div className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100">
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Ingresa tu contraseña para habilitar
           </label>
           <input 
             type="password" 
             value={password}
             onChange={e => setPassword(e.target.value)}
             className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all mb-3"
             placeholder="Tu contraseña actual"
           />
           <div className="flex gap-2">
             <button
               onClick={() => { setShowPasswordPrompt(false); setPassword(''); setError(''); }}
               className="flex-1 bg-white border border-gray-200 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm"
             >
               Cancelar
             </button>
             <button
               onClick={toggleBiometricLock}
               disabled={loading || !password}
               className="flex-1 bg-gray-900 text-white font-medium py-2 rounded-xl hover:bg-gray-800 transition-all font-medium text-sm disabled:opacity-50"
             >
               {loading ? 'Verificando...' : 'Confirmar'}
             </button>
           </div>
         </div>
       )}

       {!showPasswordPrompt && (
         <button 
           onClick={toggleBiometricLock} 
           disabled={loading}
           className={`font-medium px-5 py-2.5 rounded-xl transition-all self-end ${
             isEnabled 
               ? 'bg-red-50 text-red-600 hover:bg-red-100' 
               : 'bg-gray-900 text-white hover:bg-gray-800'
           } disabled:opacity-50`}
         >
           {loading ? 'Verificando...' : isEnabled ? 'Desactivar Login Rápido' : 'Activar Login Rápido'}
         </button>
       )}
    </div>
  );
}
