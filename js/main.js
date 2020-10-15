// -------------------------------------
// ----------- DEPENDENCIES ------------
// -------------------------------------
/*
pdfkit.js       required for pdf creation
blob-stream.js  required for writing to blob stream
pdf.js          required for preview visualization
pdf.worker.js   comes together with pdf.js
*/

/*
 --- *** APPUNTI *** ---
Prima di procedere va risolto il problema per il quale disattivando un funzionamenro provvisorio che si trova nelle ultime due righe smette tutto di funzionare
*/


PDFJS.workerSrc = 'js/pdf.worker.js';

var anteprima_pdf_url;
var anteprima_pdf_numpages;
var weblink = 'nuovofuoriporta.unifi.com';

// ---------------------------------
// ----------- SETTINGS ------------
// ---------------------------------

// impostazioni PDF, in mm
const show_margins = false;
const show_qr = false;
const force_petit_checkbox = false;

const impostazioni_PDF = {

nomi_corpo: 28,
nomi_interlinea: 24,
nomi_spaziosotto: 8,

specifica_corpo: 20,
specifica_interlinea: 18,
specifica_spaziosotto: 8,
riduzione_nomi_piccoli: 1.65,

strutture_bold_corpo: 23,
strutture_bold_interlinea: 20,
strutture_bold_spaziosotto: 0,

strutture_light_corpo: 16,
strutture_light_interlinea: 14,
strutture_light_spaziosotto: 0,

funzioni_corpo: 18,
funzioni_interlinea: 16,
funzioni_spaziosotto: 5,

strutture_bold_font: null,
strutture_bold_font: null,
funzioni_font: null,
nomi_font: null,
annotazioni_font  : null,

page_width          : mmToUnits(200),
page_height         : mmToUnits(110),
margin_up           : mmToUnits(12),
margin_down         : mmToUnits(12),
margin_sx           : mmToUnits(10),
margin_dx           : mmToUnits(10),

left_textbox_width  : mmToUnits(80),
right_textbox_width : mmToUnits(95),
altezza_qrcode      : mmToUnits(74),
lato_qrcode         : mmToUnits(20),
altezza_weblink     : mmToUnits(96),
altezza_annotazioni : mmToUnits(106),


foreground: null,
background: null
}



// Helper function: converts mm to pdf-units (pt)
function mmToUnits(mm) {
  units = mm * 2.8368794326;
  return units;
}







// ----------------------------------------------------
// ---- FUNCTIONS THAT GENERATES INPUT FIELDS ---------
// ----------------------------------------------------

