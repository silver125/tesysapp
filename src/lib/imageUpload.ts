export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_EXT_RE = /\.(jpe?g|png|webp|heic|heif)$/i;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/') && !IMAGE_EXT_RE.test(file.name)) {
    return 'Envie uma imagem em PNG, JPG, WebP ou HEIC.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'A imagem deve ter até 5 MB.';
  }
  return null;
}

export function isMissingImageBucketError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.toLowerCase().includes('bucket not found')
    || message.toLowerCase().includes('bucket de imagens');
}

export function formatImageUploadError(error: unknown): string {
  if (isMissingImageBucketError(error)) {
    return 'Upload de imagens indisponível. Rode supabase/fix_course_images.sql no Supabase e tente de novo.';
  }
  return error instanceof Error ? error.message : 'Erro ao enviar imagem.';
}

export function revokeBlobPreview(preview: string) {
  if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
}
