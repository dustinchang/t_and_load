// ---- Course / API ----

export interface CourseLocation {
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GolfCourse {
  id: number;
  club_name: string;
  course_name: string;
  location: CourseLocation;
  holes: number;
  par: number;
}

export interface HoleInfo {
  hole_number: number;
  par: number;
  handicap: number;
  yardage: {
    championship?: number;
    back?: number;
    middle?: number;
    forward?: number;
  };
}

export interface CourseDetail extends GolfCourse {
  holes_info: {
    number_of_holes: number;
    holes: HoleInfo[];
  };
}

// ---- OSM ----

export type OSMFeatureType =
  | "green"
  | "tee"
  | "fairway"
  | "bunker"
  | "water_hazard"
  | "rough"
  | "hole_path";

export interface OSMFeature {
  type: OSMFeatureType;
  holeRef?: string; // ref tag (hole number string)
  coordinates: [number, number][]; // [lat, lng] pairs
}

// ---- Players ----

export interface Player {
  id: string;
  name: string;
  handicap: number;
}

// ---- Scoring ----

export interface HoleScore {
  strokes: number;
  putts: number;
  chips: number;
  fairwayHit: "hit" | "left" | "right" | null;
  gir: boolean;
  penaltyStrokes: number;
}

export type HoleResult =
  | "eagle"
  | "birdie"
  | "par"
  | "bogey"
  | "double"
  | "triple+";

// ---- Round ----

export type TeeBox = "championship" | "back" | "middle" | "forward";

export interface Round {
  id: string;
  courseId: number;
  courseName: string;
  date: string;
  players: Player[];
  scores: Record<string, Record<number, HoleScore>>; // [playerId][holeNumber]
  currentHole: number;
  teeBox: TeeBox;
  isComplete: boolean;
  hatGameEnabled: boolean;
  holesInfo: HoleInfo[];
  hatDraws: HatDraw[];
}

// ---- Hat Game ----

export type HatEffectKind =
  | "double_own"
  | "half_own"
  | "double_other"
  | "half_other"
  | "swap_scores";

export interface HatEffect {
  kind: HatEffectKind;
  label: string;
  description: string;
  emoji: string;
  requiresTarget: boolean;
}

export interface HatDraw {
  id: string;
  playerId: string;
  holeNumber: number;
  effect: HatEffect;
  targetPlayerId?: string;
  applied: boolean;
  timestamp: string;
}

// ---- GPS ----

export interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}
