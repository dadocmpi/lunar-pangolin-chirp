#!/usr/bin/env python3
"""Insert the paymentCard + operatorPayments namespaces into every locale.

Usage: python3 scripts/_add-payment-lifecycle-i18n.py

Idempotent: a locale that already has `paymentCard: {` is skipped.
The block is inserted immediately before the final `errorBoundary:` namespace.
"""
import json
import re
import sys
from pathlib import Path

PATH = Path(__file__).resolve().parent.parent / "src" / "i18n.ts"
LOCALE_ORDER = ["en", "pt", "it", "es", "fr", "de", "ru", "zh", "ja", "ar", "he"]

STATUS_KEYS = [
    "created", "pending", "processing", "manual_review", "confirmed",
    "activation_pending", "active", "failed", "expired", "cancelled",
    "refunded", "disputed", "past_due", "suspended", "disconnected",
]
ACTION_KEYS = [
    "complete_payment", "await_confirmation", "await_manual_review",
    "await_activation", "connect_provider", "update_payment_method",
    "restart_checkout", "contact_support", "none",
]
OP_ACTIONS = [
    "approve_payment", "reject_payment", "request_info", "activate",
    "suspend", "disconnect", "reinstate",
]
OP_ERRORS = [
    "load_failed", "action_failed", "forbidden", "unauthorized",
    "note_required", "invalid_transition",
]


def card(**kw):
    """Build a paymentCard namespace from flat kwargs + nested dicts."""
    out = {
        "navLabel": kw["navLabel"],
        "title": kw["title"],
        "loading": kw["loading"],
        "noPayments": kw["noPayments"],
        "noPaymentsHint": kw["noPaymentsHint"],
        "viewPlans": kw["viewPlans"],
        "plan": kw["plan"],
        "planFallback": kw["planFallback"],
        "reference": kw["reference"],
        "amount": kw["amount"],
        "method": kw["method"],
        "currentStatus": kw["currentStatus"],
        "activationStatus": kw["activationStatus"],
        "created": kw["created"],
        "updated": kw["updated"],
        "nextAction": kw["nextAction"],
        "expiresIn": kw["expiresIn"],
        "activationActive": kw["activationActive"],
        "accountId": kw["accountId"],
        "activationDate": kw["activationDate"],
        "nextStepsTitle": kw["nextStepsTitle"],
        "openDashboard": kw["openDashboard"],
        "serverTruthNote": kw["serverTruthNote"],
        "methods": dict(zip(["card", "crypto", "bank", "unknown"], kw["methods"])),
        "statuses": dict(zip(STATUS_KEYS, kw["statuses"])),
        "nextActions": dict(zip(ACTION_KEYS, kw["nextActions"])),
        "nextSteps": dict(zip(["dashboard", "provider", "eligibility"], kw["nextSteps"])),
    }
    return out


def operator(**kw):
    return {
        "title": kw["title"],
        "subtitle": kw["subtitle"],
        "refresh": kw["refresh"],
        "filterStatus": kw["filterStatus"],
        "allStatuses": kw["allStatuses"],
        "noRows": kw["noRows"],
        "customer": kw["customer"],
        "customerEmail": kw["customerEmail"],
        "open": kw["open"],
        "close": kw["close"],
        "detailTitle": kw["detailTitle"],
        "note": kw["note"],
        "notePlaceholder": kw["notePlaceholder"],
        "actionDone": kw["actionDone"],
        "audit": kw["audit"],
        "auditEmpty": kw["auditEmpty"],
        "actions": dict(zip(OP_ACTIONS, kw["actions"])),
        "errors": dict(zip(OP_ERRORS, kw["errors"])),
    }


T = {}

T["en"] = {
    "paymentCard": card(
        navLabel="Payments", title="Payment status", loading="Loading payment status",
        noPayments="No payment yet",
        noPaymentsHint="When you start a checkout, its progress and activation status will appear here.",
        viewPlans="View plans", plan="Plan", planFallback="Your plan",
        reference="Payment reference", amount="Amount", method="Payment method",
        currentStatus="Current status", activationStatus="Activation status",
        created="Created", updated="Last updated", nextAction="Next action",
        expiresIn="Expires in {{time}}", activationActive="Account active",
        accountId="Braxel account ID", activationDate="Activation date",
        nextStepsTitle="Next steps", openDashboard="Open dashboard",
        serverTruthNote="Status is confirmed by our server. A browser redirect or button never activates your account.",
        methods=["Card", "Crypto", "Bank transfer", "—"],
        statuses=[
            "Created", "Pending", "Processing", "Manual review", "Confirmed",
            "Activation pending", "Active", "Failed", "Expired", "Cancelled",
            "Refunded", "Disputed", "Past due", "Suspended", "Disconnected",
        ],
        nextActions=[
            "Complete the payment", "Awaiting confirmation", "Awaiting manual review",
            "Awaiting activation", "Connect your provider account",
            "Update your payment method", "Start a new checkout",
            "Contact support", "No action needed",
        ],
        nextSteps=[
            "Review your plan and account status in the dashboard.",
            "Connect your external provider account when you are ready.",
            "Provider eligibility is confirmed by the provider; until then the connection shows as pending eligibility.",
        ],
    ),
    "operatorPayments": operator(
        title="Payments & activations",
        subtitle="Review payments, confirm manual transfers and manage activations.",
        refresh="Refresh", filterStatus="Filter by status", allStatuses="All statuses",
        noRows="No payments found.", customer="Customer", customerEmail="Customer email",
        open="Open", close="Close", detailTitle="Payment detail",
        note="Operator note",
        notePlaceholder="Note shown to the customer (required to reject, request info, suspend or disconnect).",
        actionDone="Action completed.", audit="Audit events",
        auditEmpty="No audit events yet.",
        actions=[
            "Approve payment", "Reject payment", "Request more information",
            "Activate account", "Suspend", "Disconnect", "Reinstate",
        ],
        errors=[
            "Could not load payments.", "The action failed. Try again.",
            "You are not authorized to review payments.", "Please sign in again.",
            "A note is required for this action.",
            "This action is not allowed for the current status.",
        ],
    ),
}

