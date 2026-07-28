import api from "@/lib/axios";

export interface SubmitFeedbackPayload {
  type: "PLATEFORME";
  note: number;
  commentaire?: string;
  sujet?: string;
}

export const publicFeedbackService = {
  submit: async (data: SubmitFeedbackPayload): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>("/feedback/create/", {
      type: data.type,
      note: data.note,
      commentaire: data.commentaire,
    });
    return response.data;
  },
};
