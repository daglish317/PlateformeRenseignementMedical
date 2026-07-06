import csv
from .exceptions import CSVFileError


class CSVReader:
    """
    Lecture des fichiers CSV
    """

    def __init__(self, file_path, encoding="utf-8"):
        self.file_path = file_path
        self.encoding = encoding

    def load(self):
        """
        Lit le fichier CSV et retourne les données
        """

        try:
            with open(self.file_path, mode="r", encoding=self.encoding) as file:

                reader = csv.DictReader(file)

                rows = []

                for row in reader:
                    cleaned_row = {
                        key.strip().lower(): value.strip() if isinstance(value, str) else value
                        for key, value in row.items()
                    }
                    rows.append(cleaned_row)

                return rows

        except Exception as e:
            raise CSVFileError(str(e))