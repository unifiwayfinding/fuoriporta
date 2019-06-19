# Appunti generatore fuoriporta:


## TODO v1
--

**FUNZIONALITA'**
- [x]	Inserire un'opzione per avere i colori scambiati testo/sfondo.
- [x]	Aggiungere larghezza massima campi.
- [x] Regolare interlinea su campo destro (nomi e specifiche)
- [x]	Le strutture devono diventare un menu a discesa. È semplice perché con "onchange" vengono popolate delle variabili.
- [x] Bugfix: in "compilazione libera" i text field delle strutture non devono essere bloccati
- [x] Separare html da js
- [x] Nei campi liberi di "funzione" dovrebbe essere imposto lowercase
- [ ] Separare html da js: eliminare js in html e togliere id e classes dalle funzioni
- [x] Funzioni con menu a discesa, con possibilità di inserimento manuale
- [ ] Inserire opzione per nome oppure specifica sui campi nome
- [ ] Aggiungere qr code per giombetti
      https://github.com/soldair/node-qrcode
      https://github.com/papnkukn/qrcode-svg (sembra il più semplice)
      https://github.com/davidshimjs/qrcodejs
- [ ] Cambiare flag nome/specifica facendo sì che sotto ogni nome possa essere inserito e rimosso un campo "specifica" - questo risolve sia il problema delle specifiche una sotto l'altra che il problema dell'interlinea sbagliata se sotto un nome c'è una riga flaggata specifica ma vuota
- [ ] Risolvere overflow dei nomi in alto
- [ ] Cambiare funzionamento di nextpage e prevpage lavorando sulla visualizzazione e non sulla compilazione



**LAYOUT FUORIPORTA**
- [x] Aggiungere annotazioni nella riga in basso (sicuramente "creato con..." la data).
- [ ] Aggiungere "loading" o "qualcosa non ha funzionato" che rimanga nel caso l'antemprima non si carichi per qualsiasi motivo.
- [x] Cambiare corpi
- [x] Regolare interlinea tra strutture e funzioni
- [x] Regolare accapo e eventuale interlinea su campo sinistro (strutture + funzioni)


**LAYOUT SITO**
- [ ] Spostare il titolo fuori dalla scheda
- [ ] Spostare aggiorna l'anteprima sopra l'anteprima
- [ ] Spostare "carica il pdf" sotto l'anteprima

---

## TODO v2
- [ ] Implementare auto update come qui: http://pdfkit.org/demo/browser.html
- [ ] Il pdf deve essere impaginato in un A4?
- [ ] La preview deve essere inclusa in un fuoriporta intero?
- [ ] Aggiorna fuoriporta con INVIO
- [ ] Inserire nei campi testo invece di testo vero dei suggerimenti che poi spariscono (svincolare primo render del pdf dai contenuti dei campi)
