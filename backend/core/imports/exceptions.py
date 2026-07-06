class ImportException(Exception):
    """
    Exception de base pour tous les imports
    """
    default_message = "Une erreur d'import est survenue."

    def __init__(self, message=None):
        self.message = message or self.default_message
        super().__init__(self.message)


class FileFormatNotSupported(ImportException):
    default_message = "Format de fichier non supporté."


class ExcelFileError(ImportException):
    default_message = "Erreur lors de la lecture du fichier Excel."


class CSVFileError(ImportException):
    default_message = "Erreur lors de la lecture du fichier CSV."


class MissingRequiredColumn(ImportException):
    default_message = "Une ou plusieurs colonnes obligatoires sont manquantes."


class InvalidRowData(ImportException):
    default_message = "Données invalides dans une ligne du fichier."


class SynchronizationError(ImportException):
    default_message = "Erreur lors de la synchronisation avec la base de données."