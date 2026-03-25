"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';

interface AvatarProps {
  url: string | null;
  uid: string;
  onUpload?: (url: string) => void;
  username?: string;
  readonly?: boolean;
}

export default function Avatar({ url, uid, onUpload, username, readonly = false }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Récupérer l'initiale du pseudo ou 'P' par défaut
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
      console.log('Error downloading image: ', error.message);
    }
  }

  async function uploadAvatar(event: any) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

      if (uploadError) throw uploadError;

      if (onUpload) onUpload(filePath);
      
      await supabase.from('profiles').update({ avatar_url: filePath }).eq('id', uid);
      
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  const renderContent = () => (
    <>
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          className="absolute inset-0 w-full h-full object-cover rounded-full" 
        />
      ) : (
        /* Couleur initiale et fond vide ajustés */
        <div className="absolute inset-0 w-full h-full flex items-center justify-center text-sm font-black italic text-[#313449]/60 bg-[#f6f6f9]">
          {initial}
        </div>
      )}

      {/* Spinner de chargement ajusté */}
      {uploading && (
        <div className="absolute inset-0 bg-[#313449]/60 flex items-center justify-center backdrop-blur-sm rounded-full z-10">
          <div className="w-4 h-4 border-2 border-[#f6f6f9] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );

  if (readonly) {
    return (
      <div className="relative w-full h-full aspect-square flex items-center justify-center pointer-events-none">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full aspect-square flex items-center justify-center group">
      <label 
        /* Bordures et fond ajustés */
        className="cursor-pointer w-full h-full block relative rounded-full overflow-hidden bg-[#f6f6f9] border border-[#d3d6e4] shadow-inner" 
        htmlFor="single"
      >
        {renderContent()}
        
        {/* Overlay "Edit" ajusté */}
        {!uploading && (
          <div className="absolute inset-0 bg-[#313449]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
            <span className="text-[8px] font-black text-white uppercase tracking-widest">Edit</span>
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