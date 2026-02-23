export interface BlogComment {
  id: string;
  parentCommentId: string | null;
  postSlug: string;
  userName: string;
  content: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