// crea tutti i campi di input
var show_form = function() {
  var container = document.querySelector("#text_input_container");
  console.log(container);
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // crea gli input
  var box = document.createElement("div");
  box.setAttribute("class", "input_box");
  box.appendChild( create_text_input("Grassetto 1:", "struttura_b1" ) );
  box.appendChild( create_text_input("Grassetto 2:", "struttura_b2" ) );
  box.appendChild( create_text_input("Grassetto 3:", "struttura_b3") );
  box.appendChild( create_text_input("Light 1:", "struttura_l1" ) );
  box.appendChild( create_text_input("Light 2:", "struttura_l2" ) );
  box.appendChild( create_text_input("Light 3:", "struttura_l3" ) );
  container.appendChild(box);


  var box = document.createElement("div");
  box.setAttribute("class", "input_box");
  box.appendChild( create_select_and_text("Funzione 1:", "funzione_1", lista_funzioni) );
  box.appendChild( create_select_and_text("Funzione 2:", "funzione_2", lista_funzioni) );
  box.appendChild( create_select_and_text("Funzione 3:", "funzione_3", lista_funzioni) );
  container.appendChild(box);


  var box = document.createElement("div");
  box.setAttribute("class", "input_box");
  box.setAttribute("id", "nomi_box");

  box.appendChild( create_text_plus("1:", "nome_1", "Nome Cognome", "nome") );
  box.appendChild( create_text_plus("2:", "nome_2", "Descrizione", "spec") );
  box.appendChild( create_text_plus("3:", "nome_3", "", "nome") );
  box.appendChild( create_text_plus("4:", "nome_4", "", "nome") );
  box.appendChild( create_text_plus("5:", "nome_5", "", "nome") );
  box.appendChild( create_text_plus("6:", "nome_6", "", "nome") );
  box.appendChild( create_text_plus("7:", "nome_7", "", "nome") );
  box.appendChild( create_text_plus("8:", "nome_8", "", "nome") );
  box.appendChild( create_text_plus("9:", "nome_9", "", "nome") );
  box.appendChild( create_text_plus("10:", "nome_10", "", "nome") );
  box.appendChild( create_text_plus("11:", "nome_11", "", "nome") );
  box.appendChild( create_text_plus("12:", "nome_12", "", "nome") );
  box.appendChild( create_text_plus("13:", "nome_13", "", "nome") );

  var petit_line = document.createElement("div");
  petit_line.setAttribute("class", "input_line petit_line");
  var petit_checkbox = document.createElement("input");
  var petit_checkbox_label = document.createElement("label");
  petit_checkbox_label.textContent = "usa nomi piccoli";
  petit_checkbox.setAttribute("type", "checkbox");
  petit_checkbox.setAttribute("name", "petit");
  petit_checkbox.onchange = aggiorna_anteprima_da_form;
  petit_line.appendChild(petit_checkbox);
  petit_line.appendChild(petit_checkbox_label);
  box.appendChild(petit_line);

  // aggiunge nota in fondo
  let note = document.createElement("p");
  note.setAttribute("class", "tiny");
  note.innerHTML = "Per lasciare vuota una riga inserire uno spazio. <br> Per tenere insieme due parole usare il trattino basso.";
  box.appendChild(note);
  container.appendChild(box);

}


// -- DA QUI IN POI HELPER FUNCTIONS:

// helper function per aggiornare il pdf in automatico
var timeout = null;
var update = function () {
  clearTimeout(timeout);
  timeout = setTimeout(function () {
      aggiorna_anteprima_da_form();
  }, 500);
}

// generic function
// popola un dato select a partire da una lista
// questa viene chiamata durante l'inizializzazione
  var populate_select_input = function (select, lista) {
  let option = document.createElement("option");
  option.setAttribute("selected", "selected");
  option.setAttribute("disabled", "disabled");
  option.text = "...";
  select.appendChild(option);
  for (i = 0; i < lista.length; i++) {
    option = document.createElement("option");
    option.text = lista[i].option_label;
    option.value = lista[i].option_value;
    select.appendChild(option)
  }
}

// return un campo di testo a partire da enabled si/no, etichetta, id, value di precompilazione
var create_text_input = function (etichetta, id) {
  let input_line = document.createElement("div");
  input_line.setAttribute("class", "input_line");

  let label_box = document.createElement("div");
  label_box.setAttribute("class", "label_box");
  let label = document.createElement("label");
  label.textContent = etichetta;
  label_box.appendChild(label);
  input_line.appendChild(label_box);


  let input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "input_field");
  input.setAttribute("id", id);
  input.onkeyup = update;

  input.setAttribute("autocomplete", "nope");
  // aggiunge una stringa random sull'attributo "name" dei campi di testo per disattivare l'autocomplete
  input.setAttribute("name", Math.random().toString(36).substring(2, 15));

  input_line.appendChild(input);
  return input_line;
}

// crea un select associato ad un campo di testo
var create_select_and_text = function (etichetta, id, lista) {
  let input_multiline = document.createElement("div");

  let input_line = document.createElement("div");
  input_line.setAttribute("class", "input_line");

  let label_box = document.createElement("div");
  label_box.setAttribute("class", "label_box");
  let label = document.createElement("label");
  label.textContent = etichetta;
  label_box.appendChild(label);
  input_line.appendChild(label_box);

  let select = document.createElement("select");
  select.setAttribute("id", id);

  option = document.createElement("option");
  option.text = "...";
  option.value = "";
  select.appendChild(option);
  for (i = 0; i < lista.length; i++) {
    let option = document.createElement("option");
    option.text = lista[i];
    option.value = lista[i];
    select.appendChild(option);
  }
  option = document.createElement("option");
  option.text = "Altro.. (inserimento manuale)";
  option.value = "altro";
  select.appendChild(option);

  input_line.appendChild(select);
  input_multiline.appendChild(input_line);

  let box = document.createElement("div");
  input_multiline.appendChild(box);

  select.onchange = function(){
    select.setAttribute("id", id);
    while (box.firstChild) {
      box.removeChild(box.firstChild);
    }

    if (this.value === "altro") {
      select.setAttribute("id", "");
      var text_field = create_text_input("Inserire:", id, "");
      box.appendChild(text_field);
    }

    aggiorna_anteprima_da_form();
  };

  return input_multiline;
}

