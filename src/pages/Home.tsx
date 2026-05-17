import { useState, useEffect } from 'react';
import { signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import ProfileModal from '../components/ProfileModal';

export default function Home({ user }: { user: User }) {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'users', user.uid)).then(d => {
      if (d.exists()) {
        setUserData(d.data());
      } else {
        setShowProfileModal(true);
      }
      setLoading(false);
    });
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-gray-500 font-medium">Cargando tu perfil...</p>
      </div>
    );
  }

  return (
    <div className="text-center w-full">
      {showProfileModal && (
        <ProfileModal
          user={user}
          existingData={userData}
          onComplete={(data) => {
            setUserData(data);
            setShowProfileModal(false);
          }}
          onCancel={userData ? () => setShowProfileModal(false) : undefined}
        />
      )}

      {userData && (
        <>
          <div className="w-20 h-20 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-sm overflow-hidden border-2 border-gray-50">
            {userData.photoURL ? (
              <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : userData.firstName ? (
              userData.firstName[0].toUpperCase()
            ) : (
              user.email?.[0].toUpperCase()
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Hola, {userData.firstName}</h2>
          <p className="text-gray-500 mt-2 mb-8 text-base">Has iniciado sesión como {user.email}</p>
          
          <div className="space-y-3">
            <Link to="/citizen" className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-3.5 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-900/10 transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Portal Ciudadano (Reportar)
            </Link>
            <Link to="/profile" className="w-full block text-center bg-gray-900 text-white font-semibold px-4 py-3.5 rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/10 transition-all shadow-sm">
              Mi Perfil
            </Link>
            <button onClick={() => signOut(auth)} className="w-full bg-white border border-gray-200 text-red-600 font-semibold px-4 py-3.5 rounded-xl hover:bg-red-50 focus:ring-4 focus:ring-red-100 transition-all shadow-sm">
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}
