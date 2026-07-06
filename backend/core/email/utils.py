import re


class EmailUtils:

    @staticmethod
    def nettoyer_email(email: str) -> str:
        """
        Nettoie un email (espaces, minuscules)
        """
        if not email:
            return ""

        return email.strip().lower()

    @staticmethod
    def email_valide(email: str) -> bool:
        """
        Vérifie si un email est valide (regex simple)
        """

        pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

        return re.match(pattern, email) is not None

    @staticmethod
    def extraire_domaine(email: str) -> str:
        """
        Retourne le domaine d'un email
        exemple: test@gmail.com -> gmail.com
        """

        if "@" not in email:
            return ""

        return email.split("@")[1]

    @staticmethod
    def est_email_pro(email: str) -> bool:
        """
        Détection simple d'un email professionnel
        (utile plus tard pour structures)
        """

        domaine = EmailUtils.extraire_domaine(email)

        domaines_gratuits = [
            "gmail.com",
            "yahoo.com",
            "hotmail.com",
            "outlook.com"
        ]

        return domaine not in domaines_gratuits