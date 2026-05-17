import { useState, useEffect } from 'react';
import { generateChallenge, bufferToBase64URLString } from '../utils/webauthn';
import { Fingerprint, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function BiometricLockToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setIsEnabled(false);
      return;
    }

    // Si queremos habilitarlo, pedimos verificación biométrica para registrar la credencial (Lock)
    setLoading(true);
    try {
      const challenge = generateChallenge();
      const userId = generateChallenge(); // ID aleatorio para representar este dispositivo/usuario en esta PWA localmente
      
      const credential = await navigator.credentials.create({
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
            userVerification: 'required', // Forzamos biometría/PIN
          },
          timeout: 60000,
        }
      }) as PublicKeyCredential;

      if (credential) {
        // Guardamos el ID de la credencial en localStorage para usarlo en el login
        const credentialIdBase64 = bufferToBase64URLString(credential.rawId);
        localStorage.setItem('biometric_credential_id', credentialIdBase64);
        localStorage.setItem('biometric_app_lock', 'true');
        setIsEnabled(true);
      }
    } catch (err: any) {
      console.error('Error configurando biometría:', err);
      // Errores comunes de WebAuthn: NotAllowedError (usuario canceló)
      if (err.name === 'NotAllowedError') {
        setError('Configuración cancelada por el usuario o tiempo agotado.');
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
           <h4 className="font-bold text-gray-900">App Lock (Huella / Face ID)</h4>
           <p className="text-sm text-gray-500 mt-1">
             Tu dispositivo o navegador no soporta WebAuthn para autenticación biométrica en esta aplicación.
           </p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between">
       <div className="flex items-start gap-4 flex-1">
         <div className={`p-3 rounded-full shrink-0 transition-colors ${isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
           {isEnabled ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
         </div>
         <div>
           <h4 className="font-bold text-gray-900">Bloqueo de Aplicación (Face ID / Huella)</h4>
           <p className="text-sm text-gray-500 mt-1">
             Solicitar autenticación biométrica de tu dispositivo cada vez que ingreses a la aplicación.
           </p>
           {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
         </div>
       </div>
       
       <button 
         onClick={toggleBiometricLock} 
         disabled={loading}
         className={`shrink-0 font-medium px-5 py-2.5 rounded-xl transition-all ${
           isEnabled 
             ? 'bg-red-50 text-red-600 hover:bg-red-100' 
             : 'bg-gray-900 text-white hover:bg-gray-800'
         } disabled:opacity-50`}
       >
         {loading ? 'Verificando...' : isEnabled ? 'Desactivar App Lock' : 'Activar App Lock'}
       </button>
    </div>
  );
}
