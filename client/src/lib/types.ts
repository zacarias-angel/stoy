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

export interface PublicProfile {
  userId: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  primarySkill: { id: number; name: string; slug: string } | null;
}

export interface NearbyPerson {
  userId: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  skill: string | null;
  lat: number;
  lng: number;
  distanceMeters: number;
  distanceMinutes: number;
  distanceLabel: string;
}

export interface NearbyResponse {
  radiusMeters: number;
  results: NearbyPerson[];
}
