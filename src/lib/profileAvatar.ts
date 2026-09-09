import { assertSupabaseConfigured, isSupabaseConfigured, supabase } from './supabase';
import {
  formatImageUploadError,
  validateImageFile,
} from './imageUpload';

const PROFILE_IMAGE_BUCKET = 'opportunity-images';

export async function uploadProfileAvatar(file: File, userId: string): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado para upload de foto.');
  }
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

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
    throw new Error(formatImageUploadError(error));
  }

  const { data } = supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(path);
  if (!data.publicUrl?.trim()) {
    throw new Error('A foto não foi enviada. Tente novamente.');
  }
  return data.publicUrl;
}