// crea un campo di testo associato ad un checkbox
var create_text_plus = function(etichetta, id, value, type) {
  let input_line = document.createElement("div");
  input_line.setAttribute("class", "input_line nomi_line");
  input_line.setAttribute("id", id);

  let label_box = document.createElement("div");
  label_box.setAttribute("class", "label_box");
  let label = document.createElement("label");
  label.textContent = etichetta;
  label_box.appendChild(label);
  input_line.appendChild(label_box);

  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("id", id);
  input.onkeyup = update;
  if (value) {
    input.setAttribute("value", value);
  };
  input.setAttribute("autocomplete", "nope");
  // aggiunge una stringa random sull'attributo "name" dei campi di testo per disattivare l'autocomplete
  input.setAttribute("name", Math.random().toString(36).substring(2, 15));
  input_line.appendChild(input);


  var checkbox = document.createElement("input");
  var checkbox_label = document.createElement("label");
  checkbox_label.textContent = "specifica";
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("name", id+"_checkbox");
  checkbox.onchange = aggiorna_anteprima_da_form;
  if (type=="spec") {checkbox.setAttribute("checked", "checked");}
  input_line.appendChild(checkbox);
  input_line.appendChild(checkbox_label);

  return input_line;
}





var abbinamento_strutture = [
  {"id" : "#struttura_b1", "ref": "struttura_bold_1"},
  {"id" : "#struttura_b2", "ref": "struttura_bold_2"},
  {"id" : "#struttura_b3", "ref": "struttura_bold_3"},
  {"id" : "#struttura_l1", "ref": "struttura_light_1"},
  {"id" : "#struttura_l2", "ref": "struttura_light_2"},
  {"id" : "#struttura_l3", "ref": "struttura_light_3"}
]

// viene chiamato dall'onchange del selector delle strutture
// ATTENZIONE: FUNZIONE IMPURA - USA VARIABILE "lista_strutture"
var update_struttura = function(index) {
  var struttura = (lista_strutture[index - 1]);
  var disabled = (struttura.option_value==="altro") ? false : true;
  abbinamento_strutture.forEach(function(c) {
    let campo = document.querySelector(c.id);
    campo.value = struttura[c.ref] ? struttura[c.ref] : "";
    campo.disabled = disabled;
  })
  aggiorna_anteprima_da_form();
}











// ----------------------------------------------------
// ------------- FETCHES INFO FROM FORM ---------------
// ----------------------------------------------------

var fetch_one_info = function(selector) {
  let value = document.querySelector(selector) ? document.querySelector(selector).value : "";
  return value;
}

var fetch_nomi = function(parent_selector, line_class) {
  let array = [];

  if (document.querySelector(parent_selector)) {
    let lines = document.querySelector(parent_selector).getElementsByClassName("nomi_line");
    for (var i = 0; i < lines.length; i++) {
      let inputs = lines[i].getElementsByTagName("input");
      let content = inputs[0].value;
      if (inputs[0].value && inputs[1].checked) {
        content = "*" + content;
      }
      array.push(content);
    }
  }
  return array;
}

