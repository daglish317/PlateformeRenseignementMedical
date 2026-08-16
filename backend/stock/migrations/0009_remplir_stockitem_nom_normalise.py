from django.db import migrations

from core.utils.text import normaliser_texte


def remplir_nom_normalise(apps, schema_editor):
    StockItem = apps.get_model("stock", "StockItem")
    for item in StockItem.objects.only("pk", "nom").iterator():
        StockItem.objects.filter(pk=item.pk).update(
            nom_normalise=normaliser_texte(item.nom)
        )


def aucune_operation(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("stock", "0008_stockitem_nom_normalise"),
    ]

    operations = [
        migrations.RunPython(remplir_nom_normalise, aucune_operation),
    ]
