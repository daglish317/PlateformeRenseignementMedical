"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildWhatsAppLink } from "../constants";

const typesProjet = [
  "Création de site web",
  "Application web",
  "Application mobile",
  "Refonte ou amélioration",
  "Maintenance technique",
  "Autre",
];

interface FormState {
  nom: string;
  email: string;
  typeProjet: string;
  message: string;
}

const initialState: FormState = {
  nom: "",
  email: "",
  typeProjet: "",
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.nom.trim()) {
      setError("Veuillez indiquer votre nom.");
      return;
    }
    if (!form.typeProjet) {
      setError("Veuillez choisir le type de projet.");
      return;
    }
    if (!form.message.trim()) {
      setError("Veuillez décrire votre projet.");
      return;
    }

    const texte = [
      "Bonjour, je vous contacte via SantéProx.",
      "",
      `Nom : ${form.nom.trim()}`,
      form.email.trim() ? `Email : ${form.email.trim()}` : "",
      `Type de projet : ${form.typeProjet}`,
      "",
      "Description du projet :",
      form.message.trim(),
    ]
      .filter((ligne) => ligne !== "")
      .join("\n");

    window.open(buildWhatsAppLink(texte), "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl font-semibold">Votre message est prêt !</h3>
          <p className="text-muted-foreground">
            WhatsApp s&apos;est ouvert avec votre message pré-rempli. Il vous
            suffit d&apos;appuyer sur Envoyer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={() =>
                window.open(
                  buildWhatsAppLink([
                    "Bonjour, je vous contacte via SantéProx.",
                    "",
                    `Nom : ${form.nom.trim()}`,
                    form.email.trim() ? `Email : ${form.email.trim()}` : "",
                    `Type de projet : ${form.typeProjet}`,
                    "",
                    "Description du projet :",
                    form.message.trim(),
                  ].join("\n")),
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Rouvrir WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm(initialState);
              }}
            >
              Modifier mon message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Demander un service de développement</CardTitle>
        <CardDescription>
          Remplissez le formulaire : votre message s&apos;ouvrira directement
          dans ma discussion WhatsApp.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => update("nom", e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="vous@exemple.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="typeProjet">Type de projet *</Label>
            <Select
              id="typeProjet"
              value={form.typeProjet}
              onChange={(e) => update("typeProjet", e.target.value)}
            >
              <option value="">Choisir un type...</option>
              {typesProjet.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Description du projet *</Label>
            <Textarea
              id="message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              placeholder="Décrivez votre besoin : objectif, fonctionnalités, délais..."
              rows={5}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Envoyer via WhatsApp
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            En cliquant, WhatsApp s&apos;ouvre avec votre message pré-rempli.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
