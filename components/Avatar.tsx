"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export default function Avatar({ url, uid, onUpload }: { url: string | null, uid: string, onUpload: (url: string) => void }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    <div className="relative w-full h-full group">
      <label className="cursor-pointer w-full h-full block relative rounded-full overflow-hidden bg-[#141417]" htmlFor="single">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl bg-[#141417]">👤</div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#DFFF5E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </label>
      <input style={{ visibility: 'hidden', position: 'absolute' }} type="file" id="single" accept="image/*" onChange={uploadAvatar} disabled={uploading} />
    </div>
  );
}