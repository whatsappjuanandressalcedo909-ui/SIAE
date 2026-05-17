import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Input from './Input';
import { X, Camera, Loader2 } from 'lucide-react';
import { uploadProfilePicture } from '../lib/supabase';

interface ProfileModalProps {
  user: User;
  existingData?: any;
  onComplete: (data: any) => void;
  onCancel?: () => void;
}

export default function ProfileModal({ user, existingData, onComplete, onCancel }: ProfileModalProps) {
  const nameParts = (user.displayName || '').split(' ');
  const initFirstName = existingData?.firstName || nameParts[0] || '';
  const initLastName = existingData?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

  const [f, setF] = useState({
    firstName: initFirstName,
    middleName: existingData?.middleName || '',
    lastName: initLastName,
    secondLastName: existingData?.secondLastName || '',
    documentType: existingData?.documentType || '',
    documentNumber: existingData?.documentNumber || '',
    phoneNumber: existingData?.phoneNumber || '',
    photoURL: existingData?.photoURL || user.photoURL || ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>(f.photoURL);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return setError('La imagen no debe superar los 2MB.');
      setSelectedFile(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^3\d{9}$/.test(f.phoneNumber)) return setError('El teléfono debe tener 10 dígitos y empezar por 3.');
    if (!f.documentType) return setError('Tipo de documento requerido.');

    setSaving(true);
    try {
      let finalPhotoURL = f.photoURL;

      if (selectedFile) {
        finalPhotoURL = await uploadProfilePicture(user.uid, selectedFile);
      }

      if (!existingData || existingData.documentNumber !== f.documentNumber) {
        const docSnap = await getDoc(doc(db, 'documentNumbers', f.documentNumber));
        if (docSnap.exists() && docSnap.data().userId !== user.uid) {
          setError('Este número de documento ya está registrado por otro usuario.');
          setSaving(false);
          return;
        }
      }

      const isNew = !existingData;
      const data: any = {
        email: user.email || '',
        firstName: f.firstName.trim(),
        middleName: f.middleName.trim(),
        lastName: f.lastName.trim(),
        secondLastName: f.secondLastName.trim(),
        documentType: f.documentType,
        documentNumber: f.documentNumber.trim(),
        phoneNumber: f.phoneNumber.trim(),
        photoURL: finalPhotoURL
      };

      const batch = writeBatch(db);
      if (isNew) {
        data.createdAt = serverTimestamp();
        batch.set(doc(db, 'users', user.uid), data);
      } else {
        batch.update(doc(db, 'users', user.uid), data);
      }
      
      if (!existingData || existingData.documentNumber !== f.documentNumber) {
         if (existingData?.documentNumber) {
           batch.delete(doc(db, 'documentNumbers', existingData.documentNumber));
         }
         batch.set(doc(db, 'documentNumbers', f.documentNumber), { userId: user.uid });
      }

      await batch.commit();
      
      onComplete(existingData ? { ...existingData, ...data } : data);
    } catch (err: any) {
      console.error('Save error:', err);
      if (err.code === 'permission-denied') {
        setError('No tienes permiso o el documento ya está ocupado.');
      } else {
        setError(err.message || 'Error al guardar perfil. Verifica las credenciales de Supabase.');
      }
      setSaving(false);
    }
  };

  const ch = (e: any) => setF({ ...f, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 sm:p-6 sm:py-12 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl my-auto flex flex-col relative max-h-full">
        {onCancel && (
          <button type="button" onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10">
            <X size={20} />
          </button>
        )}
        
        <div className="p-6 sm:p-8 border-b border-gray-100 shrink-0">
           <h2 className="text-2xl font-bold text-gray-900">
             {existingData ? 'Actualizar Perfil' : 'Completa tu perfil'}
           </h2>
           <p className="text-gray-500 mt-2 text-sm leading-relaxed">
             {existingData ? 'Modifica los datos de tu cuenta.' : '¡Hola! Parece que iniciaste sesión por primera vez con Google. Por favor, completa estos datos para continuar.'}
           </p>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto">
          <form id="profile-form" onSubmit={submit}>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 font-medium border border-red-100">{error}</div>}
            
            <div className="space-y-6">
              <section className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-50 flex items-center justify-center">
                    {previewURL ? (
                      <img src={previewURL} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="text-gray-300" size={32} />
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-all border-2 border-white"
                  >
                    <Camera size={16} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Imagen recomendada: 500x500px, máx 2MB</p>
              </section>

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
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Identificación y Contacto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1.5 text-gray-700">Tipo de Documento</label>
                    <select name="documentType" value={f.documentType} onChange={ch} required disabled={!!existingData?.documentType} className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed">
                      <option value="" disabled>Seleccionar...</option>
                      <option value="T.I">Tarjeta de Identidad (T.I)</option>
                      <option value="C.C">Cédula de Ciudadanía (C.C)</option>
                      <option value="C.E">Cédula de Extranjería (C.E)</option>
                    </select>
                  </div>
                  <Input label="Número de Documento" name="documentNumber" placeholder="Ej. 1000234567" value={f.documentNumber} onChange={ch} required disabled={!!existingData?.documentNumber} />
                </div>
                <Input label="Teléfono (Celular)" type="tel" name="phoneNumber" placeholder="Ej. 3001234567" value={f.phoneNumber} onChange={ch} required />
              </section>
            </div>
          </form>
        </div>
        
        <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100 rounded-b-2xl shrink-0 flex flex-col items-center">
          <button form="profile-form" disabled={saving} className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2" type="submit">
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : 'Guardar Perfil'}
          </button>
          {!existingData && (
             <button type="button" onClick={() => auth.signOut()} className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline">
                Cancelar e iniciar sesión con otra cuenta
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