T["pt"] = {
    "paymentCard": card(
        navLabel="Pagamentos", title="Estado do pagamento",
        loading="A carregar o estado do pagamento", noPayments="Ainda sem pagamentos",
        noPaymentsHint="Quando iniciar um checkout, o progresso e o estado de ativação aparecem aqui.",
        viewPlans="Ver planos", plan="Plano", planFallback="O seu plano",
        reference="Referência do pagamento", amount="Valor", method="Método de pagamento",
        currentStatus="Estado atual", activationStatus="Estado de ativação",
        created="Criado", updated="Última atualização", nextAction="Próxima ação",
        expiresIn="Expira em {{time}}", activationActive="Conta ativa",
        accountId="ID da conta Braxel", activationDate="Data de ativação",
        nextStepsTitle="Próximos passos", openDashboard="Abrir painel",
        serverTruthNote="O estado é confirmado pelo nosso servidor. Um redirecionamento ou botão no navegador nunca ativa a sua conta.",
        methods=["Cartão", "Cripto", "Transferência bancária", "—"],
        statuses=[
            "Criado", "Pendente", "Em processamento", "Revisão manual", "Confirmado",
            "Ativação pendente", "Ativo", "Falhou", "Expirado", "Cancelado",
            "Reembolsado", "Em disputa", "Em atraso", "Suspenso", "Desligado",
        ],
        nextActions=[
            "Concluir o pagamento", "A aguardar confirmação", "A aguardar revisão manual",
            "A aguardar ativação", "Ligar a conta do fornecedor",
            "Atualizar o método de pagamento", "Iniciar um novo checkout",
            "Contactar o suporte", "Nenhuma ação necessária",
        ],
        nextSteps=[
            "Reveja o seu plano e o estado da conta no painel.",
            "Ligue a sua conta externa do fornecedor quando estiver pronto.",
            "A elegibilidade é confirmada pelo fornecedor; até lá a ligação aparece como pendente de elegibilidade.",
        ],
    ),
    "operatorPayments": operator(
        title="Pagamentos e ativações",
        subtitle="Reveja pagamentos, confirme transferências manuais e gerencie ativações.",
        refresh="Atualizar", filterStatus="Filtrar por estado", allStatuses="Todos os estados",
        noRows="Nenhum pagamento encontrado.", customer="Cliente", customerEmail="Email do cliente",
        open="Abrir", close="Fechar", detailTitle="Detalhe do pagamento",
        note="Nota do operador",
        notePlaceholder="Nota mostrada ao cliente (obrigatória para rejeitar, pedir informação, suspender ou desligar).",
        actionDone="Ação concluída.", audit="Eventos de auditoria",
        auditEmpty="Ainda sem eventos de auditoria.",
        actions=[
            "Aprovar pagamento", "Rejeitar pagamento", "Pedir mais informação",
            "Ativar conta", "Suspender", "Desligar", "Reativar",
        ],
        errors=[
            "Não foi possível carregar os pagamentos.", "A ação falhou. Tente novamente.",
            "Não está autorizado a rever pagamentos.", "Inicie sessão novamente.",
            "É necessária uma nota para esta ação.",
            "Esta ação não é permitida para o estado atual.",
        ],
    ),
}

