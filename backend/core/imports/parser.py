class ExcelParser:
    """
    Normalise les données Excel
    """

    COLUMN_ALIASES = {
        "nom": ["nom", "name", "titre", "libelle"],
        "description": ["description", "desc", "details"],
        "type": ["type", "categorie", "category"],
    }

    def normalize(self, rows):
        """
        Transforme les clés des colonnes en format standard
        """

        normalized = []

        for row in rows:
            clean_row = {}

            for key, value in row.items():

                normalized_key = self._find_standard_key(key)

                if normalized_key:
                    clean_row[normalized_key] = value

            normalized.append(clean_row)

        return normalized

    def _find_standard_key(self, key):
        key = str(key).strip().lower()

        for standard_key, aliases in self.COLUMN_ALIASES.items():
            if key == standard_key or key in aliases:
                return standard_key

        return key