export interface ChatConversation {
  id: string;
  structure: {
    id: string;
    nom: string;
    type: "HOPITAL" | "PHARMACIE";
    photo: string | null;
  } | null;
  structure_nom: string | null;
  structure_type: string | null;
  structure_photo: string | null;
  dernier_message: {
    contenu: string;
    expediteur_nom: string;
    created_at: string;
  } | null;
  messages_non_lus: number;
}

export interface ChatMessage {
  id: string;
  contenu: string;
  created_at: string;
  expediteur: {
    id: string;
    nom: string;
    role: string;
  };
  is_read: boolean;
}