// Carica informazioni
var  fetch_info_from_form = function() {
  let infos = {}

  infos.St_b1 = ( document.querySelector("#struttura_b1") ? document.querySelector("#struttura_b1").value.replace(/_/g, "\xa0") : "");
  infos.St_b2 = ( document.querySelector("#struttura_b2") ? document.querySelector("#struttura_b2").value.replace(/_/g, "\xa0") : "");
  infos.St_b3 = ( document.querySelector("#struttura_b3") ? document.querySelector("#struttura_b3").value.replace(/_/g, "\xa0") : "");
  infos.St_l1 = ( document.querySelector("#struttura_l1") ? document.querySelector("#struttura_l1").value.replace(/_/g, "\xa0") : "");
  infos.St_l2 = ( document.querySelector("#struttura_l2") ? document.querySelector("#struttura_l2").value.replace(/_/g, "\xa0") : "");
  infos.St_l3 = ( document.querySelector("#struttura_l3") ? document.querySelector("#struttura_l3").value.replace(/_/g, "\xa0") : "");

  infos.Funzioni = [];
  infos.Funzioni.push( document.querySelector("#funzione_1") ? document.querySelector("#funzione_1").value.replace(/_/g, "\xa0") : "");
  infos.Funzioni.push( document.querySelector("#funzione_2") ? document.querySelector("#funzione_2").value.replace(/_/g, "\xa0") : "");
  infos.Funzioni.push( document.querySelector("#funzione_3") ? document.querySelector("#funzione_3").value.replace(/_/g, "\xa0") : "");

  infos.Nomi = fetch_nomi("#nomi_box");

  let nomipiccoli = false;
  if (document.getElementsByName("petit")[0]) {
    if (document.getElementsByName("petit")[0].checked) {
      nomipiccoli = true;
    }
  }
  infos.Nomi_piccoli = nomipiccoli || force_petit_checkbox;

  infos.Annotazioni_1 = "stampa il cartoncino sostituivo dal sito wayfinding.unifi.it"
  infos.Annotazioni_2 = (function(){d = new Date(); return d.getDate()+" | "+(d.getMonth()+1)+" | "+d.getFullYear(); })()

  return [infos];
}











// ----------------------------------------------------
// ------------- FETCHES INFO FROM CSV ----------------
// ----------------------------------------------------

var fetch_info_from_csv = function(data_line) {

  let info = {
    St_b1: data_line.STRUTTURA1a.replace(/_/g, "\xa0"),
    St_b2: data_line.STRUTTURA1b.replace(/_/g, "\xa0"),
    St_b3: data_line.STRUTTURA1c.replace(/_/g, "\xa0"),
    St_l1: data_line.STRUTTURA2a.replace(/_/g, "\xa0"),
    St_l2: data_line.STRUTTURA2b.replace(/_/g, "\xa0"),
    St_l3: data_line.STRUTTURA2c.replace(/_/g, "\xa0"),
    Funzioni: [
      data_line.FUNZIONE1.replace(/_/g, "\xa0"),
      data_line.FUNZIONE2.replace(/_/g, "\xa0"),
      data_line.FUNZIONE3.replace(/_/g, "\xa0")
    ],
    Nomi: [data_line.TEXT1, data_line.TEXT2, data_line.TEXT3, data_line.TEXT4, data_line.TEXT5, data_line.TEXT6, data_line.TEXT7, data_line.TEXT8, data_line.TEXT9, data_line.TEXT10, data_line.TEXT11, data_line.TEXT12, data_line.TEXT13, data_line.TEXT14, data_line.TEXT15],

    Nomi_piccoli: false,

    Annotazioni_1: "stampa il cartoncino sostituivo dal sito wayfinding.unifi.it                     locale: " + data_line.PLESSO + data_line.N,
    Annotazioni_2: (function() {
      d = new Date();
      return d.getDate() + " | " + (d.getMonth() + 1) + " | " + d.getFullYear();
    })()

  }

  if (data_line.NOMIPICCOLI) {
    info.Nomi_piccoli = true;
  }

  return info;
}










// -----------------------------------------------------------
// ---------------- AGGIORNA L'ANTEPRIMA ---------------------
// ------------- (CREA IL PDF CON PDFKIT) --------------------
// -------------- (VISUALIZZA ANTEPRIMA) ---------------------
// ----------(AGGIORNA LINK DOWNLOAD ANTEPRIMA) --------------
// -----------------------------------------------------------


var aggiorna_anteprima_da_form = function() {
  document.querySelector("#page_counter").value = 1;

  compila_pdf(impostazioni_PDF, fetch_info_from_form());
}

var reader = new FileReader();

