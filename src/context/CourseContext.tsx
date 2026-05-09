import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { golfCourseApi } from '../services/golfCourseApi';
import type { GolfCourse, CourseDetail } from '../types';

interface CourseContextValue {
  results: GolfCourse[];
  selectedCourse: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
  searchCourses: (query: string) => Promise<void>;
  selectCourse: (id: number) => Promise<void>;
  clearSelection: () => void;
}

const CourseContext = createContext<CourseContextValue | null>(null);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<GolfCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchCourses(query: string) {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const courses = await golfCourseApi.searchCourses(query);
      setResults(courses);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function selectCourse(id: number) {
    setIsLoading(true);
    setError(null);
    try {
      const course = await golfCourseApi.getCourseDetail(id);
      setSelectedCourse(course);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  function clearSelection() {
    setSelectedCourse(null);
    setResults([]);
    setError(null);
  }

  return (
    <CourseContext.Provider value={{ results, selectedCourse, isLoading, error, searchCourses, selectCourse, clearSelection }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse(): CourseContextValue {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourse must be used inside <CourseProvider>');
  return ctx;
}
