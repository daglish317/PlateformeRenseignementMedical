class ImportValidator:
    """
    Validation simple des lignes importées
    """

    @staticmethod
    def validate_row(row, required_fields):
        """
        Vérifie que les champs obligatoires existent
        """

        errors = []

        for field in required_fields:
            if field not in row or row[field] is None:
                errors.append(f"Champ manquant : {field}")

        return errors