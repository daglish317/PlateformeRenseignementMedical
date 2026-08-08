"""Génération du reçu PDF d'une vente payée (module Caisse)."""

from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from .models import LigneVente


def _ligne_texte(texte, taille=10, gras=False):
    style = ParagraphStyle(
        name=f"txt{taille}{'b' if gras else ''}",
        fontSize=taille,
        leading=taille + 3,
        spaceAfter=2,
        fontName="Helvetica-Bold" if gras else "Helvetica",
    )
    return Paragraph(texte, style)


def generer_reçu_pdf(vente):
    """Retourne les octets du reçu PDF de la vente payée.

    Contenu conforme à la spécification du module Caisse : numéro du reçu,
    numéro de vente, date, heure, pharmacie, adresse, téléphone, tableau des
    produits (désignation, prix unitaire, quantité, montant), sous-total,
    total à payer, mode de paiement et remerciement.
    """
    facture = vente.facture
    paiement = vente.paiement
    structure = vente.structure

    titre = ParagraphStyle(
        name="Titre",
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        spaceAfter=2,
        alignment=1,
    )
    sous_titre = ParagraphStyle(
        name="SousTitre",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        spaceAfter=2,
        alignment=1,
    )

    styles = getSampleStyleSheet()

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title=f"Reçu {facture.numero}",
    )

    elements = []

    elements.append(Paragraph(structure.nom or "Pharmacie", titre))
    elements.append(Paragraph(
        (structure.adresse or "") + " — " + (structure.telephone or ""),
        sous_titre,
    ))
    elements.append(Spacer(1, 6 * mm))

    infos = Table(
        [
            ["Reçu n°", facture.numero],
            ["Vente n°", vente.numero],
            ["Date", f"{vente.validee_le:%d/%m/%Y}" if vente.validee_le else ""],
            ["Heure", f"{vente.validee_le:%H:%M}" if vente.validee_le else ""],
        ],
        colWidths=[35 * mm, None],
    )
    infos.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    elements.append(infos)
    elements.append(Spacer(1, 6 * mm))

    lignes = list(
        LigneVente.objects.filter(vente=vente).order_by("id")
    )

    data = [["Désignation", "Prix unitaire", "Quantité", "Montant"]]
    for ligne in lignes:
        data.append([
            ligne.designation,
            f"{ligne.prix_unitaire:,.2f}",
            str(ligne.quantite),
            f"{ligne.montant:,.2f}",
        ])

    tableau = Table(
        data,
        colWidths=[None, 30 * mm, 22 * mm, 30 * mm],
        repeatRows=1,
    )
    tableau.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(tableau)
    elements.append(Spacer(1, 6 * mm))

    sous_total = Table(
        [["Sous-total", f"{vente.montant_total:,.2f}"]],
        colWidths=[None, 30 * mm],
    )
    sous_total.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, 0), "Helvetica"),
        ("FONTNAME", (1, 0), (1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
    ]))
    elements.append(sous_total)

    total = Table(
        [["Total à payer", f"{vente.montant_total:,.2f}"]],
        colWidths=[None, 30 * mm],
    )
    total.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 13),
        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
        ("LINEABOVE", (0, 0), (-1, 0), 0.6, colors.HexColor("#334155")),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(total)
    elements.append(Spacer(1, 4 * mm))

    if paiement:
        mode_ligne = Table(
            [["Mode de paiement", paiement.get_mode_display()]],
            colWidths=[None, None],
        )
        mode_ligne.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, 0), "Helvetica"),
            ("FONTNAME", (1, 0), (1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
        ]))
        elements.append(mode_ligne)
        elements.append(Spacer(1, 6 * mm))

    elements.append(Paragraph(
        "Merci de votre visite.",
        styles["Normal"],
    ))
    elements.append(Spacer(1, 12 * mm))

    tracabilite = _ligne_texte(
        f"Préparée par : {vente.prepare_par.nom}"
        f"   ·   Encaissée par : {paiement.encaisse_par.nom if paiement else '—'}",
        taille=8,
    )
    elements.append(tracabilite)

    doc.build(elements)
    return buffer.getvalue()