var aggiorna_anteprima_da_file = function() {
  document.querySelector("#page_counter").value = 1;


  var file = document.querySelector("#file_loader").files[0];

  reader.addEventListener("load", parseFile, false);
  if (file) {
    reader.readAsText(file);
  }
}

var parseFile = function() {

  var parser = d3.dsvFormat(";");
  var data = parser.parse(reader.result);

  // let csv_counter = document.querySelector("#csv_page_counter");
  // data = [ data[csv_counter.value - 1] ];

  console.log("DATA: ");
  console.log(data);
  // chiama compila_pdf
  compila_pdf(impostazioni_PDF, data.map(fetch_info_from_csv));

}



////////////////////////
/// complila il PDF

/**
 * Crea il PDF a partire dalle informazioni
   * @param {object}  info - Le informazioni per il fuoriporta.
   * @param {string}  info.St_b1 - Info struttura
   * @param {string}  info.St_b2 - Info struttura
   * @param {string}  info.St_b3 - Info struttura
   * @param {string}  info.St_l1 - Info struttura
   * @param {string}  info.St_l2 - Info struttura
   * @param {array}   info.Funzioni - Array di stringhe per le funzioni
   * @param {array}   info.Nomi - Array di stringhe (se inizia con asterisco > specifica)
   * @param {boolean} info.Nomi_piccoli - boolean
   * @param {string}  Annotazioni_1 - Allinato a sinistra
   * @param {string}  Annotazioni_2 - Allineato a destra
 */


