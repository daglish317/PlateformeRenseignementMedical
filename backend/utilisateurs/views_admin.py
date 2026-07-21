from datetime import timedelta
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Utilisateur, RoleUtilisateur, TypeAuthentification
from .serializers import UtilisateurSerializer
from .decorators import admin_required
from .services.auth_service import AuthService
from .services.invitation_service import InvitationService
from core.verification.service import VerificationService

from structures.models import Structure, TypeStructure, StatutStructure
from structures.serializers import StructureDetailSerializer
from feedback.models import Feedback, TypeFeedback
from messagerie.models import Message, Conversation
from search.models import SearchLog


def _paginate(queryset, request, default_page_size=20):
    page = max(int(request.query_params.get("page", 1)), 1)
    page_size = min(int(request.query_params.get("page_size", default_page_size)), 100)
    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    return queryset[start:end], {"page": page, "page_size": page_size, "total": total}


class RegisterAdminView(APIView):

    def post(self, request):
        nom = request.data.get("nom", "").strip()
        email = request.data.get("email", "").lower().strip()
        password = request.data.get("password", "")

        if not nom or not email or not password:
            return Response({"detail": "Nom, email et mot de passe requis."}, status=400)
        if len(password) < 8:
            return Response({"detail": "Mot de passe trop court (min 8)."}, status=400)
        if Utilisateur.objects.filter(email=email).exists():
            return Response({"detail": "Cette adresse email est déjà utilisée."}, status=400)

        user = Utilisateur.objects.create_user(
            nom=nom,
            email=email,
            password=password,
            role=RoleUtilisateur.ADMINISTRATEUR,
            type_authentification=TypeAuthentification.EMAIL,
            email_verifie=True,
            is_staff=True,
        )

        return Response(
            {
                "user": UtilisateurSerializer(user).data,
                "tokens": AuthService.get_tokens_for_user(user),
            },
            status=201,
        )


class AdminDashboardView(APIView):

    @admin_required
    def get(self, request):
        structures = Structure.objects.filter(est_supprimee=False)
        gestionnaires = Utilisateur.objects.filter(role=RoleUtilisateur.GESTIONNAIRE)
        patients = Utilisateur.objects.filter(role=RoleUtilisateur.PATIENT)

        feedbacks_non_lus = Feedback.objects.filter(
            type=TypeFeedback.PLATEFORME,
            statut="NON_LU",
        ).count()

        messages_non_lus = Message.objects.filter(is_read=False).exclude(
            expediteur__role=RoleUtilisateur.ADMINISTRATEUR
        ).count()

        pending = structures.filter(statut=StatutStructure.EN_ATTENTE).order_by("-date_creation")[:10]
        pending_data = StructureDetailSerializer(pending, many=True).data

        recent_activity = []
        for s in structures.order_by("-date_creation")[:5]:
            recent_activity.append({
                "type": "structure_created",
                "label": f"Nouvelle structure : {s.nom}",
                "date": s.date_creation.isoformat(),
            })
        for u in patients.order_by("-date_joined")[:3]:
            recent_activity.append({
                "type": "user_created",
                "label": f"Nouvel utilisateur : {u.nom}",
                "date": u.date_joined.isoformat(),
            })
        recent_activity.sort(key=lambda x: x["date"], reverse=True)

        now = timezone.now()
        months = []
        for i in range(5, -1, -1):
            start = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            end = start + timedelta(days=32)
            end = end.replace(day=1)
            count = patients.filter(date_joined__gte=start, date_joined__lt=end).count()
            months.append({"month": start.strftime("%Y-%m"), "count": count})

        return Response({
            "stats": {
                "structures_total": structures.count(),
                "hopitaux": structures.filter(type=TypeStructure.HOPITAL).count(),
                "pharmacies": structures.filter(type=TypeStructure.PHARMACIE).count(),
                "structures_en_attente": structures.filter(statut=StatutStructure.EN_ATTENTE).count(),
                "gestionnaires": gestionnaires.count(),
                "utilisateurs_publics": patients.count(),
                "feedbacks_non_lus": feedbacks_non_lus,
                "messages_non_lus": messages_non_lus,
            },
            "pending_structures": pending_data,
            "recent_activity": recent_activity[:15],
            "charts": {
                "inscriptions_par_mois": months,
                "validations": [
                    {"month": m["month"], "count": structures.filter(
                        statut=StatutStructure.ACTIVE,
                        date_validation__year=int(m["month"][:4]),
                        date_validation__month=int(m["month"][5:7]),
                    ).count()} for m in months
                ],
                "recherches": [
                    {"month": m["month"], "count": SearchLog.objects.filter(
                        created_at__year=int(m["month"][:4]),
                        created_at__month=int(m["month"][5:7]),
                    ).count()} for m in months
                ],
                "repartition_types": {
                    "hopital": structures.filter(type=TypeStructure.HOPITAL).count(),
                    "pharmacie": structures.filter(type=TypeStructure.PHARMACIE).count(),
                },
            },
            "map_structures": list(
                structures.filter(
                    latitude__isnull=False,
                    longitude__isnull=False,
                ).values(
                    "id", "nom", "type", "photo", "adresse", "telephone",
                    "latitude", "longitude", "statut",
                )
            ),
        })


