from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("feedback", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="feedback",
            name="sujet",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="feedback",
            name="categorie",
            field=models.CharField(
                choices=[
                    ("BUG", "Bug"),
                    ("SUGGESTION", "Suggestion"),
                    ("SIGNALEMENT", "Signalement"),
                    ("AUTRE", "Autre"),
                ],
                default="AUTRE",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="feedback",
            name="statut",
            field=models.CharField(
                choices=[
                    ("NON_LU", "Non lu"),
                    ("LU", "Lu"),
                    ("TRAITE", "Traité"),
                ],
                default="NON_LU",
                max_length=20,
            ),
        ),
    ]
