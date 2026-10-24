export type GetProjectsParams = {
  t: (key: string) => string;
};

export type GetTimelineDataParams = {
  t: (key: string) => string;
};

export type GetServicesDataParams = {
  t: (key: string) => string;
};

export type GetCourseDataParams = {
  t: (key: string) => string;
};

export type CoursesType = {
  id: number;
  title: string;
  url: string;
};

export type Services = {
  id: number;
  title: string;
  description: string;
  p: string;
};

export type Experience = {
  id: number;
  type?: "work" | "education" | "freelance";
  time: string;
  title: string;
  role?: string;
  achievements?: string;
  description?: string;
  local?: string;
  tags?: string[];
};

export type TerminalCoursesProps = {
  courses: {
    id: number;
    title: string;
    url: string;
    completedAt: Date | string | null;
  }[];
};
