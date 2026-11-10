import manifest from 'virtual:projects';

export interface Project {
  slug: string;
  title: string;
  year: number | null;
  description: string;
  tags: string[];
  cover: string | null;
  /** Dirección de la demo en vivo. */
  url: string;
  floor: 'projects' | 'lab';
  order: number;
}

export const ALL_PROJECTS = manifest as Project[];
export const PROJECTS = ALL_PROJECTS.filter((p) => p.floor === 'projects');
export const EXPERIMENTS = ALL_PROJECTS.filter((p) => p.floor === 'lab');
