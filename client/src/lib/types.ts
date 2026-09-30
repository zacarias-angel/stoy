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
  skillIds?: number[];
}

export interface PublicProfile {
  userId: number;
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  bio: string | null;
  primarySkill: { id: number; name: string; slug: string } | null;
  skills: Skill[];
  ratingAverage: number | null;
  ratingCount: number;
}

export interface ProfileReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { userId: number; name: string; avatarUrl: string | null };
}

export interface ProfileReviewsResponse {
  reviews: ProfileReview[];
  viewerReview: ProfileReview | null;
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

export interface Conversation {
  id: number;
  otherUser: { userId: number; name: string; avatarUrl: string | null; headline: string | null };
  lastMessage: { text: string; createdAt: string } | null;
}

export interface Message {
  id: number;
  senderUserId: number;
  text: string;
  createdAt: string;
}

export interface Membership {
  isActive: boolean;
  status: 'inactive' | 'active' | 'past_due' | 'cancelled' | 'expired';
  expiresAt: string | null;
  priceArs: number;
  discoveryRadiusMeters: number;
}
