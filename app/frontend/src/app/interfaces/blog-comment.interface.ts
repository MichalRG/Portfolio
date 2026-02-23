export interface BlogComment {
  id: string;
  postSlug: string;
  userName: string;
  content: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
