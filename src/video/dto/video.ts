export class CreateVideoDto {
  title: string;
  description: string;
  tags: string[];
  preview: string;
  price: number;
  isCommentDisabled: boolean;
  isHidden: boolean;
  video: string[];
}

export class UpdateVideo {
  title: string;
  price: number;
  description: string;
  videoId: string;
  tags: string[];
}
export class LikeVideo {
  videoId: string;
}
export class createVideoInPlaylistDto {
  videoId: string;
  playlistId: string;
}
