# PrintScheduler ZimaOS Store

Dépôt public du store personnel ZimaOS pour PrintScheduler.

Le store est construit avec le protocole ZimaOS AppStore v2 et publié automatiquement sur la branche `gh-pages`.

URL du store à ajouter dans ZimaOS :

`https://cdn.jsdelivr.net/gh/pietrus06/PrintScheduler-ZimaOS-Store@gh-pages/store.json`

L'application utilise l'image publique :

`ghcr.io/pietrus06/printscheduler:latest`

Le volume persistant reste :

`/DATA/AppData/PrintScheduler/data`

Le compose embarque également WUD afin de surveiller le digest de l'image `latest` et mettre PrintScheduler à jour automatiquement sans supprimer les données persistantes.