class AdminUsersListView(APIView):

    @admin_required
    def get(self, request):
        qs = Utilisateur.objects.filter(role=RoleUtilisateur.PATIENT)

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(nom__icontains=search) | Q(email__icontains=search))

        statut = request.query_params.get("statut")
        if statut == "actif":
            qs = qs.filter(is_active=True)
        elif statut == "suspendu":
            qs = qs.filter(is_active=False)

        ordering = request.query_params.get("ordering", "-date_joined")
        qs = qs.order_by(ordering)

        page_items, pagination = _paginate(qs, request)

        data = []
        for u in page_items:
            data.append({
                "id": str(u.id),
                "nom": u.nom,
                "email": u.email,
                "is_active": u.is_active,
                "date_joined": u.date_joined.isoformat(),
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "favoris_count": u.favoris.count(),
                "feedbacks_count": u.feedbacks.count(),
            })

        return Response({"results": data, **pagination})


class AdminUserDetailView(APIView):

    @admin_required
    def get(self, request, pk):
        try:
            u = Utilisateur.objects.get(id=pk, role=RoleUtilisateur.PATIENT)
        except Utilisateur.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=404)

        return Response({
            "id": str(u.id),
            "nom": u.nom,
            "email": u.email,
            "is_active": u.is_active,
            "date_joined": u.date_joined.isoformat(),
            "last_login": u.last_login.isoformat() if u.last_login else None,
            "favoris_count": u.favoris.count(),
            "feedbacks_count": u.feedbacks.count(),
        })

    @admin_required
    def patch(self, request, pk):
        try:
            u = Utilisateur.objects.get(id=pk, role=RoleUtilisateur.PATIENT)
        except Utilisateur.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=404)

        action = request.data.get("action")
        if action == "suspend":
            u.is_active = False
            u.save(update_fields=["is_active"])
            return Response({"message": "Utilisateur suspendu"})
        if action == "reactivate":
            u.is_active = True
            u.save(update_fields=["is_active"])
            return Response({"message": "Utilisateur réactivé"})
        if action == "delete":
            u.is_active = False
            u.email = f"deleted_{u.id}_{u.email}"
            u.save(update_fields=["is_active", "email"])
            return Response({"message": "Utilisateur supprimé (logique)"})

        return Response({"detail": "Action invalide"}, status=400)


