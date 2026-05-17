import { useState, useRef, ChangeEvent } from 'react';
import { Camera, AlertTriangle, UploadCloud, MapPin, X } from 'lucide-react';

export default function EmergencyReport() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string | null>(null);
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
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          setShowLocationPopup(true);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              setAddress(data.display_name);
            }
          } catch (error) {
            console.error("Error validando dirección:", error);
          }
          
          // Ocultar popup después de 6 segundos para tener tiempo de leer
          setTimeout(() => {
            setShowLocationPopup(false);
          }, 6000);
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
    alert(`Función de reporte en construcción. ¡Foto capturada! ${address ? `\nUbicación: ${address}` : location ? `\nUbicación: ${location.lat}, ${location.lng}` : ''}`);
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
            {address ? (
              <p className="text-gray-300 text-xs mt-0.5 max-w-[250px] truncate">
                {address}
              </p>
            ) : location ? (
              <p className="text-gray-300 text-xs mt-0.5">
                Buscando dirección... (Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)})
              </p>
            ) : null}
          </div>
          <button onClick={() => setShowLocationPopup(false)} className="ml-2 text-gray-400 hover:text-white shrink-0">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="w-full bg-transparent">
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
            className="w-full aspect-square max-h-[300px] mt-4 bg-red-600 text-white rounded-[2rem] hover:bg-red-700 active:scale-95 transition-all flex flex-col items-center justify-center gap-4 shadow-[0_8px_30px_rgb(220,38,38,0.3)]"
          >
            <Camera size={64} strokeWidth={1.5} />
            <span className="text-2xl font-black tracking-widest uppercase">S.O.S</span>
          </button>
        ) : (
          <div className="w-full flex flex-col gap-4 mt-4">
            <div className="relative rounded-3xl overflow-hidden border-2 border-red-100 bg-black aspect-[3/4] w-full max-w-sm mx-auto shadow-lg">
              <img src={preview} alt="Evidencia" className="object-cover w-full h-full" />
              
              <button 
                onClick={handleCaptureClick}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>

              {location && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white text-xs px-3 py-2.5 rounded-xl flex items-center gap-2 backdrop-blur-md">
                  <MapPin size={16} className="shrink-0 text-red-400" />
                  <span className="font-medium truncate drop-shadow-md">
                    {address ? address : `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                  </span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleReport}
              className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-200"
            >
              <UploadCloud size={24} />
              Enviar Inmediato
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
