export interface ChatConversation {
  id: string;
  structure: {
    id: string;
    nom: string;
    type: "HOPITAL" | "PHARMACIE";
    photo: string | null;
  };
  last_message: {
    content: string;
    created_at: string;
    expediteur: { id: string; nom: string; role: string };
  } | null;
  unread_count: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  expediteur: {
    id: string;
    nom: string;
    role: string;
  };
  is_read: boolean;
}
