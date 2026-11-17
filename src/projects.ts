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
  /** Código en GitHub (null si el repo es privado). */
  repo: string | null;
  /** «Cómo funciona»: pasos de lo que ve y hace quien lo abre. */
  how: string[];
  /** «Bases del proyecto»: tecnologías y decisiones técnicas. */
  basics: string[];
  floor: 'projects' | 'lab';
  order: number;
}

export const ALL_PROJECTS = manifest as Project[];
export const PROJECTS = ALL_PROJECTS.filter((p) => p.floor === 'projects');
export const EXPERIMENTS = ALL_PROJECTS.filter((p) => p.floor === 'lab');
