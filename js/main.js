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

// ---------------------------------
// ----------- SETTINGS ------------
// ---------------------------------

// impostazioni PDF, in mm
const show_margins = false;
const force_petit_checkbox = false;

const impostazioni_PDF = {
larg : 200,
alt : 110,
msu : 12,
mgiu : 12,
msx : 10,
mdx : 10,

    corpo_nomi: 30,
    interlinea_nomi: 24,
    spaziosotto_nomi: 8,
    corpo_specifica: 20,

    interlinea_specifica: 16,
    spaziosotto_specifica: 8,
    riduzione_nomi_piccoli: 1.75,

    strutture_bold_font: null,
    strutture_bold_corpo: 25,
    strutture_bold_interlinea: 21,
    strutture_bold_spaziosotto: 0,

    strutture_bold_font: null,
    strutture_light_corpo: 16,
    strutture_light_interlinea: 14,
    strutture_light_spaziosotto: 0,

    funzioni_font: null,
    funzioni_corpo: 20,
    funzioni_interlinea: 18,
    funzioni_spaziosotto: 5,


left_textbox_width : mmToUnits(90),
right_textbox_width : mmToUnits(85),

foreground: "#fff",
background: "#000"
}



// Helper function: converts mm to pdf-units (pt)
function mmToUnits(mm) {
  units = mm * 2.8368794326;
  return units;
}



// ----------------------------------------------------
// ---- FUNCTIONS THAT GENERATES INPUT FIELDS ---------
// ----------------------------------------------------

// aggiorna il pdf in automatico
var timeout = null;
var update = function (e) {
  clearTimeout(timeout);
  timeout = setTimeout(function () {
      aggiorna_anteprima_da_form();
  }, 500);
}




// viene chiamato dall'onchange del selector pincipale
// ATTENZIONE: FUNZIONE IMPURA - CHIAMA "lista_strutture" che è esterno
var show_inputs = function(index) {
  struttura_selezionata = (lista_strutture[index - 1]);
  show_input_fields(text_input_container, struttura_selezionata,);
}

// popola i campi di input sulla base della scelta nel selector principale
var show_input_fields = function(container, struttura) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // crea gli input
  var enabled = (struttura.option_value === "altro") ? true : false;
  var box = document.createElement("div");
  box.setAttribute("class", "input_box");
  box.appendChild( create_text_input(enabled, "Grassetto 1:", "struttura_b1", struttura.struttura_bold_1) );
  box.appendChild( create_text_input(enabled, "Grassetto 2:", "struttura_b2", struttura.struttura_bold_2) );
  box.appendChild( create_text_input(enabled, "Grassetto 3:", "struttura_b3", struttura.struttura_bold_3) );
  box.appendChild( create_text_input(enabled, "Light 1:", "struttura_l1", struttura.struttura_light_1) );
  box.appendChild( create_text_input(enabled, "Light 2:", "struttura_l2", struttura.struttura_light_2) );
  box.appendChild( create_text_input(enabled, "Light 3:", "struttura_l3", struttura.struttura_light_3) );
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

  box.appendChild( create_text_plus("1:", "nome_1", "Letteratura inglese", "spec") );
  box.appendChild( create_text_plus("2:", "nome_2", "", "nome") );
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
  note.innerHTML = "Per lasciare vuota una riga inserire uno spazio.";
  box.appendChild(note);
  container.appendChild(box);

  // aggiorna il PDF
  aggiorna_anteprima_da_form();
}

// -- DA QUI IN POI HELPER FUNCTIONS:

// generic function
// popola un dato select a partire da una lista
// questa viene chiamata durante l'inizializzazione
  var populate_select_input = function (select, lista) {
  let option = document.createElement("option");
  option.setAttribute("selected", "selected");
  option.setAttribute("disabled", "disabled");
  option.label = "...";
  select.appendChild(option);
  for (i = 0; i < lista.length; i++) {
    option = document.createElement("option");
    option.label = lista[i].option_label;
    option.value = lista[i].option_value;
    select.appendChild(option)
  }
}

