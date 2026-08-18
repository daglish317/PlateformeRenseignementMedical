from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("structures", "0008_role_texte_libre"),
    ]

    operations = [
        migrations.AlterField(
            model_name="structure",
            name="statut",
            field=models.CharField(
                choices=[
                    ("EN_ATTENTE", "En attente"),
                    ("ACTIVE", "Active"),
                    ("SUSPENDUE", "Suspendue"),
                    ("REFUSEE", "Refusée"),
                ],
                db_index=True,
                default="EN_ATTENTE",
                max_length=20,
            ),
        ),
    ]