T["it"] = {
    "paymentCard": card(
        navLabel="Pagamenti", title="Stato del pagamento",
        loading="Caricamento dello stato del pagamento", noPayments="Nessun pagamento",
        noPaymentsHint="Quando avvii un checkout, l'avanzamento e lo stato di attivazione compaiono qui.",
        viewPlans="Vedi i piani", plan="Piano", planFallback="Il tuo piano",
        reference="Riferimento del pagamento", amount="Importo", method="Metodo di pagamento",
        currentStatus="Stato attuale", activationStatus="Stato di attivazione",
        created="Creato", updated="Ultimo aggiornamento", nextAction="Prossima azione",
        expiresIn="Scade tra {{time}}", activationActive="Account attivo",
        accountId="ID account Braxel", activationDate="Data di attivazione",
        nextStepsTitle="Prossimi passi", openDashboard="Apri la dashboard",
        serverTruthNote="Lo stato è confermato dal nostro server. Un reindirizzamento o un pulsante nel browser non attiva mai il tuo account.",
        methods=["Carta", "Cripto", "Bonifico bancario", "—"],
        statuses=[
            "Creato", "In attesa", "In elaborazione", "Revisione manuale", "Confermato",
            "Attivazione in attesa", "Attivo", "Non riuscito", "Scaduto", "Annullato",
            "Rimborsato", "Contestato", "Scaduto (insoluto)", "Sospeso", "Disconnesso",
        ],
        nextActions=[
            "Completa il pagamento", "In attesa di conferma", "In attesa di revisione manuale",
            "In attesa di attivazione", "Collega l'account del provider",
            "Aggiorna il metodo di pagamento", "Avvia un nuovo checkout",
            "Contatta l'assistenza", "Nessuna azione necessaria",
        ],
        nextSteps=[
            "Controlla il piano e lo stato dell'account nella dashboard.",
            "Collega il tuo account esterno del provider quando sei pronto.",
            "L'idoneità è confermata dal provider; fino ad allora la connessione risulta in attesa di idoneità.",
        ],
    ),
    "operatorPayments": operator(
        title="Pagamenti e attivazioni",
        subtitle="Esamina i pagamenti, conferma i bonifici manuali e gestisci le attivazioni.",
        refresh="Aggiorna", filterStatus="Filtra per stato", allStatuses="Tutti gli stati",
        noRows="Nessun pagamento trovato.", customer="Cliente", customerEmail="Email del cliente",
        open="Apri", close="Chiudi", detailTitle="Dettaglio del pagamento",
        note="Nota dell'operatore",
        notePlaceholder="Nota mostrata al cliente (obbligatoria per rifiutare, chiedere informazioni, sospendere o disconnettere).",
        actionDone="Azione completata.", audit="Eventi di audit",
        auditEmpty="Nessun evento di audit.",
        actions=[
            "Approva pagamento", "Rifiuta pagamento", "Chiedi maggiori informazioni",
            "Attiva account", "Sospendi", "Disconnetti", "Riattiva",
        ],
        errors=[
            "Impossibile caricare i pagamenti.", "L'azione non è riuscita. Riprova.",
            "Non sei autorizzato a esaminare i pagamenti.", "Accedi di nuovo.",
            "Per questa azione è necessaria una nota.",
            "Questa azione non è consentita per lo stato attuale.",
        ],
    ),
}

T["es"] = {
    "paymentCard": card(
        navLabel="Pagos", title="Estado del pago",
        loading="Cargando el estado del pago", noPayments="Aún no hay pagos",
        noPaymentsHint="Cuando inicies un checkout, el progreso y el estado de activación aparecerán aquí.",
        viewPlans="Ver planes", plan="Plan", planFallback="Tu plan",
        reference="Referencia del pago", amount="Importe", method="Método de pago",
        currentStatus="Estado actual", activationStatus="Estado de activación",
        created="Creado", updated="Última actualización", nextAction="Siguiente acción",
        expiresIn="Caduca en {{time}}", activationActive="Cuenta activa",
        accountId="ID de cuenta Braxel", activationDate="Fecha de activación",
        nextStepsTitle="Próximos pasos", openDashboard="Abrir el panel",
        serverTruthNote="El estado lo confirma nuestro servidor. Una redirección o un botón del navegador nunca activa tu cuenta.",
        methods=["Tarjeta", "Cripto", "Transferencia bancaria", "—"],
        statuses=[
            "Creado", "Pendiente", "En proceso", "Revisión manual", "Confirmado",
            "Activación pendiente", "Activo", "Fallido", "Caducado", "Cancelado",
            "Reembolsado", "En disputa", "En mora", "Suspendido", "Desconectado",
        ],
        nextActions=[
            "Completar el pago", "Esperando confirmación", "Esperando revisión manual",
            "Esperando activación", "Conecta tu cuenta de proveedor",
            "Actualiza tu método de pago", "Iniciar un nuevo checkout",
            "Contactar con soporte", "No se requiere ninguna acción",
        ],
        nextSteps=[
            "Revisa tu plan y el estado de la cuenta en el panel.",
            "Conecta tu cuenta externa del proveedor cuando estés listo.",
            "La elegibilidad la confirma el proveedor; hasta entonces la conexión aparece como pendiente de elegibilidad.",
        ],
    ),
    "operatorPayments": operator(
        title="Pagos y activaciones",
        subtitle="Revisa pagos, confirma transferencias manuales y gestiona activaciones.",
        refresh="Actualizar", filterStatus="Filtrar por estado", allStatuses="Todos los estados",
        noRows="No se encontraron pagos.", customer="Cliente", customerEmail="Email del cliente",
        open="Abrir", close="Cerrar", detailTitle="Detalle del pago",
        note="Nota del operador",
        notePlaceholder="Nota mostrada al cliente (obligatoria para rechazar, pedir información, suspender o desconectar).",
        actionDone="Acción completada.", audit="Eventos de auditoría",
        auditEmpty="Aún no hay eventos de auditoría.",
        actions=[
            "Aprobar pago", "Rechazar pago", "Pedir más información",
            "Activar cuenta", "Suspender", "Desconectar", "Reactivar",
        ],
        errors=[
            "No se pudieron cargar los pagos.", "La acción falló. Inténtalo de nuevo.",
            "No tienes autorización para revisar pagos.", "Vuelve a iniciar sesión.",
            "Se requiere una nota para esta acción.",
            "Esta acción no está permitida para el estado actual.",
        ],
    ),
}

