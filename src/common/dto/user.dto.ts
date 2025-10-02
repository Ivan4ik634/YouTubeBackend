export class UserDto {
  _id: string;
  username: string;
  email: string;
  password: string;
  blocedUsers: string[];
  subscrides: string[];
  playerIds: string[];
}
