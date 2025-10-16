export interface CommentType {
  id: number;
  text: string;
  author: string;
  parentId: number | null;
  children: CommentType[];
}