T["fr"] = {
    "paymentCard": card(
        navLabel="Paiements", title="Statut du paiement",
        loading="Chargement du statut du paiement", noPayments="Aucun paiement",
        noPaymentsHint="Lorsque vous lancez un paiement, sa progression et son statut d'activation apparaissent ici.",
        viewPlans="Voir les offres", plan="Offre", planFallback="Votre offre",
        reference="Référence du paiement", amount="Montant", method="Moyen de paiement",
        currentStatus="Statut actuel", activationStatus="Statut d'activation",
        created="Créé", updated="Dernière mise à jour", nextAction="Prochaine action",
        expiresIn="Expire dans {{time}}", activationActive="Compte actif",
        accountId="ID de compte Braxel", activationDate="Date d'activation",
        nextStepsTitle="Prochaines étapes", openDashboard="Ouvrir le tableau de bord",
        serverTruthNote="Le statut est confirmé par notre serveur. Une redirection ou un bouton du navigateur n'active jamais votre compte.",
        methods=["Carte", "Crypto", "Virement bancaire", "—"],
        statuses=[
            "Créé", "En attente", "En cours", "Vérification manuelle", "Confirmé",
            "Activation en attente", "Actif", "Échoué", "Expiré", "Annulé",
            "Remboursé", "Contesté", "En retard", "Suspendu", "Déconnecté",
        ],
        nextActions=[
            "Finaliser le paiement", "En attente de confirmation", "En attente de vérification manuelle",
            "En attente d'activation", "Connecter votre compte fournisseur",
            "Mettre à jour votre moyen de paiement", "Lancer un nouveau paiement",
            "Contacter le support", "Aucune action requise",
        ],
        nextSteps=[
            "Consultez votre offre et le statut du compte dans le tableau de bord.",
            "Connectez votre compte fournisseur externe lorsque vous êtes prêt.",
            "L'éligibilité est confirmée par le fournisseur ; jusque-là la connexion apparaît comme en attente d'éligibilité.",
        ],
    ),
    "operatorPayments": operator(
        title="Paiements et activations",
        subtitle="Examinez les paiements, confirmez les virements manuels et gérez les activations.",
        refresh="Actualiser", filterStatus="Filtrer par statut", allStatuses="Tous les statuts",
        noRows="Aucun paiement trouvé.", customer="Client", customerEmail="E-mail du client",
        open="Ouvrir", close="Fermer", detailTitle="Détail du paiement",
        note="Note de l'opérateur",
        notePlaceholder="Note affichée au client (obligatoire pour refuser, demander des informations, suspendre ou déconnecter).",
        actionDone="Action terminée.", audit="Événements d'audit",
        auditEmpty="Aucun événement d'audit.",
        actions=[
            "Approuver le paiement", "Refuser le paiement", "Demander plus d'informations",
            "Activer le compte", "Suspendre", "Déconnecter", "Réactiver",
        ],
        errors=[
            "Impossible de charger les paiements.", "L'action a échoué. Réessayez.",
            "Vous n'êtes pas autorisé à examiner les paiements.", "Veuillez vous reconnecter.",
            "Une note est requise pour cette action.",
            "Cette action n'est pas autorisée pour le statut actuel.",
        ],
    ),
}

