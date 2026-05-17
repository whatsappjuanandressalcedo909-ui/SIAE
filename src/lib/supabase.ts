import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Profile picture upload will not work.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export async function uploadProfilePicture(uid: string, file: File) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado. Por favor agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en la configuración.');
  }
  const fileExt = file.name.split('.').pop();
  const fileName = `${uid}-${Math.random()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    if (uploadError.message.includes('row-level security')) {
      throw new Error('Debes configurar las políticas RLS en Supabase Storage (bucket "profiles") para permitir subir archivos públicos.');
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadEmergencyPicture(uid: string, file: File) {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Supabase no está configurado. Por favor agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en la configuración.');
  }
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${uid}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('emergencies')
    .upload(filePath, file);

  if (uploadError) {
    if (uploadError.message.includes('row-level security')) {
      throw new Error('Debes configurar las políticas RLS en Supabase Storage (bucket "emergencies") para permitir subir archivos.');
    }
    throw uploadError;
  }

  const { data } = supabase.storage.from('emergencies').getPublicUrl(filePath);
  return data.publicUrl;
}
