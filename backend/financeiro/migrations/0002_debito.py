# Generated manually by Copilot on 2025-11-06

from decimal import Decimal

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pacientes', '0001_initial'),
        ('financeiro', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Debito',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plano', models.CharField(blank=True, max_length=80)),
                ('data_vencimento', models.DateField()),
                ('dentista', models.CharField(blank=True, max_length=120)),
                ('observacao', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pendente', 'Pendente'), ('parcial', 'Parcial'), ('pago', 'Pago')], default='pendente', max_length=10)),
                ('valor_total', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('atualizado_em', models.DateTimeField(auto_now=True)),
                ('paciente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='debitos', to='pacientes.paciente')),
            ],
            options={
                'ordering': ['-data_vencimento', '-criado_em'],
            },
        ),
        migrations.CreateModel(
            name='DebitoItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('procedimento', models.CharField(max_length=150)),
                ('dentes_regiao', models.CharField(blank=True, max_length=40)),
                ('valor', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=10)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('debito', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itens', to='financeiro.debito')),
            ],
            options={
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='DebitoDocumento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('arquivo', models.FileField(upload_to='documentos/debitos/')),
                ('nome', models.CharField(blank=True, max_length=160)),
                ('criado_em', models.DateTimeField(auto_now_add=True)),
                ('debito', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documentos', to='financeiro.debito')),
            ],
            options={
                'ordering': ['-criado_em'],
            },
        ),
        migrations.AddIndex(
            model_name='debito',
            index=models.Index(fields=['paciente', 'status'], name='financeiro__pacient_9e58ca_idx'),
        ),
        migrations.AddIndex(
            model_name='debito',
            index=models.Index(fields=['data_vencimento'], name='financeiro__data_ven_f3b5f9_idx'),
        ),
    ]