T["de"] = {
    "paymentCard": card(
        navLabel="Zahlungen", title="Zahlungsstatus",
        loading="Zahlungsstatus wird geladen", noPayments="Noch keine Zahlung",
        noPaymentsHint="Sobald Sie einen Checkout starten, erscheinen Fortschritt und Aktivierungsstatus hier.",
        viewPlans="Tarife ansehen", plan="Tarif", planFallback="Ihr Tarif",
        reference="Zahlungsreferenz", amount="Betrag", method="Zahlungsmethode",
        currentStatus="Aktueller Status", activationStatus="Aktivierungsstatus",
        created="Erstellt", updated="Zuletzt aktualisiert", nextAction="Nächste Aktion",
        expiresIn="Läuft ab in {{time}}", activationActive="Konto aktiv",
        accountId="Braxel-Konto-ID", activationDate="Aktivierungsdatum",
        nextStepsTitle="Nächste Schritte", openDashboard="Dashboard öffnen",
        serverTruthNote="Der Status wird von unserem Server bestätigt. Eine Browser-Weiterleitung oder Schaltfläche aktiviert Ihr Konto niemals.",
        methods=["Karte", "Krypto", "Banküberweisung", "—"],
        statuses=[
            "Erstellt", "Ausstehend", "In Bearbeitung", "Manuelle Prüfung", "Bestätigt",
            "Aktivierung ausstehend", "Aktiv", "Fehlgeschlagen", "Abgelaufen", "Storniert",
            "Erstattet", "Bestritten", "Überfällig", "Gesperrt", "Getrennt",
        ],
        nextActions=[
            "Zahlung abschließen", "Warten auf Bestätigung", "Warten auf manuelle Prüfung",
            "Warten auf Aktivierung", "Anbieterkonto verbinden",
            "Zahlungsmethode aktualisieren", "Neuen Checkout starten",
            "Support kontaktieren", "Keine Aktion erforderlich",
        ],
        nextSteps=[
            "Prüfen Sie Tarif und Kontostatus im Dashboard.",
            "Verbinden Sie Ihr externes Anbieterkonto, wenn Sie bereit sind.",
            "Die Berechtigung wird vom Anbieter bestätigt; bis dahin wird die Verbindung als ausstehende Berechtigung angezeigt.",
        ],
    ),
    "operatorPayments": operator(
        title="Zahlungen & Aktivierungen",
        subtitle="Prüfen Sie Zahlungen, bestätigen Sie manuelle Überweisungen und verwalten Sie Aktivierungen.",
        refresh="Aktualisieren", filterStatus="Nach Status filtern", allStatuses="Alle Status",
        noRows="Keine Zahlungen gefunden.", customer="Kunde", customerEmail="Kunden-E-Mail",
        open="Öffnen", close="Schließen", detailTitle="Zahlungsdetails",
        note="Operator-Notiz",
        notePlaceholder="Notiz für den Kunden (erforderlich zum Ablehnen, Nachfragen, Sperren oder Trennen).",
        actionDone="Aktion abgeschlossen.", audit="Audit-Ereignisse",
        auditEmpty="Noch keine Audit-Ereignisse.",
        actions=[
            "Zahlung genehmigen", "Zahlung ablehnen", "Weitere Informationen anfordern",
            "Konto aktivieren", "Sperren", "Trennen", "Wiederherstellen",
        ],
        errors=[
            "Zahlungen konnten nicht geladen werden.", "Die Aktion ist fehlgeschlagen. Versuchen Sie es erneut.",
            "Sie sind nicht berechtigt, Zahlungen zu prüfen.", "Bitte melden Sie sich erneut an.",
            "Für diese Aktion ist eine Notiz erforderlich.",
            "Diese Aktion ist für den aktuellen Status nicht zulässig.",
        ],
    ),
}

T["ru"] = {
    "paymentCard": card(
        navLabel="Платежи", title="Статус платежа",
        loading="Загрузка статуса платежа", noPayments="Платежей пока нет",
        noPaymentsHint="Когда вы начнёте оформление, здесь появятся ход оплаты и статус активации.",
        viewPlans="Посмотреть тарифы", plan="Тариф", planFallback="Ваш тариф",
        reference="Ссылка на платёж", amount="Сумма", method="Способ оплаты",
        currentStatus="Текущий статус", activationStatus="Статус активации",
        created="Создан", updated="Последнее обновление", nextAction="Следующее действие",
        expiresIn="Истекает через {{time}}", activationActive="Аккаунт активен",
        accountId="ID аккаунта Braxel", activationDate="Дата активации",
        nextStepsTitle="Следующие шаги", openDashboard="Открыть панель",
        serverTruthNote="Статус подтверждается нашим сервером. Переадресация или кнопка в браузере никогда не активируют ваш аккаунт.",
        methods=["Карта", "Криптовалюта", "Банковский перевод", "—"],
        statuses=[
            "Создан", "Ожидает", "Обрабатывается", "Ручная проверка", "Подтверждён",
            "Ожидает активации", "Активен", "Ошибка", "Истёк", "Отменён",
            "Возвращён", "Оспорен", "Просрочен", "Приостановлен", "Отключён",
        ],
        nextActions=[
            "Завершить оплату", "Ожидание подтверждения", "Ожидание ручной проверки",
            "Ожидание активации", "Подключить аккаунт провайдера",
            "Обновить способ оплаты", "Начать новое оформление",
            "Связаться с поддержкой", "Действий не требуется",
        ],
        nextSteps=[
            "Проверьте тариф и статус аккаунта в панели.",
            "Подключите внешний аккаунт провайдера, когда будете готовы.",
            "Право доступа подтверждает провайдер; до этого подключение отображается как ожидающее подтверждения.",
        ],
    ),
    "operatorPayments": operator(
        title="Платежи и активации",
        subtitle="Проверяйте платежи, подтверждайте ручные переводы и управляйте активациями.",
        refresh="Обновить", filterStatus="Фильтр по статусу", allStatuses="Все статусы",
        noRows="Платежи не найдены.", customer="Клиент", customerEmail="Эл. почта клиента",
        open="Открыть", close="Закрыть", detailTitle="Детали платежа",
        note="Заметка оператора",
        notePlaceholder="Заметка для клиента (обязательна для отказа, запроса информации, приостановки или отключения).",
        actionDone="Действие выполнено.", audit="События аудита",
        auditEmpty="Событий аудита пока нет.",
        actions=[
            "Одобрить платёж", "Отклонить платёж", "Запросить дополнительную информацию",
            "Активировать аккаунт", "Приостановить", "Отключить", "Восстановить",
        ],
        errors=[
            "Не удалось загрузить платежи.", "Действие не выполнено. Повторите попытку.",
            "У вас нет прав на проверку платежей.", "Войдите снова.",
            "Для этого действия нужна заметка.",
            "Это действие недопустимо для текущего статуса.",
        ],
    ),
}

