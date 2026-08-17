"use client";

import { useState, useCallback } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useStructureProfile } from "../hooks/useStructureProfile";
import { useUpdateStructure, useUploadPhoto, useDeletePhoto } from "../hooks/useUpdateStructure";
import { validateStructureFields } from "../validation/structure-profile.schema";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfilePhoto } from "../components/ProfilePhoto";
import { ProfileInformations } from "../components/ProfileInformations";
import { ProfileContact } from "../components/ProfileContact";
import { ProfileLocation } from "../components/ProfileLocation";
import { ProfileActions } from "../components/ProfileActions";
import { SectionCard } from "@/features/shared/dashboard/components/SectionCard";
import { PageContainer } from "@/features/shared/dashboard/components/PageContainer";

export function StructureProfilePage() {
  const { data: structure, isLoading, error } = useStructureProfile();
  const updateMutation = useUpdateStructure();
  const uploadPhotoMutation = useUploadPhoto();
  const deletePhotoMutation = useDeletePhoto();

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<{
    nom: string;
    adresse: string;
    telephone: string;
    latitude: string;
    longitude: string;
  }>({
    nom: "",
    adresse: "",
    telephone: "",
    latitude: "",
    longitude: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEdit = useCallback(() => {
    if (!structure) return;
    setEditValues({
      nom: structure.nom,
      adresse: structure.adresse,
      telephone: structure.telephone,
      latitude: structure.latitude != null ? String(structure.latitude) : "",
      longitude: structure.longitude != null ? String(structure.longitude) : "",
    });
    setErrors({});
    setIsEditing(true);
  }, [structure]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setErrors({});
  }, []);

  const handleSave = useCallback(() => {
    if (!structure) return;

    const validationErrors = validateStructureFields(editValues);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});
    updateMutation.mutate(
      {
        id: structure.id,
        payload: {
          nom: editValues.nom,
          adresse: editValues.adresse,
          telephone: editValues.telephone,
          latitude: editValues.latitude.trim() || null,
          longitude: editValues.longitude.trim() || null,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  }, [structure, editValues, updateMutation]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  const handlePhotoUpload = useCallback(
    (file: File) => {
      if (!structure) return;
      uploadPhotoMutation.mutate({ id: structure.id, file });
    },
    [structure, uploadPhotoMutation]
  );

  const handlePhotoDelete = useCallback(() => {
    if (!structure) return;
    deletePhotoMutation.mutate(structure.id);
  }, [structure, deletePhotoMutation]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (error || !structure) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="text-lg font-medium">Impossible de charger le profil</p>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Aucune structure trouvée pour votre compte."}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <ProfileHeader structure={structure} />

        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard title="Photo">
            <ProfilePhoto
              photo={structure.photo}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
            />
          </SectionCard>

          <SectionCard title="Informations">
            <ProfileInformations
              structure={
                isEditing
                  ? {
                      ...structure,
                      nom: editValues.nom,
                      adresse: editValues.adresse,
                      telephone: editValues.telephone,
                    }
                  : structure
              }
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
              errors={errors}
            />
          </SectionCard>

          <SectionCard title="Contact">
            <ProfileContact
              phone={isEditing ? editValues.telephone : structure.telephone}
              isEditing={isEditing}
              onChange={(value) => handleFieldChange("telephone", value)}
              error={errors.telephone}
            />
          </SectionCard>

          <SectionCard title="Localisation">
            <ProfileLocation
              latitude={isEditing ? editValues.latitude : structure.latitude}
              longitude={isEditing ? editValues.longitude : structure.longitude}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
              errors={errors}
            />
          </SectionCard>
        </div>

        <div className="flex justify-end">
          <ProfileActions
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={updateMutation.isPending}
          />
        </div>
      </div>
    </PageContainer>
  );
}
