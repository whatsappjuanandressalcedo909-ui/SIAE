import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Check, X } from 'lucide-react';
import { auth, db } from '../firebase';
import Input from '../components/Input';
import { isValidEmail } from '../utils/validation';

const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score < 2) return { score: 1, label: 'Débil', color: 'bg-red-500' };
  if (score < 4) return { score: 2, label: 'Media', color: 'bg-yellow-500' };
  return { score: 3, label: 'Fuerte', color: 'bg-green-500' };
};

export default function Register() {
  const [f, setF] = useState({
    email: '', password: '', confirm: '', firstName: '', middleName: '', 
    lastName: '', secondLastName: '', documentType: '', documentNumber: '', phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(f.email)) return setError('Formato de email inválido.');
    if (f.password !== f.confirm) return setError('Las contraseñas no coinciden.');
    if (!/^3\d{9}$/.test(f.phoneNumber)) return setError('El teléfono debe tener 10 dígitos y empezar por 3.');
    if (!f.documentType) return setError('Tipo de documento requerido.');
    
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'documentNumbers', f.documentNumber));
      if (docSnap.exists()) {
        setError('Este número de documento ya está registrado.');
        setLoading(false);
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, f.email, f.password);
      const data: any = { 
        email: user.email || '',
        createdAt: serverTimestamp(),
        firstName: f.firstName.trim(),
        middleName: f.middleName.trim(),
        lastName: f.lastName.trim(),
        secondLastName: f.secondLastName.trim(),
        documentType: f.documentType,
        documentNumber: f.documentNumber.trim(),
        phoneNumber: f.phoneNumber.trim()
      };
      
      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), data);
      batch.set(doc(db, 'documentNumbers', f.documentNumber), { userId: user.uid });
      await batch.commit();

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado. Por favor, inicia sesión.');
      } else if (err.code === 'permission-denied') {
        setError('No tienes permiso para realizar esta acción, o el documento ya existe.');
      } else {
        setError(err.message || 'Error al registrar usuario.');
      }
      setLoading(false);
    }
  };

  const ch = (e: any) => setF({ ...f, [e.target.name]: e.target.value });

  return (
    <form onSubmit={submit} className="pb-8">
      <div className="mb-6 pt-4 sm:pt-0">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Crear Cuenta</h2>
        <p className="text-gray-500 mt-2">Completa tus datos para registrarte</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 font-medium border border-red-100">{error}</div>}
      
      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Información Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            <Input label="Primer Nombre" name="firstName" placeholder="Ej. Juan" value={f.firstName} onChange={ch} required />
            <Input label="Segundo Nombre" name="middleName" placeholder="Opcional" value={f.middleName} onChange={ch} />
            <Input label="Primer Apellido" name="lastName" placeholder="Ej. Pérez" value={f.lastName} onChange={ch} required />
            <Input label="Segundo Apellido" name="secondLastName" placeholder="Opcional" value={f.secondLastName} onChange={ch} />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Identificación</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1.5 text-gray-700">Tipo de Documento</label>
              <select name="documentType" value={f.documentType} onChange={ch} required className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer">
                <option value="" disabled>Seleccionar...</option>
                <option value="T.I">Tarjeta de Identidad (T.I)</option>
                <option value="C.C">Cédula de Ciudadanía (C.C)</option>
                <option value="C.E">Cédula de Extranjería (C.E)</option>
              </select>
            </div>
            <Input label="Número de Documento" name="documentNumber" placeholder="Ej. 1000234567" value={f.documentNumber} onChange={ch} required />
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Contacto y Cuenta</h3>
          <Input label="Teléfono (Celular)" type="tel" name="phoneNumber" placeholder="Ej. 3001234567" value={f.phoneNumber} onChange={ch} required />
          <Input label="Correo Electrónico" type="email" name="email" placeholder="ejemplo@correo.com" value={f.email} onChange={ch} required />
          
          <div className="grid grid-cols-1 gap-y-1">
            <div>
              <Input label="Contraseña" type="password" name="password" placeholder="••••••••" value={f.password} onChange={ch} required />
              {f.password && (
                <div className="mt-[-12px] mb-4 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${getPasswordStrength(f.password).color}`} style={{ width: `${(getPasswordStrength(f.password).score / 3) * 100}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium w-12 text-right">{getPasswordStrength(f.password).label}</span>
                </div>
              )}
            </div>
            <div>
              <Input label="Confirmar Contraseña" type="password" name="confirm" placeholder="••••••••" value={f.confirm} onChange={ch} required />
              {f.confirm && (
                <div className="mt-[-12px] mb-4 text-xs font-medium">
                  {f.password === f.confirm ? (
                    <span className="text-green-600 flex items-center gap-1.5"><Check size={14}/> Las contraseñas coinciden</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1.5"><X size={14}/> Las contraseñas no coinciden</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <button disabled={loading} className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition-all mt-6 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed" type="submit">
        {loading ? 'Creando cuenta...' : 'Confirmar Registro'}
      </button>
      <p className="mt-6 text-sm text-center text-gray-600">
        ¿Ya tienes una cuenta? <Link to="/login" className="text-gray-900 font-semibold hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
