# EnricoOS

Il sito personale di Enrico Corticelli, Backend Developer, come un piccolo desktop retrò.

- All’arrivo, il computer si accende in 3 secondi.
- Ogni click su un’icona apre una nuova finestra indipendente.
- Le finestre si sovrappongono, si trascinano e si riducono nella barra delle applicazioni.
- GitHub, LinkedIn e Instagram hanno ciascuno la propria pagina e il link al profilo reale.
- Il menu Start permette di riavviare il desktop e nasconde un piccolo finto crash.

Il sito è statico: non richiede build, dipendenze, account o chiamate alle API dei social. GitHub Pages può servire direttamente `index.html`, `style.css` e `app.js`.

Per provarlo in locale:

```sh
python3 -m http.server 8000
```

Poi apri `http://localhost:8000`.

I profili si configurano nell’oggetto `apps` in `app.js`. Per cambiare nome o ruolo, aggiorna anche la schermata di avvio e i metadati in `index.html`.

Si possono spostare le finestre anche con le frecce della tastiera dopo aver selezionato il titolo. Senza JavaScript rimangono disponibili nome, ruolo e link ai social.
