import { createClient } from './client';

export const BUCKETS = {
  ORIGINALS: 'wardrobe-originals',
  PREVIEWS: 'outfit-previews',
  TRYON: 'user-tryon',
} as const;

export async function uploadWardrobeImage(
  file: File | Blob,
  userId: string,
  itemId: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const supabase = createClient();
  const fileExt = file.type?.includes('png') ? 'png' : file.type?.includes('webp') ? 'webp' : 'jpg';
  const filePath = `${userId}/${itemId}.${fileExt}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(BUCKETS.ORIGINALS)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.warn('Storage upload error, using local data URL fallback:', uploadError.message);
      // Fallback to data URL if bucket is not yet created in Supabase project
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            publicUrl: reader.result as string,
            storagePath: filePath,
          });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data: urlData } = supabase.storage
      .from(BUCKETS.ORIGINALS)
      .getPublicUrl(filePath);

    return {
      publicUrl: urlData.publicUrl,
      storagePath: filePath,
    };
  } catch (err) {
    console.warn('Exception during upload, falling back to data URL:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          publicUrl: reader.result as string,
          storagePath: filePath,
        });
      };
      reader.readAsDataURL(file);
    });
  }
}

export async function deleteWardrobeImage(storagePath: string): Promise<boolean> {
  if (!storagePath || storagePath.startsWith('data:')) return true;
  const supabase = createClient();
  try {
    const { error } = await supabase.storage.from(BUCKETS.ORIGINALS).remove([storagePath]);
    if (error) {
      console.warn('Error deleting storage image:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function uploadTryonPhoto(
  file: File | Blob,
  userId: string
): Promise<{ path: string; url: string }> {
  const supabase = createClient();
  const filePath = `${userId}/tryon_${Date.now()}.jpg`;

  try {
    const { error } = await supabase.storage
      .from(BUCKETS.TRYON)
      .upload(filePath, file, { upsert: true, contentType: file.type || 'image/jpeg' });

    if (error) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ path: filePath, url: reader.result as string });
        };
        reader.readAsDataURL(file);
      });
    }

    const { data } = await supabase.storage.from(BUCKETS.TRYON).createSignedUrl(filePath, 3600);
    return { path: filePath, url: data?.signedUrl || filePath };
  } catch {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ path: filePath, url: reader.result as string });
      };
      reader.readAsDataURL(file);
    });
  }
}

export async function deleteTryonPhoto(storagePath: string): Promise<boolean> {
  if (!storagePath || storagePath.startsWith('data:')) return true;
  const supabase = createClient();
  try {
    await supabase.storage.from(BUCKETS.TRYON).remove([storagePath]);
    return true;
  } catch {
    return false;
  }
}