T["zh"] = {
    "paymentCard": card(
        navLabel="付款", title="付款状态",
        loading="正在加载付款状态", noPayments="暂无付款",
        noPaymentsHint="开始结账后，进度和激活状态会显示在这里。",
        viewPlans="查看套餐", plan="套餐", planFallback="您的套餐",
        reference="付款参考号", amount="金额", method="付款方式",
        currentStatus="当前状态", activationStatus="激活状态",
        created="创建时间", updated="最后更新", nextAction="下一步操作",
        expiresIn="{{time}} 后过期", activationActive="账户已激活",
        accountId="Braxel 账户 ID", activationDate="激活日期",
        nextStepsTitle="后续步骤", openDashboard="打开仪表盘",
        serverTruthNote="状态由我们的服务器确认。浏览器跳转或按钮绝不会激活您的账户。",
        methods=["银行卡", "加密货币", "银行转账", "—"],
        statuses=[
            "已创建", "待处理", "处理中", "人工审核", "已确认",
            "等待激活", "已激活", "失败", "已过期", "已取消",
            "已退款", "有争议", "逾期", "已暂停", "已断开",
        ],
        nextActions=[
            "完成付款", "等待确认", "等待人工审核",
            "等待激活", "连接您的提供商账户",
            "更新付款方式", "重新结账",
            "联系支持", "无需操作",
        ],
        nextSteps=[
            "在仪表盘中查看您的套餐和账户状态。",
            "准备好后连接您的外部提供商账户。",
            "资格由提供商确认；在此之前连接会显示为等待资格确认。",
        ],
    ),
    "operatorPayments": operator(
        title="付款与激活",
        subtitle="审核付款、确认人工转账并管理激活。",
        refresh="刷新", filterStatus="按状态筛选", allStatuses="所有状态",
        noRows="未找到付款。", customer="客户", customerEmail="客户邮箱",
        open="打开", close="关闭", detailTitle="付款详情",
        note="运营备注",
        notePlaceholder="向客户显示的备注（拒绝、要求补充信息、暂停或断开时必填）。",
        actionDone="操作已完成。", audit="审计事件",
        auditEmpty="暂无审计事件。",
        actions=[
            "批准付款", "拒绝付款", "要求补充信息",
            "激活账户", "暂停", "断开", "恢复",
        ],
        errors=[
            "无法加载付款。", "操作失败，请重试。",
            "您无权审核付款。", "请重新登录。",
            "此操作需要填写备注。",
            "当前状态不允许此操作。",
        ],
    ),
}

T["ja"] = {
    "paymentCard": card(
        navLabel="支払い", title="支払い状況",
        loading="支払い状況を読み込み中", noPayments="支払いはまだありません",
        noPaymentsHint="チェックアウトを開始すると、進行状況とアクティベーション状況がここに表示されます。",
        viewPlans="プランを見る", plan="プラン", planFallback="ご利用のプラン",
        reference="支払い参照番号", amount="金額", method="支払い方法",
        currentStatus="現在の状況", activationStatus="アクティベーション状況",
        created="作成日時", updated="最終更新", nextAction="次の操作",
        expiresIn="残り {{time}}", activationActive="アカウント有効",
        accountId="Braxel アカウント ID", activationDate="アクティベーション日",
        nextStepsTitle="次のステップ", openDashboard="ダッシュボードを開く",
        serverTruthNote="状況は当社のサーバーで確認されます。ブラウザのリダイレクトやボタンでアカウントが有効になることはありません。",
        methods=["カード", "暗号資産", "銀行振込", "—"],
        statuses=[
            "作成済み", "保留中", "処理中", "手動レビュー", "確認済み",
            "アクティベーション待ち", "有効", "失敗", "期限切れ", "キャンセル済み",
            "返金済み", "異議あり", "支払い遅延", "停止中", "切断済み",
        ],
        nextActions=[
            "支払いを完了する", "確認待ち", "手動レビュー待ち",
            "アクティベーション待ち", "プロバイダーアカウントを接続する",
            "支払い方法を更新する", "新しいチェックアウトを開始する",
            "サポートに連絡する", "操作は不要です",
        ],
        nextSteps=[
            "ダッシュボードでプランとアカウント状況を確認してください。",
            "準備ができたら外部プロバイダーアカウントを接続してください。",
            "資格はプロバイダーが確認します。それまでは接続は資格確認待ちとして表示されます。",
        ],
    ),
    "operatorPayments": operator(
        title="支払いとアクティベーション",
        subtitle="支払いを確認し、手動振込を承認し、アクティベーションを管理します。",
        refresh="更新", filterStatus="状況で絞り込む", allStatuses="すべての状況",
        noRows="支払いが見つかりません。", customer="顧客", customerEmail="顧客メール",
        open="開く", close="閉じる", detailTitle="支払いの詳細",
        note="オペレーターのメモ",
        notePlaceholder="顧客に表示されるメモ（拒否、情報請求、停止、切断には必須）。",
        actionDone="操作が完了しました。", audit="監査イベント",
        auditEmpty="監査イベントはまだありません。",
        actions=[
            "支払いを承認", "支払いを拒否", "追加情報を請求",
            "アカウントを有効化", "停止", "切断", "復元",
        ],
        errors=[
            "支払いを読み込めませんでした。", "操作に失敗しました。もう一度お試しください。",
            "支払いを確認する権限がありません。", "もう一度サインインしてください。",
            "この操作にはメモが必要です。",
            "現在の状況ではこの操作は許可されていません。",
        ],
    ),
}

