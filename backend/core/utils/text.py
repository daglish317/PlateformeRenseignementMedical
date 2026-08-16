"""Normalisation de texte pour la recherche (spec moteurRecherche.md §4-5)."""
import re
import unicodedata


def normaliser_texte(texte):
    """
    Normalise un texte pour la recherche :
      - suppression des accents ;
      - minuscules ;
      - suppression des caractères spéciaux ;
      - suppression des espaces multiples.

    Deux saisies telles que "PARACETAMOL" et "Paracétamol" deviennent
    équivalentes après normalisation.
    """
    if not texte:
        return ""

    texte = unicodedata.normalize("NFD", texte)
    texte = "".join(c for c in texte if unicodedata.category(c) != "Mn")
    texte = texte.lower()
    texte = re.sub(r"[^a-z0-9\s-]", " ", texte)
    texte = " ".join(texte.split())
    return texte.strip()
