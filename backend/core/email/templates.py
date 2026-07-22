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
    def invitation_gestionnaire(nom, email, code, lien_activation=""):
        return {
            "sujet": "Invitation gestionnaire - Activation de votre compte",
            "message": (
                f"Bonjour {nom},\n\n"
                "Votre compte est sur le point d'être créé dans notre plateforme SantéProx.\n"
                "Attendez d'être dans votre structure puis activez la localisation sur votre appareil "
                "pour la géolocalisation de votre structure.\n\n"
                f"Votre code OTP à 4 chiffres est : {code}\n\n"
                "Rendez-vous sur la page d'inscription et entrez votre email pour activer votre compte :\n"
                f"{lien_activation}\n\n"
                "Si vous n'avez pas demandé cette création, ignorez cet email."
            ),
            "html": (
                f"""
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Activation de votre compte SantéProx</title>
<style>
  body {{ margin:0; padding:0; background-color:#f4f6f9; font-family:Arial,Helvetica,sans-serif; }}
  .container {{ max-width:560px; margin:30px auto; background:#ffffff; border-radius:8px;
                overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }}
  .header {{ background-color:#1a73e8; color:#ffffff; padding:28px 32px; }}
  .header h1 {{ margin:0; font-size:22px; font-weight:700; }}
  .body {{ padding:28px 32px; color:#333333; line-height:1.6; }}
  .body p {{ margin:0 0 14px; font-size:15px; }}
  .otp-box {{ background:#f0f4ff; border:2px dashed #1a73e8; border-radius:8px;
              text-align:center; padding:20px; margin:24px 0; }}
  .otp-code {{ font-size:36px; font-weight:700; letter-spacing:8px; color:#1a73e8; }}
  .otp-label {{ font-size:13px; color:#555; margin-bottom:8px; text-transform:uppercase; }}
  .cta {{ display:block; width:fit-content; margin:24px auto; padding:14px 36px;
          background-color:#1a73e8; color:#ffffff; text-decoration:none;
          border-radius:6px; font-size:16px; font-weight:600; text-align:center; }}
  .cta:hover {{ background-color:#1558b0; }}
  .footer {{ padding:18px 32px; background:#f9fafb; text-align:center;
             font-size:12px; color:#888888; border-top:1px solid #eee; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>SantéProx &mdash; Activation de votre compte</h1>
  </div>
  <div class="body">
    <p>Bonjour <strong>{nom}</strong>,</p>
    <p>Votre compte est sur le point d'être créé dans notre plateforme <strong>SantéProx</strong>.</p>
    <p>Attendez d'être dans votre structure puis activez la localisation sur votre appareil pour la géolocalisation de votre structure.</p>
    <p>Rendez-vous sur la page d'inscription et entrez votre email pour activer votre compte :</p>
    <div class="otp-box">
      <div class="otp-label">Votre code OTP</div>
      <div class="otp-code">{code}</div>
    </div>
    <a href="{lien_activation}" class="cta">Aller à l'inscription</a>
    <p style="font-size:13px;color:#777;">Si vous n'avez pas demandé cette création, ignorez cet email.</p>
  </div>
  <div class="footer">
    SantéProx &copy; 2025 &mdash; Cet email a été envoyé automatiquement.
  </div>
</div>
</body>
</html>"""
            ),
        }
