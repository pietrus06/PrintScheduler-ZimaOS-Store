# Amazon Invoice Exporter

Application ZimaOS pour récupérer en masse les factures et avoirs disponibles dans l’historique de commandes Amazon.fr.

## Utilisation

1. Installez l’application depuis la Boutique Pierre ZimaOS.
2. Ouvrez Amazon Invoice Exporter sur le port `8101`.
3. Cliquez sur **Ouvrir Chromium** et connectez-vous vous-même à Amazon.fr.
4. Revenez dans l’application et cliquez sur **Vérifier la connexion**.
5. Choisissez l’année puis lancez l’export.
6. Téléchargez ensuite le CSV récapitulatif et l’archive ZIP.

L’application ne stocke pas le mot de passe Amazon. La session de navigation Chromium est conservée dans `/DATA/AppData/AmazonInvoiceExporter/browser`.

Les documents et exports sont conservés dans `/DATA/AppData/AmazonInvoiceExporter/data`.

## Ports

- `8101` : interface Amazon Invoice Exporter
- `5805` : interface Chromium utilisée pour la connexion Amazon
- `9222` : CDP interne Docker uniquement, non publié sur le réseau

## Sécurité

Le port `5805` donne accès à la session Chromium authentifiée. Il ne doit pas être exposé directement sur Internet. Utilisez-le uniquement sur un réseau de confiance ou via votre accès privé/VPN.

## Factures

Par défaut, les documents Amazon explicitement indiqués comme n’étant pas une facture de TVA sont ignorés. Aucun faux justificatif n’est généré lorsqu’une facture n’est pas disponible.
