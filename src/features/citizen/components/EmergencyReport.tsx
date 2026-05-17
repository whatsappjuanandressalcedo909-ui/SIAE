import { useState, useRef, ChangeEvent } from 'react';
import { Camera, AlertTriangle, UploadCloud, MapPin, X } from 'lucide-react';

export default function EmergencyReport() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCaptureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setPhoto(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      captureLocation();
    }
  };

  const captureLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setShowLocationPopup(true);
          
          // Ocultar popup después de 4 segundos
          setTimeout(() => {
            setShowLocationPopup(false);
          }, 4000);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener la ubicación. Por favor, asegúrate de dar permisos de GPS.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("La geolocalización no está soportada en este navegador.");
    }
  };

  const handleReport = () => {
    if (!photo) return;
    // Aquí implementaremos la subida o envío del reporte de emergencia
    alert(`Función de reporte en construcción. ¡Foto capturada! ${location ? `\nUbicación: ${location.lat}, ${location.lng}` : ''}`);
  };

  return (
    <div className="relative">
      {/* Toast Popup para la ubicación */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-in-out ${showLocationPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}`}>
        <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 w-max max-w-[90vw]">
          <div className="bg-blue-500 rounded-full p-1.5 shrink-0">
            <MapPin size={16} className="text-white" />
          </div>
          <div className="text-sm">
            <p className="font-bold">Ubicación capturada</p>
            {location && (
              <p className="text-gray-300 text-xs mt-0.5">
                Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
              </p>
            )}
          </div>
          <button onClick={() => setShowLocationPopup(false)} className="ml-2 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>

        <h3 className="text-xl font-bold text-red-900 mb-2">Reportar Emergencia</h3>
        <p className="text-red-700 text-sm mb-6 max-w-sm">
          Si eres ciudadano, usa este botón para capturar evidencia inmediata del incidente.
        </p>

        {/* Input de archivo oculto configurado para usar la cámara en modo fotos */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {!preview ? (
          <button
            onClick={handleCaptureClick}
            className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-3 shadow-sm shadow-red-200"
          >
            <Camera size={24} />
            Tomar fotografía
          </button>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="relative rounded-xl overflow-hidden border-2 border-red-200 bg-black aspect-[3/4] w-full max-w-xs mx-auto">
              <img src={preview} alt="Evidencia de emergencia" className="object-cover w-full h-full" />
              <button 
                onClick={handleCaptureClick}
                className="absolute bottom-4 right-4 bg-white/90 text-gray-900 p-2 rounded-full shadow-lg"
              >
                <Camera size={20} />
              </button>
              {location && (
                <div className="absolute top-2 left-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center justify-center gap-1 backdrop-blur-sm">
                  <MapPin size={10} />
                  <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleReport}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-3 shadow-sm shadow-red-200"
            >
              <UploadCloud size={24} />
              Enviar Reporte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
