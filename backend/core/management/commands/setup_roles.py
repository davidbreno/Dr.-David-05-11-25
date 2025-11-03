from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission

APP_MODELS = {
    "pacientes": ["paciente"],
    "orcamentos": ["orcamento"],
    "odontograma": ["odontograma"],
    "financeiro": ["lancamento"],
    "estoque": ["produto"],
}
ACTIONS = ["view", "add", "change", "delete"]

def find_perm(app, act, model):
    code = f"{act}_{model}"
    return Permission.objects.filter(codename=code, content_type__app_label=app).first()

class Command(BaseCommand):
    help = "Cria grupos padrão e atribui permissões por app"

    def handle(self, *args, **kwargs):
        profiles = {
            "Admin": {app: ACTIONS for app in APP_MODELS},
            "Dentista": {
                "pacientes": ["view", "change"],
                "odontograma": ["view", "add", "change"],
                "orcamentos": ["view", "add", "change"],
            },
            "Recepcao": {
                "pacientes": ["view", "add", "change"],
                "orcamentos": ["view", "add"],
                "financeiro": ["view"],
            },
            "Financeiro": {
                "financeiro": ACTIONS,
                "pacientes": ["view"],
                "orcamentos": ["view"],
            },
            "Estoque": {"estoque": ACTIONS},
        }

        for name, mapping in profiles.items():
            group, _ = Group.objects.get_or_create(name=name)
            perms = []
            for app, acts in mapping.items():
                for model in APP_MODELS[app]:
                    for act in acts:
                        p = find_perm(app, act, model)
                        if p:
                            perms.append(p)
            group.permissions.set(perms)
            self.stdout.write(self.style.SUCCESS(f"{name}: {len(perms)} permissões"))
        self.stdout.write(self.style.SUCCESS("Grupos configurados."))
