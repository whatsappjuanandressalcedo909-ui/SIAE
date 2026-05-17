import { useState, useRef, ChangeEvent } from 'react';
import { Camera, AlertTriangle, UploadCloud } from 'lucide-react';

export default function EmergencyReport() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
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
    }
  };

  const handleReport = () => {
    if (!photo) return;
    // Aquí implementaremos la subida o envío del reporte de emergencia
    alert("Función de reporte en construcción. ¡Foto capturada correctamente!");
  };

  return (
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
  );
}
