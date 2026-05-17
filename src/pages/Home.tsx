import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import ProfileModal from '../components/ProfileModal';
import CitizenDashboard from '../features/citizen/pages/CitizenDashboard';

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
    <div className="w-full h-full text-left">
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
        <CitizenDashboard />
      )}
    </div>
  );
}