const compila_pdf = function(pdf_settings, data) {

  console.log ("updating pdf preview with data:");
  console.log (data);

  //////////////////////////////
  // SISTEMA ALCUNE IMPOSTAZIONI

  // Impostazioni colori
  if (document.querySelector("#options-color-black").checked == false) {
    pdf_settings.background = "#fff";
    pdf_settings.foreground = "#000";
    qr_code = qr_code_black;
  }
  if (document.querySelector("#options-color-black").checked == true) {
    pdf_settings.background = "#000";
    pdf_settings.foreground = "#fff";
    qr_code = qr_code_white;
  }

  let page_options = {
    size: [pdf_settings.page_width, pdf_settings.page_height],
    margins: {
      top: pdf_settings.margin_up,
      bottom: 0,
      left: pdf_settings.margin_sx,
      right: pdf_settings.margin_dx
    }
  }

  let strutture_bold_options = {
    width: pdf_settings.left_textbox_width,
    lineGap: pdf_settings.strutture_bold_interlinea - pdf_settings.strutture_bold_corpo*1.2,
    paragraphGap: 0
  };

  let strutture_light_options = {
    width: pdf_settings.left_textbox_width,
    lineGap: pdf_settings.strutture_light_interlinea - pdf_settings.strutture_light_corpo*1.2,
    paragraphGap: 0
  };

  let funzioni_options = {
    width: pdf_settings.left_textbox_width,
    lineGap: pdf_settings.funzioni_interlinea - pdf_settings.funzioni_corpo*1.2,
    paragraphGap: 5
};



//////////////////////////////
// CREA IL PDF DAI DATI


  //Setup PDF document
  doc = new PDFDocument({
    autoFirstPage: false
  });
  let stream = doc.pipe(blobStream())


let info;

for (let page = 0; page < data.length; page++) {
  console.log("Compiling page " + page)

  // Carica i dati giusti per la pagina
  info = data[page];

  // Aggiungi pagina
  doc.addPage(page_options)


      // Crea rettangolo di background
      .rect(0, 0, pdf_settings.page_width, pdf_settings.page_height)
      .fill(pdf_settings.background)


      // Scrive le scritte sul pdf

        // imposta colore
      .fill(pdf_settings.foreground)

        // strutture bold
      .font(pdf_settings.strutture_bold_font, pdf_settings.strutture_bold_corpo)
      .text(info.St_b1, strutture_bold_options)
      .text(info.St_b2, strutture_bold_options)
      .text(info.St_b3, strutture_bold_options)

      // strutture light
      .font(pdf_settings.strutture_light_font, pdf_settings.strutture_light_corpo)
      .text(info.St_l1, strutture_light_options)
      .text(info.St_l2, strutture_light_options)
      .text(info.St_l3, strutture_light_options)

      // questa linea serve come interlinea (brutto ma funziona)
      .font(helvetica65, 10).text(" ")

      // funzioni
      .font(pdf_settings.funzioni_font, pdf_settings.funzioni_corpo)
      info.Funzioni.forEach(function(e) {
        doc.text(e, funzioni_options)
      })




      if (show_qr) {
        doc .image(qr_code, pdf_settings.margin_sx, pdf_settings.altezza_qrcode, {fit: [pdf_settings.lato_qrcode, pdf_settings.lato_qrcode]});
        doc .font(pdf_settings.weblink_font, 10)
        .text(weblink, pdf_settings.margin_sx, pdf_settings.altezza_weblink, {})
      };

      // annotazioni sulla riga in basso
      doc .font(pdf_settings.annotazioni_font, 8)
          .text(info.Annotazioni_1, pdf_settings.margin_sx, pdf_settings.altezza_annotazioni, {})
          .text(info.Annotazioni_2, pdf_settings.margin_sx, pdf_settings.altezza_annotazioni, {align: "right"})





      // nomi e specifiche

      // applica i font ai nomi
      let processedNomi = apply_fonts_to_nomi(info.Nomi, info.Nomi_piccoli, pdf_settings);

      // calcola allineamento verticale
      var calcola_total_height = function() {

        // corregge la posizione dei nomi - non si capisce perché ma sono leggermente sbagliati
        let height = -3;

        processedNomi.forEach(function(nome, index, array) {
          doc.font(pdf_settings.nomi_font, nome.size); // sets fonts for the right calculations
          let h = doc.heightOfString(nome.content, {align: 'right', width: pdf_settings.right_textbox_width, lineGap: nome.interlinea-nome.size*1.2, paragraphGap: nome.spaziosotto});
          height += h;
          if (index === array.length - 1) {
            height -= nome.spaziosotto;
          }
        });
        return height;
      }

      var lines_total_height = calcola_total_height();
      while (lines_total_height > (pdf_settings.page_height-pdf_settings.margin_up-pdf_settings.margin_down + 3)) {
        processedNomi.pop();
        lines_total_height = calcola_total_height();
      }


      // scrive nomi e specifiche
      doc .font(pdf_settings.nomi_font, 1)
          .text("", pdf_settings.page_width - pdf_settings.margin_dx - pdf_settings.right_textbox_width, pdf_settings.page_height - pdf_settings.margin_down - lines_total_height)

      console.log("Numero nomi/specifiche: " + processedNomi.length);
      for (i=0; i < processedNomi.length; i++) {
        let nome = processedNomi[i];
        doc .font(pdf_settings.nomi_font, (nome.size))
            .text(nome.content, {align: 'right', width: pdf_settings.right_textbox_width, lineGap: nome.interlinea-nome.size*1.2, paragraphGap: nome.spaziosotto});
      }






      // Mostra le guide e i margini se necessario
      if (show_margins === true) {

        doc .rect(pdf_settings.margin_sx, pdf_settings.margin_up, (pdf_settings.page_width - pdf_settings.margin_sx - pdf_settings.margin_dx), (pdf_settings.page_height - pdf_settings.margin_up - pdf_settings.margin_down))
            .stroke("red")

            .moveTo(mmToUnits(0), mmToUnits(5))
            .lineTo(pdf_settings.page_width, mmToUnits(5))
            .lineWidth(1)
            .stroke("blue")

            .moveTo(mmToUnits(0), mmToUnits(105))
            .lineTo(pdf_settings.page_width, mmToUnits(105))
            .lineWidth(1)
            .stroke("blue")

            .moveTo(pdf_settings.margin_dx, pdf_settings.page_height - pdf_settings.margin_down)
            .lineTo((pdf_settings.page_width - pdf_settings.margin_dx), pdf_settings.page_height - pdf_settings.margin_down)
            .lineWidth(.5)
            .stroke("yellow")
      }
  }


    // Crea il segno di taglio (bordo grigio) per il ritaglio dei fuoriporta bianchi

    //doc .rect(0, 0, pdf_settings.page_height, pdf_settings.page_width)
    doc .rect(0, 0, pdf_settings.page_width, pdf_settings.page_height)
        .lineWidth(.25)
        .stroke("grey")


  // chiude il pdf
  doc.end();

  // aggiorna link "scarica pdf" e l'anteprima
  stream.on('finish', function() {
    pdf_url = stream.toBlobURL('application/pdf');

    // aggiorna il link "scarica il pdf"
    scaricaPdf_link = document.querySelector("#scarica_link");
    scaricaPdf_link.href = pdf_url;

    // aggiorna la visualizzazione dell'anteprima
    anteprima_pdf_url = pdf_url
    visualize_preview();
  });
}








