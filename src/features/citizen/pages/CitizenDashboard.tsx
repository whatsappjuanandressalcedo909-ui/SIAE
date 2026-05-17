import { Link } from 'react-router-dom';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import EmergencyReport from '../components/EmergencyReport';

export default function CitizenDashboard() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" className="p-2 -ml-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-900 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-gray-900">Portal Ciudadano</h2>
        <div className="w-9"></div> {/* Espaciador para centrar el título */}
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Bienvenido Ciudadano</h3>
          <p className="text-gray-600 text-sm">
            En este portal puedes realizar reportes rápidos y acceder a servicios exclusivos para ciudadanos.
          </p>
        </div>

        {/* Componente especializado de reporte de emergencia con cámara */}
        <EmergencyReport />
      </div>
    </div>
  );
}
