"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ProfileFormProps } from "@/app/shared/types/profile/profile";
import { Button } from "@/app/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/shared/ui/form";
import { Input } from "@/app/shared/ui/input";
import { ProfileAvatar } from "./profile-avatar";
import { updateProfileAction } from "./update-profile";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  email: z.string().email("Enter a valid email address."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm({ user }: ProfileFormProps) {
  const [image, setImage] = useState<string | null>(user.image ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  useEffect(() => {
    return () => {
      if (image?.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  function handleImageChange(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const preview = URL.createObjectURL(file);

    setImage(preview);
    setImageFile(file);
  }

  function handleImageRemove() {
    setImage(null);
    setImageFile(null);
  }

  async function onSubmit(values: ProfileFormValues) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (!image) {
      formData.append("removeImage", "true");
    }
    await updateProfileAction(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <ProfileAvatar
          name={form.watch("name") || user.name}
          image={image}
          onImageChange={handleImageChange}
          onImageRemove={handleImageRemove}
        />

        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Your name"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>

                <FormControl>
                  <Input type="email" autoComplete="email" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
