export type CourseTableItem = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  url: string;
  isPublished: boolean;
  sortOrder: number;
  completedAt: Date | null;
  translations: { title: string }[];
};

export type CourseTableProps = {
  data: CourseTableItem[];
};
