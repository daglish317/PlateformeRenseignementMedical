from django.db import transaction


class ImportSynchronizer:
    """
    Synchronise Excel avec la base de données
    """

    def __init__(self, model):
        self.model = model

    @transaction.atomic
    def sync(self, data):
        """
        Crée ou met à jour les données
        """

        created = 0
        updated = 0

        for row in data:

            nom = row.get("nom")

            if not nom:
                continue

            obj, is_created = self.model.objects.update_or_create(
                nom=nom,
                defaults={
                    key: value
                    for key, value in row.items()
                    if key != "nom"
                }
            )

            if is_created:
                created += 1
            else:
                updated += 1

        return {
            "created": created,
            "updated": updated,
        }