export interface UserAdmin {
  id: string;
  nom: string;
  email: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  favoris_count: number;
  feedbacks_count: number;
}

export interface UserFilters {
  search: string;
  statut: string;
  page: number;
  pageSize: number;
  ordering: string;
}
