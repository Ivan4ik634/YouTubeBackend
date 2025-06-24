export class RegisterDto {
  username: string;
  email: string;
  password: string;
  playerId: string;
}

export class LoginDto {
  username: string;
  password: string;
  code?: string;
}
export class editProfileDto {
  username: string;
  email: string;
  biograffy: string;
  password: string;
  avatar: string;
  badge: string;
  hidden: boolean;
  isVisibilityVideo: 'public' | 'byLink' | 'private';
}
