# Real Time Speech-Recognition and Translation

## Setup :

- Créer un fichier .env <br />
- Ajouter les champs suivants :<br />
```
**PORT** → Le port sur lequel le serveur se lancera
ORIGIN → Url CORS pour le serveur websocket. Recommandé : http://localhost:PORT
TWITCH_CLIENT_ID → Identifiant de l'application Twitch utilisé pour l'autentification (https://dev.twitch.tv)
TWITCH_CLIENT_SECRET → Secret de l'application Twitch utilisé pour l'autentification (https://dev.twitch.tv)
ALLOWED_USERS → Utilisateurs autorisés à s'autentifier
JWT_SECRET → Secret utilisé pour encoder le JsonWebToken (https://jwt.io)
```
- Executer la commande ```npm install```<br />
- Executer la commande ```npm run dev```<br />
- Se rendre sur l'url avec le port correspondant http://localhost:PORT<br />
- Enjoy ! 👍
