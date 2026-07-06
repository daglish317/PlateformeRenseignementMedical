from pathlib import Path

from .excel import ExcelReader
from .csv import CSVReader
from .parser import ExcelParser
from .validators import ImportValidator
from .synchronizer import ImportSynchronizer
from .exceptions import FileFormatNotSupported


class ImportService:
    """
    Point d'entrée unique pour tous les imports.
    (Excel ou CSV)
    """

    @staticmethod
    def importer(file_path, model, required_fields=None):
        """
        Lance un import complet :

        1. Détecte le type de fichier
        2. Lit les données
        3. Normalise
        4. Valide
        5. Synchronise avec la base
        6. Retourne un rapport
        """

        file_extension = Path(file_path).suffix.lower()

        # 1. Lecture du fichier
        if file_extension == ".xlsx":
            reader = ExcelReader(file_path).load()
            raw_data = reader.get_rows()

        elif file_extension == ".csv":
            reader = CSVReader(file_path)
            raw_data = reader.load(file_path)

        else:
            raise FileFormatNotSupported(
                f"Extension non supportée : {file_extension}"
            )

        # 2. Parsing / normalisation
        parser = ExcelParser()
        data = parser.normalize(raw_data)

        # 3. Validation
        validator = ImportValidator()
        errors = []

        required_fields = required_fields or ["nom"]

        for row in data:
            row_errors = validator.validate_row(row, required_fields)

            if row_errors:
                errors.append({
                    "row": row,
                    "errors": row_errors
                })

        # Si erreurs critiques
        if errors:
            return {
                "status": "error",
                "errors": errors,
            }

        # 4. Synchronisation DB
        synchronizer = ImportSynchronizer(model)
        result = synchronizer.sync(data)

        # 5. Rapport final
        return {
            "status": "success",
            "created": result["created"],
            "updated": result["updated"],
            "total": len(data),
        }