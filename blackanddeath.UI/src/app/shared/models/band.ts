import { Country } from './country';
import { Genre } from './genre';

export interface Band {
  id: number;
  logoUrl: string | null;
  name: string;
  countries: Country[];
  genres: Genre[];
  formedYear: number;
}
