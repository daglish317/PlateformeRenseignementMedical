class EmailTemplates:

    @staticmethod
    def structure_validee(nom_structure):
        return {
            "sujet": "Structure validée",
            "message": f"Votre structure {nom_structure} a été validée avec succès.",
            "html": f"<p>Votre structure <strong>{nom_structure}</strong> a été validée avec succès.</p>",
        }

    @staticmethod
    def structure_refusee(nom_structure, motif=""):
        return {
            "sujet": "Structure refusée",
            "message": f"Votre structure {nom_structure} a été refusée. Motif : {motif}",
            "html": f"<p>Votre structure <strong>{nom_structure}</strong> a été refusée.</p><p>Motif : {motif}</p>",
        }

    @staticmethod
    def bienvenue_utilisateur(nom):
        return {
            "sujet": "Bienvenue",
            "message": f"Bienvenue {nom} sur la plateforme.",
            "html": f"<p>Bienvenue <strong>{nom}</strong> sur la plateforme.</p>",
        }

    @staticmethod
    def invitation_gestionnaire(nom):
        return {
            "sujet": "Invitation gestionnaire",
            "message": (
                f"Bonjour {nom},\n\n"
                "Vous avez été invité à rejoindre la plateforme en tant que gestionnaire.\n"
                "Un code OTP à 4 chiffres vous a été envoyé par email.\n"
                "Validez ce code puis créez votre mot de passe pour activer votre compte."
            ),
            "html": (
                f"<p>Bonjour <strong>{nom}</strong>,</p>"
                "<p>Vous avez été invité à rejoindre la plateforme en tant que gestionnaire.</p>"
                "<p>Un code OTP à 4 chiffres vous a été envoyé par email.</p>"
                "<p>Validez ce code puis créez votre mot de passe pour activer votre compte.</p>"
            ),
        }
