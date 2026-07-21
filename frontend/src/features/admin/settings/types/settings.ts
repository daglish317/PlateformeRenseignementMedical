export interface AdminProfile {
  id: string;
  nom: string;
  email: string;
  photo: string | null;
  date_joined: string;
  last_login: string | null;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}
