import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, User as UserIcon, LogOut, ArrowLeft } from 'lucide-react';
import { auth } from '../../../firebase';
import { signOut } from 'firebase/auth';
import EmergencyReport from '../components/EmergencyReport';
import EmergencyHistory from '../components/EmergencyHistory';

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState<'sos' | 'history'>('sos');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] sm:h-[600px] w-full -mx-6 sm:-mx-8 -my-6 sm:-my-8 bg-gray-50 relative pb-[70px] rounded-none sm:rounded-2xl overflow-hidden shadow-inner font-sans">
      
      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto w-full relative z-0">
        {activeTab === 'sos' && (
          <div className="flex flex-col items-center justify-center min-h-full pb-8 pt-4">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Emergencia 911</h2>
                <p className="text-gray-500 text-sm mt-2 max-w-[260px] mx-auto font-medium">
                   Utiliza esta herramienta solo ante un peligro real o inminente.
                </p>
             </div>
             
             {/* The EmergencyReport component naturally has a giant S.O.S button */}
             <div className="w-full max-w-sm">
                <EmergencyReport />
             </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="pt-2 h-full pb-8">
             <button 
               onClick={() => setActiveTab('sos')} 
               className="flex items-center text-gray-500 mb-6 hover:text-gray-900 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-sm font-medium"
             >
               <ArrowLeft size={16} className="mr-1.5" />
               Volver a S.O.S
             </button>
             <EmergencyHistory />
          </div>
        )}
      </div>

      {/* WhatsApp-like Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[70px] bg-white border-t border-gray-200 flex justify-around items-center px-2 z-10 sm:rounded-b-2xl">
        
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex flex-col items-center justify-center gap-1 w-20 transition-colors ${activeTab === 'history' ? 'text-red-600' : 'text-gray-400 hover:text-gray-900'}`}
        >
          <Clock size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
          <span className="text-[10px] font-bold mt-1">Historial</span>
        </button>

        <button 
          onClick={() => navigate('/profile')} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-gray-400 hover:text-gray-900 transition-colors"
        >
          <UserIcon size={24} strokeWidth={2} />
          <span className="text-[10px] font-bold mt-1">Mi Perfil</span>
        </button>

        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-gray-400 hover:text-red-600 transition-colors"
        >
          <LogOut size={24} strokeWidth={2} />
          <span className="text-[10px] font-bold mt-1">Salir</span>
        </button>

      </div>
      
    </div>
  );
}