// return un campo di testo a partire da enabled si/no, etichetta, id, value di precompilazione
var create_text_input = function (enabled, etichetta, id, value) {
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
  if (!enabled) {
    input.setAttribute("disabled", "disabled");
  };
  if (value) {
    input.setAttribute("value", value);
  };
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
  option.label = "...";
  option.value = "";
  select.appendChild(option);
  for (i = 0; i < lista.length; i++) {
    let option = document.createElement("option");
    option.label = lista[i];
    option.value = lista[i];
    select.appendChild(option);
  }
  option = document.createElement("option");
  option.label = "Altro.. (inserimento manuale)";
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
      var text_field = create_text_input(true, "Inserire:", id, "");
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






// ----------------------------------------------------
// ------ CRAZIONE PANNELLO DI CONTROLLO CSV ----------
// ----------------------------------------------------

var change_csv_page = function(action) {
  let csv_counter = document.querySelector("#csv_page_counter");
  console.log("value: " + csv_counter.value);


  if (action === "prev") {
    console.log("prev");
    if (csv_counter.value > 1) {
      csv_counter.value--;
    }
  } else if (action === "next") {
    console.log("next");
    csv_counter.value++;
  }

  aggiorna_anteprima_da_file();
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


  infos.St_b1 = fetch_one_info("#struttura_b1");
  infos.St_b2 = fetch_one_info("#struttura_b2");
  infos.St_b3 = fetch_one_info("#struttura_b3");
  infos.St_l1 = fetch_one_info("#struttura_l1");
  infos.St_l2 = fetch_one_info("#struttura_l2");
  infos.St_l3 = fetch_one_info("#struttura_l3");

  infos.Funzioni = [];
  infos.Funzioni.push( fetch_one_info("#funzione_1") );
  infos.Funzioni.push( fetch_one_info("#funzione_2") );
  infos.Funzioni.push( fetch_one_info("#funzione_3") );

  infos.Nomi = fetch_nomi("#nomi_box");

  let nomipiccoli = false;
  if (document.getElementsByName("petit")[0]) {
    if (document.getElementsByName("petit")[0].checked) {
      nomipiccoli = true;
    }
  }
  infos.Nomi_piccoli = nomipiccoli || force_petit_checkbox;

  infos.Annotazioni_1 = "fuoriporta generato con un file csv dal sito wayfinding.unifi.it"
  infos.Annotazioni_2 = (function(){d = new Date(); return d.getDate()+" | "+(d.getMonth()+1)+" | "+d.getFullYear(); })()

  return [infos];
}








// ----------------------------------------------------
// ------------- FETCHES INFO FROM CSV ----------------
// ----------------------------------------------------

var fetch_info_from_csv = function(data_line) {

  let info = {
    St_b1: data_line.STRUTTURA1a,
    St_b2: data_line.STRUTTURA1b,
    St_b3: data_line.STRUTTURA1c,
    St_l1: data_line.STRUTTURA2a,
    St_l2: data_line.STRUTTURA2b,
    St_l3: data_line.STRUTTURA2c,
    Funzioni: [data_line.FUNZIONE1, data_line.FUNZIONE2, data_line.FUNZIONE3],
    Nomi: [data_line.TEXT1, data_line.TEXT2, data_line.TEXT3, data_line.TEXT4, data_line.TEXT5, data_line.TEXT6, data_line.TEXT7, data_line.TEXT8, data_line.TEXT9, data_line.TEXT10, data_line.TEXT11, data_line.TEXT12, data_line.TEXT13, data_line.TEXT14, data_line.TEXT15],
    Nomi_piccoli: false,

    Annotazioni_1: "fuoriporta generato dal sito wayfinding.unifi.it",
    Annotazioni_2: (function() {
      d = new Date();
      return d.getDate() + " | " + (d.getMonth() + 1) + " | " + d.getFullYear();
    })()
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
  compila_pdf(fetch_info_from_form(), impostazioni_PDF, false);
}

var reader = new FileReader();

var aggiorna_anteprima_da_file = function() {

  var file = document.querySelector("#file_loader").files[0];

  reader.addEventListener("load", parseFile, false);
  if (file) {
    reader.readAsText(file);
  }
}

var parseFile = function() {

  var parser = d3.dsvFormat(";");
  var data = parser.parse(reader.result);

  let csv_counter = document.querySelector("#csv_page_counter");
  data = [ data[csv_counter.value - 1] ];

  console.log("DATA: ");
  console.log(data);
  // chiama compila_pdf
  compila_pdf(data.map(fetch_info_from_csv), impostazioni_PDF, false);

}




var aggiorna_anteprima_da_csv = function() {

  var csv_url = "./import.csv";

  d3.dsv(";", csv_url).then(function(data) {
    // riduce il csv ad un'unica pagina
    let csv_counter = document.querySelector("#csv_page_counter");
    data = [ data[csv_counter.value - 1] ];
    console.log("DATA: ");
    console.log(data);
    // chiama compila_pdf
    compila_pdf(data.map(fetch_info_from_csv), impostazioni_PDF, false);
  })
}



var pdf_multipagina_da_csv = function() {
  d3.dsv(";", "./import.csv").then(function(data) {

    compila_pdf(data.map(fetch_info_from_csv), impostazioni_PDF, true);
  })
}


////////////////////////
/// complila il PDF

/**
 * Crea il PDF a partire dalle informazioni
   * @param {object} info - Le informazioni per il fuoriporta.
   * @param {string} info.St_b1 - Info struttura
   * @param {string} info.St_b2 - Info struttura
   * @param {string} info.St_b3 - Info struttura
   * @param {string} info.St_l1 - Info struttura
   * @param {string} info.St_l2 - Info struttura
   * @param {array} info.Funzioni - Array di stringhe per le funzioni
   * @param {array} info.Nomi - Array di stringhe
   * @param {boolean} info.Nomi_piccoli - boolean
   * @param {string} Annotazioni_1 - Allinato a sinistra
   * @param {string} Annotazioni_2 - Allineato a destra
   * @return {object} compiled PDF
 */


const compila_pdf = function(data, pdf_settings, multipagina) {

  console.log ("updating pdf preview with data:");
  console.log (data);

  //////////////////////////////
  // SISTEMA ALCUNE IMPOSTAZIONI

  // Impostazioni colori
  if (document.querySelector("#options-color-black").checked == false) {
    pdf_settings.background = "#fff";
    pdf_settings.foreground = "#000";
}

let page_options = {
  size: [mmToUnits(pdf_settings.larg), mmToUnits(pdf_settings.alt)],
  margins: {
    top: mmToUnits(pdf_settings.msu),
    bottom: 0,
    left: mmToUnits(pdf_settings.msx),
    right: mmToUnits(pdf_settings.mdx)
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
      .rect(0, 0, mmToUnits(pdf_settings.larg), mmToUnits(pdf_settings.alt))
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
      .font(helvetica65, 8.5).text(" ")

      // funzioni
      .font(pdf_settings.funzioni_font, pdf_settings.funzioni_corpo)
      info.Funzioni.forEach(function(e) {
        doc.text(e, funzioni_options)
      })

      // annotazioni sulla riga in basso
      doc.font(helvetica45, 8)
          .text(info.Annotazioni_1, mmToUnits(pdf_settings.msx), mmToUnits(106), {})
          .text(info.Annotazioni_2, mmToUnits(pdf_settings.msx), mmToUnits(106), {align: "right"})









      // nomi e specifiche

      // applica i font ai nomi
      let processedNomi = apply_fonts_to_nomi(info.Nomi, info.Nomi_piccoli, pdf_settings);

      // calcola allineamento verticale
      let lines_total_height = 0;

      processedNomi.forEach(function(nome) {
        doc.font(helvetica45, nome.size); // sets fonts for the right calculations
        let h = doc.heightOfString(nome.content, {align: 'right', width: pdf_settings.right_textbox_width, lineGap: nome.interlinea-nome.size*1.2, paragraphGap: nome.spaziosotto});
        // console.log (w,h);
        lines_total_height += h;
      });
      // qui c'è un bug: l'ultima riga non è l'ultima con un contenuto, ma l'ultima in assoluto
      if (processedNomi.length > 0) {
        lines_total_height -= processedNomi[processedNomi.length - 1].spaziosotto;
      }


      // scrive nomi e specifiche
      doc .font(helvetica45, 1)
          .text("", mmToUnits(pdf_settings.larg - pdf_settings.mdx) - pdf_settings.right_textbox_width, mmToUnits(pdf_settings.msu) + 245 - lines_total_height)

      console.log("Numero nomi/specifiche: " + processedNomi.length);
      for (i=0; i < processedNomi.length; i++) {
        let nome = processedNomi[i];
        doc .font(helvetica45, (nome.size))
            .text(nome.content, {align: 'right', width: pdf_settings.right_textbox_width, lineGap: nome.interlinea-nome.size*1.2, paragraphGap: nome.spaziosotto});
      }










      // Mostra le guide e i margini se necessario
      if (show_margins === true) {

        doc .rect(mmToUnits(pdf_settings.msx), mmToUnits(pdf_settings.msu), mmToUnits(pdf_settings.larg - pdf_settings.msx - pdf_settings.mdx), mmToUnits(pdf_settings.alt - pdf_settings.msu - pdf_settings.mgiu))
            .stroke("red")

            .moveTo(mmToUnits(0), mmToUnits(5))
            .lineTo(mmToUnits(pdf_settings.larg), mmToUnits(5))
            .lineWidth(1)
            .stroke("blue")

            .moveTo(mmToUnits(0), mmToUnits(105))
            .lineTo(mmToUnits(pdf_settings.larg), mmToUnits(105))
            .lineWidth(1)
            .stroke("blue")

            .moveTo(mmToUnits(pdf_settings.msx), mmToUnits(100))
            .lineTo(mmToUnits(pdf_settings.larg - pdf_settings.mdx), mmToUnits(100))
            .lineWidth(.5)
            .stroke("yellow")
      }
  }

  // chiude il pdf
  doc.end();

  // aggiorna link "scarica pdf" e l'anteprima
  stream.on('finish', function() {
    pdf_url = stream.toBlobURL('application/pdf');

    // aggiorna il link "scarica il pdf"
    scaricaPdf_link = document.querySelector("#scarica_link");
    scaricaPdf_link.href = pdf_url;

    // aggiorna la visualizzazione dell'anteprima
    visualize_preview(pdf_url);
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

  // regola i nomi piccoli
  let a = 1;
  if (nomipiccoli || force_petit_checkbox) {
    a = font_settings.riduzione_nomi_piccoli;
  }

  // regola lo spazio tra nome e specifica
  let spec_dopo_nome = 1;

  // crea nuovo array
  let new_nomi = [];

  // effettua la conversione
  for (i = 0; i < nomi.length; i++) {
    let x = nomi[i];
    if (nomi[i+1] && nomi[i+1].charAt(0) === "*") {
      spec_dopo_nome = 0.25;
    }

    if (x.charAt(0) === "*") {
      x = x.substr(1);
      new_nomi.push({
        content: x,
        size: font_settings.corpo_specifica / a,
        interlinea: font_settings.interlinea_specifica / a,
        spaziosotto: font_settings.spaziosotto_specifica / a
      })
    } else {
      new_nomi.push({
        content: x,
        size: font_settings.corpo_nomi / a,
        interlinea: font_settings.interlinea_nomi / a,
        spaziosotto: font_settings.spaziosotto_nomi / a * spec_dopo_nome
      })
    }
  }
  return new_nomi;
}









// -------------------------------------
// ----- VISUALIZE PDF WITH PDF.JS -----
// -------------------------------------

var visualize_preview = function(url, page) {

  let pageNumber = page ? page : 1;

  var loadingTask = PDFJS.getDocument(url);
  loadingTask.promise.then(function(pdf) {
    console.log('ANTEPRIMA - PDF loaded');

    console.log("ANTEPRIMA - Total pages: " + pdf.numPages);

    // Fetch the first page
    pdf.getPage(pageNumber).then(function(page) {
      console.log('ANTEPRIMA - Page loaded: ' + pageNumber);

      var scale = 5;
      var viewport = page.getViewport(scale);

      // Prepare canvas using PDF page dimensions
      var canvas = document.querySelector("#the-canvas");
      var context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);
      renderTask.then(function() {
        console.log('ANTEPRIMA - Page rendered');
      });
    });
  }, function(reason) {
    // PDF loading error
    console.error(reason);
  });
};
















// ---------------------------------
// ------ LOAD FONTS WITH XHR ------
// ---------------------------------

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

function async_trigger() {

  // Impostazioni font
  impostazioni_PDF.strutture_bold_font = helvetica95;
  impostazioni_PDF.strutture_light_font = helvetica45;
  impostazioni_PDF.funzioni_font = helvetica65;

  console.log("-- all font loaded --");


  // ---------------------------------
  // ----------- INIZIALIZZA ---------
  // ---------------------------------

  populate_select_input(document.querySelector("#struttura_selector"), lista_strutture);




  // uncomment this for production
  // aggiorna_anteprima_da_form();

  // comment this for production
  struttura_selector.selectedIndex = 1; show_inputs(1);
};
