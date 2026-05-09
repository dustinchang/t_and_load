import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Flag } from "lucide-react";
import { Layout, TopBar } from "../components/layout/Layout";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { useCourse } from "../context/CourseContext";
import "./pages.css";

export function CourseSelectPage() {
  const navigate = useNavigate();
  const { results, isLoading, error, searchCourses, selectCourse } =
    useCourse();
  const [query, setQuery] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) searchCourses(query);
    },
    [query, searchCourses],
  );

  const handleSelect = async (id: number) => {
    await selectCourse(id);
    navigate("/setup");
  };

  return (
    <Layout showNav={false} topBar={<TopBar title="Find a Course" showBack />}>
      <div className="page animate-fade-in">
        <form onSubmit={handleSearch}>
          <Input
            label="Search courses"
            placeholder="Pebble Beach, Augusta…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search size={16} />}
            autoFocus
          />
          <div style={{ marginTop: "var(--space-3)" }}>
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? "Searching…" : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-banner" style={{ marginTop: "var(--space-4)" }}>
            {error}
          </div>
        )}
        {isLoading && <Spinner label="Finding courses…" />}

        {!isLoading && results.length > 0 && (
          <div className="course-results">
            {results.map((course) => (
              <div
                key={course.id}
                className="course-result-card"
                onClick={() => handleSelect(course.id)}
              >
                <div className="course-result-name">
                  {course.course_name || course.club_name}
                </div>
                <div className="course-result-location">
                  <MapPin
                    size={11}
                    style={{ display: "inline", marginRight: 4 }}
                  />
                  {[
                    course.location.city,
                    course.location.state,
                    course.location.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                <div className="course-result-meta">
                  <span>
                    <Flag size={11} /> {course.holes} holes
                  </span>
                  <span>Par {course.par}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && results.length === 0 && query && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No courses found</div>
            <p className="empty-state-body">Try a different name or city.</p>
          </div>
        )}

        {!query && (
          <div className="empty-state">
            <div className="empty-state-icon">⛳</div>
            <div className="empty-state-title">Search for a golf course</div>
            <p className="empty-state-body">
              Data powered by GolfCourseAPI — almost 30,000 courses worldwide.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
