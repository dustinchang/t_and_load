import type { GolfCourse, CourseDetail } from '../types';

const BASE_URL =
  import.meta.env.VITE_GOLF_COURSE_API_BASE ?? 'https://api.golfcourseapi.com/v1';
const API_KEY = import.meta.env.VITE_GOLF_COURSE_API_KEY ?? '';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Key ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`GolfCourseAPI error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

interface SearchResponse {
  courses: GolfCourse[];
}

interface CourseDetailResponse {
  course: CourseDetail;
}

export const golfCourseApi = {
  /** Search courses by name / location */
  async searchCourses(query: string): Promise<GolfCourse[]> {
    const encoded = encodeURIComponent(query.trim());
    const data = await apiFetch<SearchResponse>(`/search?search_query=${encoded}`);
    return data.courses ?? [];
  },

  /** Get full course detail including hole-by-hole data */
  async getCourseDetail(id: number): Promise<CourseDetail> {
    const data = await apiFetch<CourseDetailResponse>(`/courses/${id}`);
    return data.course;
  },
};
