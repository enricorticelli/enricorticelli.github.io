# EnricoOS

Il sito personale di Enrico Corticelli, Backend Developer, come un piccolo desktop retrò.

- All’arrivo, il computer si accende in 3 secondi.
- Ogni accensione sceglie casualmente Windows 95, 98, XP o 7, cambiando desktop, finestre e menu Start. Le quattro versioni vengono mescolate e alternate senza ripetizioni immediate.
- Il desktop è dentro un monitor: CRT beige 4:3 per 95/98, LCD argentato 4:3 per XP e LCD nero 16:9 per 7.
- Dopo l’avvio, Enrico, GitHub, LinkedIn e Instagram sono già aperti e distribuiti sul desktop.
- Ogni pagina ha una sola finestra: un click sulla sua icona la riporta in primo piano o la ripristina se era ridotta.
- Le finestre si sovrappongono, si trascinano e si riducono nella barra delle applicazioni.
- GitHub, LinkedIn e Instagram hanno ciascuno la propria pagina e il link al profilo reale.
- `Enrico.txt` contiene anche la foto presente in `assets/profile.jpg`.
- Il menu Start riprende struttura e aspetto della versione selezionata, con sottomenu utilizzabili con mouse e tastiera.
- Campo minato è giocabile da `Programmi → Accessori → Giochi`, oppure direttamente nel menu di XP/7. Il primo click è sicuro; il tasto destro o il pulsante ⚑ inserisce una bandiera.
- Alcune voci, come Windows Update, Pannello di controllo e Posta elettronica, avviano una raffica di finestre d’errore, una schermata blu e il riavvio automatico. Le finestre d’errore vengono eliminate, le quattro pagine tornano aperte e il sistema cambia versione.
- Da `Esegui` funzionano `winmine`, `notepad`, `enrico`, `github`, `linkedin` e `instagram`. Gli altri comandi fanno partire il crash simulato.

Il sito è statico: non richiede build, dipendenze, account o chiamate alle API dei social. GitHub Pages serve direttamente HTML, CSS, JavaScript e gli asset locali.

Per provarlo in locale:

```sh
python3 -m http.server 8000
```

Poi apri `http://localhost:8000`.

I profili si configurano nell’oggetto `apps` in `app.js`. Per cambiare nome o ruolo, aggiorna anche la schermata di avvio e i metadati in `index.html`.

Si possono spostare le finestre anche con le frecce della tastiera dopo aver selezionato il titolo. Senza JavaScript rimangono disponibili nome, ruolo e link ai social.

Le prove del motore di Campo minato si eseguono con `node --test tests/minesweeper.test.cjs`. Verificano generazione, primo click sicuro, conteggi, espansione delle caselle, bandiere, vittoria e sconfitta.

I font bitmap locali provengono da [98.css](https://github.com/jdan/98.css) e includono la relativa licenza MIT in `assets/fonts/LICENSE-98css.txt`. Riferimenti visivi: [98.css](https://jdan.github.io/98.css/), [XP.css](https://botoxparty.github.io/XP.css/), [7.css](https://khang-nd.github.io/7.css/).