var apply_fonts_to_nomi = function(nomi, nomipiccoli, font_settings) {

  // elimina le righe vuote in fondo
  for (i=nomi.length-1; i>=0; i--) {
    if (nomi[i] == "") {
      nomi.pop();
    }
    else break
  }

  // sostituisce gli underscore con non breaking space
  nomi = nomi.map(function (nome){
    return nome.replace(/_/g, "\xa0");
  });

  // regola i nomi piccoli
  let a = 1;
  if (nomipiccoli || force_petit_checkbox) {
    a = font_settings.riduzione_nomi_piccoli;
  }

  // crea nuovo array
  let new_nomi = [];

  // effettua la conversione
  for (i = 0; i < nomi.length; i++) {
    let x = nomi[i];
    let spec_dopo_nome = 1;
    if (nomi[i+1] && nomi[i+1].charAt(0) === "*") {
      spec_dopo_nome = 0.25;
    }

    if (x.charAt(0) === "*") {
      x = x.substr(1);
      new_nomi.push({
        content: x,
        size: font_settings.specifica_corpo / a,
        interlinea: font_settings.specifica_interlinea / a,
        spaziosotto: font_settings.specifica_spaziosotto / a
      })
    } else {
      new_nomi.push({
        content: x,
        size: font_settings.nomi_corpo / a,
        interlinea: font_settings.nomi_interlinea / a,
        spaziosotto: font_settings.nomi_spaziosotto / a * spec_dopo_nome
      })
    }
  }
  return new_nomi;
}









// -------------------------------------
// ----- VISUALIZE PDF WITH PDF.JS -----
// -------------------------------------

var visualize_preview = function() {

  var url = anteprima_pdf_url;

  var pageNumber = parseInt(document.querySelector("#page_counter").value);

  var loadingTask = PDFJS.getDocument(url);
  loadingTask.promise.then(function(pdf) {
    console.log('ANTEPRIMA - PDF loaded');

    console.log("ANTEPRIMA - Total pages: " + pdf.numPages);

    // Fetch the first page
    pdf.getPage(pageNumber).then(function(page) {
      console.log('ANTEPRIMA - Page loaded: ' + pageNumber);

      var scale = 5;
      var pageViewport = page.getViewport(scale);

      // Prepare canvas using PDF page dimensions
      var canvas = document.querySelector("#the_canvas");
      var context = canvas.getContext('2d');
      canvas.width = pageViewport.width;
      canvas.height = pageViewport.height;


      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: pageViewport
      };
      var renderTask = page.render(renderContext);
      renderTask.then(function() {
        console.log('ANTEPRIMA - Page rendered');
        anteprima_pdf_numpages = pdf.numPages;
        document.querySelector("#page_num").textContent = "PAGINA: " + pageNumber + " / "+ anteprima_pdf_numpages;
      });
    });
  }, function(reason) {
    // PDF loading error
    console.error(reason);
  });
};



var change_page = function(action) {
  let page_num = document.querySelector("#page_counter");
  console.log("value: " + page_num.value);
  console.log(anteprima_pdf_numpages);


  if (action === "prev") {
    console.log("prev");
      page_num.value--;
  } else if (action === "next") {
    console.log("next");
      page_num.value++;
  } else if (action === "update") {
    console.log("update");
  }

  if (page_num.value > anteprima_pdf_numpages) {
    page_num.value = anteprima_pdf_numpages;
  } if (page_num.value < 1) {
    page_num.value = 1;
  }

  visualize_preview();
}














