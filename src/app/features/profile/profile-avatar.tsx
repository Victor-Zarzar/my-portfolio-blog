"use client";

import { Camera, Trash2 } from "lucide-react";
import { useRef } from "react";
import type { ProfileAvatarProps } from "@/app/shared/types/profile/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/shared/ui/avatar";
import { Button } from "@/app/shared/ui/button";
import { getInitials } from "@/lib/utils";

export function ProfileAvatar({
  name,
  image,
  onImageChange,
  onImageRemove,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onImageChange?.(file);

    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar className="h-20 w-20">
        <AvatarImage src={image ?? undefined} alt={name} />
        <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            Change photo
          </Button>

          {image && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onImageRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP. Maximum 5 MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
