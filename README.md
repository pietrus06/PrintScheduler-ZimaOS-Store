# Boutique Pierre ZimaOS

Catalogue personnel ZimaOS AppStore v2, publié automatiquement sur la branche `gh-pages`.

## Installer les applications

Ajoutez cette source dans la boutique ZimaOS, puis recherchez l’application et cliquez sur **Installer** :

```text
https://cdn.jsdelivr.net/gh/pietrus06/PrintScheduler-ZimaOS-Store@gh-pages/store.json
```

Si la source est déjà ajoutée, actualisez le catalogue. En cas de retard du cache CDN, l’adresse directe est :

```text
https://raw.githubusercontent.com/pietrus06/PrintScheduler-ZimaOS-Store/gh-pages/store.json
```

| Application | Port du serveur | Données persistantes |
|---|---:|---|
| PrintScheduler | 8095 | `/DATA/AppData/PrintScheduler/data` |
| Supabase Manager | 8096 | `/DATA/AppData/SupabaseManager` et `/DATA/AppData/SupabaseProjects` |
| Supabase Cloud Manager | 8097 | `/DATA/AppData/SupabaseCloudManager` |
| Galaxy Visual | 8098 | Volume Docker `galaxy_visual_data`, monté dans `/data` |
| Amazon Invoice Exporter | 8101 (Chromium 5805) | `/DATA/AppData/AmazonInvoiceExporter/data` et `/DATA/AppData/AmazonInvoiceExporter/browser` |

Les images applicatives sont publiées sur GitHub Container Registry avec un tag distinct par application. Aucune compilation locale n’est nécessaire.

## Amazon Invoice Exporter

Amazon Invoice Exporter permet de se connecter manuellement à Amazon.fr dans un Chromium hébergé par ZimaOS, puis d’analyser une année de commandes et de télécharger automatiquement les factures et avoirs disponibles. L’application génère également un récapitulatif CSV et une archive ZIP.

Après installation, ouvrez `http://IP_DU_ZIMAOS:8101`, cliquez sur **Ouvrir Chromium**, connectez-vous à Amazon.fr, puis revenez dans l’application pour lancer l’export. L’exporteur ne stocke pas les identifiants Amazon ; la session Chromium persistante reste dans `/DATA/AppData/AmazonInvoiceExporter/browser`.

**Sécurité :** le port `5805` donne accès au navigateur contenant la session Amazon connectée. Ne l’exposez pas directement sur Internet ; réservez son accès au réseau local ou à un accès privé/VPN.

## Galaxy Visual

Galaxy Visual permet d’importer les plans des sites, de placer les détecteurs, de conserver leurs positions et d’essayer des alarmes graphiques dans une démonstration isolée. **Le pilote direct Honeywell et les commandes d’armement/désarmement restent à développer et à valider.**

Après installation, ouvrez `http://IP_DU_ZIMAOS:8098`. Le code de création du premier compte est affiché dans les journaux du conteneur `galaxy-visual`. Choisissez ensuite votre identifiant et votre mot de passe ; aucun compte partagé n’est fourni.

Si votre version de ZimaOS demande un fichier Compose, importez [le manifeste Galaxy Visual](Apps/GalaxyVisual/docker-compose.yml). Les sources et les tests sont dans le dossier `galaxy-visual` du dépôt applicatif `pietrus06/PrintScheduler`.

Les plans, positions, comptes et événements restent dans `galaxy_visual_data` lors des mises à jour. L’export **Réglages → Sauvegarde complète** produit une archive de sauvegarde.

## Publication et mises à jour

GitHub Actions valide les manifestes et reconstruit le catalogue après chaque modification de `main`, ainsi que selon la planification du workflow. Les applications disposant d’une image dédiée sont construites et publiées sur GHCR par leurs workflows respectifs.

PrintScheduler embarque un service WUD qui surveille les images marquées `wud.watch`. Les applications portant ces étiquettes peuvent également être suivies par ce service lorsqu’il est déjà installé. Sans ce service, les mises à jour se font depuis ZimaOS.