// ---------------------------------
// ------ LOAD FONTS WITH XHR ------
// ---------------------------------

var inizializza = function() {
  var xhr_to_load = 0;

  // load font helvetica black
  xhr_to_load++;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./fonts/HelveticaNeueLTPro-Blk.otf", true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    helvetica95 = this.response;
    console.log("font loaded");
    xhr_to_load--;
    if (xhr_to_load === 0) {
      async_trigger()
    };
  };
  xhr.send();

  // load font helvetica medium
  xhr_to_load++;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./fonts/HelveticaNeueLTPro-Md.otf", true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    helvetica65 = this.response;
    console.log("font loaded");
    xhr_to_load--;
    if (xhr_to_load === 0) {
      async_trigger()
    };
  };
  xhr.send();

  // load font helvetica light
  xhr_to_load++;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./fonts/HelveticaNeueLTPro-Lt.otf", true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    helvetica45 = this.response;
    console.log("font loaded");
    xhr_to_load--;
    if (xhr_to_load === 0) {
      async_trigger()
    };
  };
  xhr.send();

  /*
  xhr_to_load++;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./images/qr-code-white.jpg", true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    qr_code_white = this.response;
    console.log("font loaded");
    xhr_to_load--;
    if (xhr_to_load === 0) {
      async_trigger()
    };
  };
  xhr.send();

  xhr_to_load++;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "./images/qr-code-black.jpg", true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function(e) {
    qr_code_black = this.response;
    console.log("font loaded");
    xhr_to_load--;
    if (xhr_to_load === 0) {
      async_trigger()
    };
  };
  xhr.send();
*/
}

function async_trigger() {

  // ----------- INIZIALIZZA ---------

  // Impostazioni font
  impostazioni_PDF.strutture_bold_font = helvetica95;
  impostazioni_PDF.strutture_light_font = helvetica45;
  impostazioni_PDF.funzioni_font = helvetica65;
  impostazioni_PDF.nomi_font = helvetica45;
  impostazioni_PDF.weblink_font = helvetica45;
  impostazioni_PDF.annotazioni_font = helvetica45;

  console.log("-- all font loaded --");

  // Key bindings
  document.querySelector("#page_counter").addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      change_page(update);
    }
  });

  document.body.addEventListener("keyup", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 37) {
      change_page("prev");
    } else if (event.keyCode === 39) {
      change_page("next");
    }
  });

  /*
  document.querySelector("#singolo-multiplo").addEventListener("onchange", function(event) {
    alert("change")
  });
  */
  document.querySelector("#multiplo_control").style.display = "none";

  document.getElementsByName("singolo_multiplo").forEach(function(radio) {
    radio.onclick = function() {
      // SWITCH CONTROL FEATURES
      console.log("click: ", this)
      if (this.value === "singolo") {
        console.log("singolo")
        document.querySelector("#multiplo_control").style.display = "none";
        document.querySelector("#singolo_control").style.display = "block";
      } else if (this.value === "multiplo") {
        console.log("multiplo")
        document.querySelector("#multiplo_control").style.display = "block";
        document.querySelector("#singolo_control").style.display = "none";
      }
      // RESET CANVAS + PAGE COUNTER PREVIEW
      var canvas_container = document.querySelector("#canvas_container")
      canvas_container.innerHTML = '';
      var nuovo_canvas = document.createElement("canvas");
      nuovo_canvas.setAttribute("id", "the_canvas");
      canvas_container.appendChild(nuovo_canvas);
      document.querySelector("#page_num").textContent = "";
    }
  })

  // popola il select delle strutture
  populate_select_input(document.querySelector("#struttura_selector"), lista_strutture);
  // visualizza il form
  show_form(1);






  var qr = new QRious();
  qr.value = 'http://www.google.com';
  qr.size = 1000;
  qr_code_black = qr.toDataURL('image/jpeg');
  qr.foreground = "white";
  qr.background = "black";
  qr_code_white = qr.toDataURL('image/jpeg');







  // aggiorna_anteprima_da_form();
}

document.addEventListener('DOMContentLoaded', () => {
  inizializza();
})
