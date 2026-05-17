import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ProfileModal from '../components/ProfileModal';
import BiometricLockToggle from '../components/BiometricLockToggle';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile({ user }: { user: User }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid)).then(d => {
      if (d.exists()) setUserData(d.data());
      setLoading(false);
    });
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-screen sm:min-h-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-500 font-medium">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-8">
      {showProfileModal && (
        <ProfileModal
          user={user}
          existingData={userData}
          onComplete={(data) => {
            setUserData(data);
            setShowProfileModal(false);
          }}
          onCancel={() => setShowProfileModal(false)}
        />
      )}

      <div className="flex items-center mb-8 pt-4 sm:pt-0">
        <Link to="/" className="mr-4 text-gray-400 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Mi Perfil</h2>
      </div>

      <div className="bg-white border text-left border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center text-3xl font-bold shrink-0 overflow-hidden border-2 border-gray-50">
           {userData?.photoURL ? (
             <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
           ) : userData?.firstName ? (
             userData.firstName[0].toUpperCase()
           ) : (
             <UserIcon size={32} />
           )}
        </div>
        <div className="flex-1 text-center sm:text-left">
           <h3 className="text-2xl font-bold text-gray-900">
             {userData ? `${userData.firstName} ${userData.lastName}` : (user.displayName || 'Usuario')}
           </h3>
           <p className="text-gray-500 mt-1">{user.email}</p>
        </div>
      </div>

      {userData ? (
        <div className="space-y-6 text-left">
          <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
             <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 border-b pb-2">Información Personal</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                 <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nombre Completo</label>
                 <p className="mt-1 font-medium text-gray-900">
                   {userData.firstName} {userData.middleName} {userData.lastName} {userData.secondLastName}
                 </p>
               </div>
             </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
             <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 border-b pb-2">Identificación y Contacto</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div>
                 <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Documento</label>
                 <p className="mt-1 font-medium text-gray-900">{userData.documentType} {userData.documentNumber}</p>
               </div>
               <div>
                 <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Teléfono</label>
                 <p className="mt-1 font-medium text-gray-900">{userData.phoneNumber}</p>
               </div>
             </div>
          </section>

          <BiometricLockToggle user={user} />

          <button onClick={() => setShowProfileModal(true)} className="w-full bg-gray-900 text-white font-semibold px-4 py-3.5 rounded-xl hover:bg-gray-800 transition-all shadow-sm">
            Editar Perfil
          </button>
        </div>
      ) : (
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl border border-yellow-100 text-center">
           <p className="mb-4">No has completado tu perfil aún.</p>
           <button onClick={() => setShowProfileModal(true)} className="bg-yellow-800 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-yellow-900 transition-colors shadow-sm">
             Completar Perfil
           </button>
        </div>
      )}
    </div>
  );
}
