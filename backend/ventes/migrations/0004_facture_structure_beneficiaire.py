from django.db import migrations, models


def _retro_remplir_structure(apps, schema_editor):
    Facture = apps.get_model("ventes", "Facture")
    Vente = apps.get_model("ventes", "Vente")
    for facture in Facture.objects.filter(structure_id__isnull=True).iterator(
        chunk_size=500
    ):
        structure_id = (
            Vente.objects.filter(id=facture.vente_id)
            .values_list("structure_id", flat=True)
            .first()
        )
        if structure_id:
            Facture.objects.filter(id=facture.id).update(
                structure_id=structure_id
            )


def _sans_retour(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("ventes", "0003_alter_operationcaisse_cree_le_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="facture",
            name="structure",
            field=models.ForeignKey(
                null=True,
                on_delete=models.CASCADE,
                related_name="factures",
                to="structures.structure",
            ),
        ),
        migrations.AddField(
            model_name="facture",
            name="beneficiaire",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.RunPython(_retro_remplir_structure, _sans_retour),
        migrations.AlterField(
            model_name="facture",
            name="structure",
            field=models.ForeignKey(
                on_delete=models.CASCADE,
                related_name="factures",
                to="structures.structure",
            ),
        ),
    ]
