export interface Skill {
  id: number;
  name: string;
  slug: string;
  isPrimary?: boolean;
}

export interface Profile {
  userId: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  isVisible: boolean;
  skills: Skill[];
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  headline?: string;
}

export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  isVisible?: boolean;
  primarySkillId?: number | null;
}