T["ar"] = {
    "paymentCard": card(
        navLabel="المدفوعات", title="حالة الدفع",
        loading="جارٍ تحميل حالة الدفع", noPayments="لا توجد مدفوعات بعد",
        noPaymentsHint="عند بدء الدفع، ستظهر هنا حالة التقدم وحالة التنشيط.",
        viewPlans="عرض الخطط", plan="الخطة", planFallback="خطتك",
        reference="مرجع الدفع", amount="المبلغ", method="طريقة الدفع",
        currentStatus="الحالة الحالية", activationStatus="حالة التنشيط",
        created="أُنشئ", updated="آخر تحديث", nextAction="الإجراء التالي",
        expiresIn="ينتهي خلال {{time}}", activationActive="الحساب نشط",
        accountId="معرّف حساب Braxel", activationDate="تاريخ التنشيط",
        nextStepsTitle="الخطوات التالية", openDashboard="فتح لوحة التحكم",
        serverTruthNote="يتم تأكيد الحالة من خادمنا. إعادة التوجيه أو الضغط على زر في المتصفح لا يُنشّط حسابك أبدًا.",
        methods=["بطاقة", "عملات رقمية", "تحويل بنكي", "—"],
        statuses=[
            "أُنشئ", "قيد الانتظار", "قيد المعالجة", "مراجعة يدوية", "مؤكد",
            "بانتظار التنشيط", "نشط", "فشل", "منتهي", "ملغى",
            "مُسترد", "متنازع عليه", "متأخر", "موقوف", "منفصل",
        ],
        nextActions=[
            "إكمال الدفع", "بانتظار التأكيد", "بانتظار المراجعة اليدوية",
            "بانتظار التنشيط", "ربط حساب المزوّد",
            "تحديث طريقة الدفع", "بدء عملية دفع جديدة",
            "الاتصال بالدعم", "لا يلزم أي إجراء",
        ],
        nextSteps=[
            "راجع خطتك وحالة الحساب في لوحة التحكم.",
            "اربط حساب المزوّد الخارجي عندما تكون جاهزًا.",
            "يتم تأكيد الأهلية من المزوّد؛ وحتى ذلك الحين يظهر الاتصال بانتظار الأهلية.",
        ],
    ),
    "operatorPayments": operator(
        title="المدفوعات والتنشيط",
        subtitle="راجع المدفوعات، وأكّد التحويلات اليدوية، وأدر عمليات التنشيط.",
        refresh="تحديث", filterStatus="تصفية حسب الحالة", allStatuses="كل الحالات",
        noRows="لم يتم العثور على مدفوعات.", customer="العميل", customerEmail="بريد العميل",
        open="فتح", close="إغلاق", detailTitle="تفاصيل الدفع",
        note="ملاحظة المشغّل",
        notePlaceholder="ملاحظة تظهر للعميل (مطلوبة للرفض أو طلب المعلومات أو الإيقاف أو الفصل).",
        actionDone="تم تنفيذ الإجراء.", audit="أحداث التدقيق",
        auditEmpty="لا توجد أحداث تدقيق بعد.",
        actions=[
            "اعتماد الدفع", "رفض الدفع", "طلب مزيد من المعلومات",
            "تنشيط الحساب", "إيقاف", "فصل", "إعادة التنشيط",
        ],
        errors=[
            "تعذّر تحميل المدفوعات.", "فشل الإجراء. حاول مرة أخرى.",
            "غير مصرّح لك بمراجعة المدفوعات.", "يرجى تسجيل الدخول مرة أخرى.",
            "ملاحظة مطلوبة لهذا الإجراء.",
            "هذا الإجراء غير مسموح للحالة الحالية.",
        ],
    ),
}

