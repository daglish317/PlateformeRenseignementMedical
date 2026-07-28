"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSubmitFeedback } from "../hooks/useSubmitFeedback";
import type { SubmitFeedbackPayload } from "../api/public-feedback.service";

const categories = [
  { value: "BUG", label: "Bug" },
  { value: "SUGGESTION", label: "Suggestion" },
  { value: "SIGNALEMENT", label: "Signalement" },
  { value: "AUTRE", label: "Autre" },
];

export function PublicFeedbackForm() {
  const { mutate, isPending } = useSubmitFeedback();
  const [note, setNote] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (note === 0) {
      setError("Veuillez donner une note.");
      return;
    }
    if (!commentaire.trim()) {
      setError("Veuillez écrire un commentaire.");
      return;
    }

    const payload: SubmitFeedbackPayload = {
      type: "PLATEFORME",
      note,
      commentaire: commentaire.trim(),
    };

    mutate(payload, {
      onSuccess: () => {
        setSubmitted(true);
      },
    });
  }

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h3 className="text-xl font-semibold">Merci pour votre avis !</h3>
          <p className="text-muted-foreground">
            Votre retour nous aide à améliorer SantéProx.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setNote(0);
              setCommentaire("");
            }}
          >
            Laisser un autre avis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Laisser un avis sur SantéProx</CardTitle>
        <CardDescription>
          Votre retour nous aide à améliorer la plateforme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Note *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-0.5 transition-colors"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setNote(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredStar || note)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {note > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {note}/5
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commentaire">Votre avis *</Label>
            <Textarea
              id="commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Partagez votre expérience avec SantéProx..."
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isPending} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {isPending ? "Envoi..." : "Envoyer mon avis"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
