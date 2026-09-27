import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from '@/lib/toastStore';
import { cn } from '@/lib/utils';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface Props {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large', { description: 'Max 5 MB' });
      return;
    }

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error('Cloudinary not configured', {
        description: 'Set VITE_CLOUDINARY_* in .env.local and restart Vite',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error?.message || 'Upload failed');
      }

      const data = await res.json();
      onChange(data.secure_url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed', {
        description: (err as Error).message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {value ? (
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-slate-tint">
            <img src={value} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-paper/90 p-2 text-ink shadow-soft backdrop-blur transition-colors hover:bg-paper"
              aria-label="Replace"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-full bg-paper/90 p-2 text-clay shadow-soft backdrop-blur transition-colors hover:bg-clay hover:text-white"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line-strong bg-slate-tint text-ink-soft transition-all duration-200 hover:border-sky/60 hover:bg-sky-tint/30 hover:text-sky disabled:opacity-60'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-medium">Uploading…</span>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper shadow-soft">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">Upload image</p>
                <p className="mt-0.5 text-[11px] text-ink-mute">
                  PNG, JPG, WebP · max 5 MB
                </p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );
}
