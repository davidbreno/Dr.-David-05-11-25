from django.http import HttpResponse

def lista(_):
    return HttpResponse("pacientes lista")

def detalhe(_, pk: int):
    return HttpResponse(f"pacientes detalhe {pk}")
