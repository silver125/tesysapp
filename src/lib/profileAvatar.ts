import { assertSupabaseConfigured, isSupabaseConfigured, supabase } from './supabase';

const PROFILE_IMAGE_BUCKET = 'opportunity-images';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadProfileAvatar(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado para upload de foto.');
  }
  if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) {
    throw new Error('Envie uma imagem em PNG, JPG, WebP ou HEIC.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('A foto deve ter até 5 MB.');
  }

  assertSupabaseConfigured();

  const extFromName = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const extFromType = file.type.split('/')[1]?.replace('jpeg', 'jpg');
  const ext = extFromName || extFromType || 'jpg';
  const uniqueId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now());
  const path = `${userId}/profile/${uniqueId}.${ext}`;
  const contentType = file.type || (ext === 'heic' || ext === 'heif' ? 'image/heic' : 'image/jpeg');

  const { error } = await supabase.storage
    .from(PROFILE_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Erro ao enviar foto: ${error.message}`);
  }

  const { data } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