class AdminManagersListView(APIView):

    @admin_required
    def get(self, request):
        qs = Utilisateur.objects.filter(role=RoleUtilisateur.GESTIONNAIRE).select_related("structure")

        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(nom__icontains=search)
                | Q(email__icontains=search)
                | Q(structure__nom__icontains=search)
            )

        statut = request.query_params.get("statut")
        if statut == "actif":
            qs = qs.filter(is_active=True)
        elif statut == "suspendu":
            qs = qs.filter(is_active=False)

        type_structure = request.query_params.get("type_structure")
        if type_structure == "HOPITAL":
            qs = qs.filter(structure__type=TypeStructure.HOPITAL)
        elif type_structure == "PHARMACIE":
            qs = qs.filter(structure__type=TypeStructure.PHARMACIE)

        qs = qs.order_by(request.query_params.get("ordering", "-date_joined"))
        page_items, pagination = _paginate(qs, request)

        data = []
        for m in page_items:
            structure = getattr(m, "structure", None)
            data.append({
                "id": str(m.id),
                "nom": m.nom,
                "email": m.email,
                "is_active": m.is_active,
                "date_joined": m.date_joined.isoformat(),
                "last_login": m.last_login.isoformat() if m.last_login else None,
                "structure": {
                    "id": str(structure.id),
                    "nom": structure.nom,
                    "type": structure.type,
                } if structure else None,
            })

        return Response({"results": data, **pagination})

    @admin_required
    def post(self, request):
        nom = request.data.get("nom", "").strip()
        email = request.data.get("email", "").lower().strip()
        if not nom or not email:
            return Response({"detail": "Nom et email requis."}, status=400)
        try:
            gestionnaire = InvitationService.inviter_gestionnaire(nom=nom, email=email)
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)
        return Response(
            {"message": "Invitation envoyée", "data": UtilisateurSerializer(gestionnaire).data},
            status=201,
        )


class AdminManagerDetailView(APIView):

    @admin_required
    def get(self, request, pk):
        try:
            m = Utilisateur.objects.select_related("structure").get(
                id=pk, role=RoleUtilisateur.GESTIONNAIRE
            )
        except Utilisateur.DoesNotExist:
            return Response({"detail": "Gestionnaire introuvable"}, status=404)

        structure = getattr(m, "structure", None)
        return Response({
            "id": str(m.id),
            "nom": m.nom,
            "email": m.email,
            "is_active": m.is_active,
            "date_joined": m.date_joined.isoformat(),
            "last_login": m.last_login.isoformat() if m.last_login else None,
            "structure": {
                "id": str(structure.id),
                "nom": structure.nom,
                "type": structure.type,
                "statut": structure.statut,
            } if structure else None,
        })

    @admin_required
    def patch(self, request, pk):
        try:
            m = Utilisateur.objects.get(id=pk, role=RoleUtilisateur.GESTIONNAIRE)
        except Utilisateur.DoesNotExist:
            return Response({"detail": "Gestionnaire introuvable"}, status=404)

        action = request.data.get("action")
        if action == "suspend":
            m.is_active = False
            m.save(update_fields=["is_active"])
            return Response({"message": "Gestionnaire suspendu"})
        if action == "reactivate":
            m.is_active = True
            m.save(update_fields=["is_active"])
            return Response({"message": "Gestionnaire réactivé"})
        if action == "reset_password":
            VerificationService.generate(email=m.email)
            return Response({"message": "Nouveau mot de passe envoyé par email"})

        return Response({"detail": "Action invalide"}, status=400)


class AdminStatisticsView(APIView):

    @admin_required
    def get(self, request):
        period = request.query_params.get("period", "30d")
        now = timezone.now()

        if period == "today":
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "7d":
            start = now - timedelta(days=7)
        elif period == "12m":
            start = now - timedelta(days=365)
        else:
            start = now - timedelta(days=30)

        structures = Structure.objects.filter(est_supprimee=False)
        searches = SearchLog.objects.filter(created_at__gte=start)

        top_searches = (
            searches.values("query")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )

        return Response({
            "period": period,
            "cards": {
                "recherches_total": searches.count(),
                "utilisateurs_inscrits": Utilisateur.objects.filter(
                    role=RoleUtilisateur.PATIENT, date_joined__gte=start
                ).count(),
                "gestionnaires": Utilisateur.objects.filter(role=RoleUtilisateur.GESTIONNAIRE).count(),
                "structures": structures.count(),
                "hopitaux": structures.filter(type=TypeStructure.HOPITAL).count(),
                "pharmacies": structures.filter(type=TypeStructure.PHARMACIE).count(),
                "feedbacks": Feedback.objects.filter(created_at__gte=start).count(),
                "messages": Message.objects.filter(created_at__gte=start).count(),
            },
            "top_searches": list(top_searches),
            "popular_structures": list(
                structures.filter(statut=StatutStructure.ACTIVE)
                .annotate(favoris_count=Count("favoris"))
                .order_by("-favoris_count")[:10]
                .values("id", "nom", "type", "favoris_count")
            ),
            "charts": {
                "recherches_par_jour": [],
                "inscriptions": [],
                "validations": [],
            },
        })
