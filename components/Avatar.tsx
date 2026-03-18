"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function Avatar({ url, uid, onUpload, username }: { url: string | null, uid: string, onUpload: (url: string) => void, username?: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Récupérer l'initiale (ex: "P" pour "Potter")
  const initial = username ? username.charAt(0).toUpperCase() : 'P';

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      setAvatarUrl(URL.createObjectURL(data));
    } catch (error: any) {
      console.log('Error:', error.message);
    }
  }

  async function uploadAvatar(event: any) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) throw new Error('Select image');
      const file = event.target.files[0];
      const fileName = `${uid}-${Math.random()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      onUpload(fileName);
      await supabase.from('profiles').update({ avatar_url: fileName }).eq('id', uid);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    /* h-full w-full + aspect-square = Cercle garanti */
    <div className="relative w-full h-full aspect-square flex items-center justify-center">
      <label 
        className="cursor-pointer w-full h-full block relative rounded-full overflow-hidden bg-[#F5F5DC] border border-[#778899]/20 shadow-inner" 
        htmlFor="single"
      >
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="absolute inset-0 w-full h-full object-cover rounded-full" 
          />
        ) : (
          /* Placeholder avec l'initiale du pseudo */
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-sm font-black italic text-[#2F4F4F]/60 bg-[#F5F5DC]">
            {initial}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-[#2F4F4F]/60 flex items-center justify-center backdrop-blur-sm rounded-full">
            <div className="w-4 h-4 border-2 border-[#F5F5DC] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </label>
      
      <input 
        style={{ visibility: 'hidden', position: 'absolute' }} 
        type="file" 
        id="single" 
        accept="image/*" 
        onChange={uploadAvatar} 
        disabled={uploading} 
      />
    </div>
  );
}