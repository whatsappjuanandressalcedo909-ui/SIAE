import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../../firebase';
import { MapPin, Clock, Image as ImageIcon, X, ExternalLink } from 'lucide-react';

interface Emergency {
  id: string;
  userId: string;
  photoUrl: string;
  location: { lat: number; lng: number } | null;
  address: string;
  status: string;
  createdAt: Timestamp;
}

export default function EmergencyHistory() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);

  useEffect(() => {
    const fetchEmergencies = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('Usuario no autenticado');
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, 'emergencies'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const emergenciesData: Emergency[] = [];
        querySnapshot.forEach((doc) => {
          emergenciesData.push({ id: doc.id, ...doc.data() } as Emergency);
        });

        // Ordenar en memoria por fecha descendente
        emergenciesData.sort((a, b) => {
           const timeA = a.createdAt?.toMillis() || 0;
           const timeB = b.createdAt?.toMillis() || 0;
           return timeB - timeA;
        });

        setEmergencies(emergenciesData);
      } catch (err: any) {
        console.error('Error fetching emergencies:', err);
        if (err.message && err.message.includes('FAILED_PRECONDITION')) {
           setError('Se requiere configurar un índice en Firestore (revisa la consola para el link).');
        } else {
           setError('Error al cargar el historial de emergencias');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencies();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center shadow-sm">
        {error}
      </div>
    );
  }

  if (emergencies.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
        <span className="text-gray-500">No has reportado ninguna emergencia recientemente.</span>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'resolved': return 'Resuelto';
      case 'in-progress': return 'En Proceso';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        Historial de Emergencias
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {emergencies.map((emergency) => (
          <div 
            key={emergency.id} 
            onClick={() => setSelectedEmergency(emergency)}
            className="bg-white border hover:border-red-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex border-b bg-gray-50/50 px-4 py-3 justify-between items-center">
               <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                 <Clock size={14} />
                 <span>{emergency.createdAt ? emergency.createdAt.toDate().toLocaleString() : 'Fecha desconocida'}</span>
               </div>
               <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getStatusColor(emergency.status)}`}>
                 {getStatusText(emergency.status)}
               </span>
            </div>
            <div className="p-4 flex gap-4">
               {emergency.photoUrl ? (
                 <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border bg-gray-100">
                   <img src={emergency.photoUrl} alt="Evidencia" className="w-full h-full object-cover" />
                 </div>
               ) : (
                 <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-dashed bg-gray-50 flex items-center justify-center text-gray-400">
                   <ImageIcon size={28} strokeWidth={1.5} />
                 </div>
               )}
               
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                     <MapPin size={16} className="shrink-0 mt-0.5 text-gray-400" />
                     <span className="line-clamp-2 md:line-clamp-3 leading-snug">{emergency.address || 'Ubicación no especificada'}</span>
                  </div>
                  {emergency.location && (
                    <div className="mt-2 text-[10px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded-md inline-block w-fit border border-gray-100">
                      {emergency.location.lat.toFixed(5)}, {emergency.location.lng.toFixed(5)}
                    </div>
                  )}
               </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEmergency && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-900">Detalles de Emergencia</h3>
              <button 
                onClick={() => setSelectedEmergency(null)}
                className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <Clock size={16} />
                  <span>{selectedEmergency.createdAt ? selectedEmergency.createdAt.toDate().toLocaleString() : 'Fecha desconocida'}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs uppercase tracking-wider font-bold border ${getStatusColor(selectedEmergency.status)}`}>
                  {getStatusText(selectedEmergency.status)}
                </span>
              </div>

              {selectedEmergency.photoUrl && (
                <div className="rounded-xl overflow-hidden border bg-gray-100">
                  <img src={selectedEmergency.photoUrl} alt="Evidencia" className="w-full h-auto object-cover" />
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="shrink-0 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">Ubicación</h4>
                    <p className="text-sm text-gray-700 leading-snug">{selectedEmergency.address || 'Ubicación no especificada'}</p>
                    
                    {selectedEmergency.location && (
                      <div className="mt-3">
                        <a 
                          href={`https://www.google.com/maps?q=${selectedEmergency.location.lat},${selectedEmergency.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 rounded-lg text-sm font-medium transition-all shadow-sm"
                        >
                          <ExternalLink size={16} />
                          Ver en Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-500 font-mono">
                ID de Reporte: {selectedEmergency.id}
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <button 
                onClick={() => setSelectedEmergency(null)}
                className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
