export type ProfileLink = {
  label: string;
  href: string;
  icon: "github" | "linkedin";
};

export type ProfileData = {
  name: string;
  image: {
    src: string;
    alt: string;
    blurDataURL?: string;
    placeholder?: string;
    quality: number;
    priority?: boolean;
    sizes: string;
  };
  links: ProfileLink[];
};

export type ProfileAvatarProps = {
  name: string;
  image?: string | null;
  onImageChange?: (file: File) => void;
  onImageRemove?: () => void;
};

export type ProfileFormProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};