T["he"] = {
    "paymentCard": card(
        navLabel="תשלומים", title="מצב התשלום",
        loading="טוען את מצב התשלום", noPayments="אין תשלומים עדיין",
        noPaymentsHint="כאשר תתחיל תהליך תשלום, ההתקדמות ומצב ההפעלה יופיעו כאן.",
        viewPlans="צפה בתוכניות", plan="תוכנית", planFallback="התוכנית שלך",
        reference="אסמכתת תשלום", amount="סכום", method="אמצעי תשלום",
        currentStatus="מצב נוכחי", activationStatus="מצב הפעלה",
        created="נוצר", updated="עדכון אחרון", nextAction="הפעולה הבאה",
        expiresIn="פג בעוד {{time}}", activationActive="החשבון פעיל",
        accountId="מזהה חשבון Braxel", activationDate="תאריך הפעלה",
        nextStepsTitle="השלבים הבאים", openDashboard="פתח את לוח הבקרה",
        serverTruthNote="המצב מאומת על ידי השרת שלנו. הפניה או לחצן בדפדפן לעולם אינם מפעילים את החשבון שלך.",
        methods=["כרטיס", "קריפטו", "העברה בנקאית", "—"],
        statuses=[
            "נוצר", "ממתין", "בעיבוד", "סקירה ידנית", "מאושר",
            "ממתין להפעלה", "פעיל", "נכשל", "פג תוקף", "בוטל",
            "הוחזר", "במחלוקת", "באיחור", "מושהה", "מנותק",
        ],
        nextActions=[
            "השלם את התשלום", "ממתין לאישור", "ממתין לסקירה ידנית",
            "ממתין להפעלה", "חבר את חשבון הספק",
            "עדכן את אמצעי התשלום", "התחל תשלום חדש",
            "צור קשר עם התמיכה", "לא נדרשת פעולה",
        ],
        nextSteps=[
            "עיין בתוכנית ובמצב החשבון בלוח הבקרה.",
            "חבר את חשבון הספק החיצוני שלך כשאתה מוכן.",
            "הזכאות מאושרת על ידי הספק; עד אז החיבור מוצג כממתין לזכאות.",
        ],
    ),
    "operatorPayments": operator(
        title="תשלומים והפעלות",
        subtitle="סקור תשלומים, אשר העברות ידניות ונהל הפעלות.",
        refresh="רענן", filterStatus="סנן לפי מצב", allStatuses="כל המצבים",
        noRows="לא נמצאו תשלומים.", customer="לקוח", customerEmail="דוא״ל הלקוח",
        open="פתח", close="סגור", detailTitle="פרטי התשלום",
        note="הערת מפעיל",
        notePlaceholder="הערה המוצגת ללקוח (נדרשת לדחייה, לבקשת מידע, להשעיה או לניתוק).",
        actionDone="הפעולה הושלמה.", audit="אירועי ביקורת",
        auditEmpty="אין אירועי ביקורת עדיין.",
        actions=[
            "אשר תשלום", "דחה תשלום", "בקש מידע נוסף",
            "הפעל חשבון", "השהה", "נתק", "הפעל מחדש",
        ],
        errors=[
            "לא ניתן היה לטעון תשלומים.", "הפעולה נכשלה. נסה שוב.",
            "אינך מורשה לסקור תשלומים.", "אנא התחבר מחדש.",
            "נדרשת הערה לפעולה זו.",
            "פעולה זו אינה מותרת עבור המצב הנוכחי.",
        ],
    ),
}


def render(ns_name, obj, indent):
    body = json.dumps(obj, ensure_ascii=False, indent=2)
    body = "\n".join((" " * indent) + line for line in body.split("\n"))
    return f"{' ' * (indent - 2)}{ns_name}: {body.strip()},\n"


def main():
    src = PATH.read_text(encoding="utf-8")
    lines = src.split("\n")
    starts = []
    for loc in LOCALE_ORDER:
        needle = f"const {loc}Translation = "
        idx = next((i for i, l in enumerate(lines) if l.startswith(needle)), -1)
        if idx < 0:
            sys.exit(f"locale {loc} not found")
        starts.append((loc, idx))

    added = 0
    for loc, start in reversed(starts):
        next_start = next((s for l, s in starts if s > start), len(lines))
        block = "\n".join(lines[start:next_start])
        if re.search(r"^\s*paymentCard:\s*\{", block, re.M):
            continue
        anchor = next(
            (i for i in range(start, next_start) if lines[i].startswith("  errorBoundary: {")),
            None,
        )
        if anchor is None:
            sys.exit(f"errorBoundary anchor not found in locale {loc}")
        insertion = (
            render("paymentCard", T[loc]["paymentCard"], 4)
            + render("operatorPayments", T[loc]["operatorPayments"], 4)
        ).split("\n")
        # Drop the trailing empty element from split.
        if insertion and insertion[-1] == "":
            insertion = insertion[:-1]
        lines[anchor:anchor] = insertion
        added += 1
        next_start += len(insertion)

    PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"inserted paymentCard + operatorPayments into {added} locale(s)")


if __name__ == "__main__":
    main()
