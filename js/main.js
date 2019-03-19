// -------------------------------------
// ----------- DEPENDENCIES ------------
// -------------------------------------
/*
pdf-worker.js   required for pdf creation
blob-stream.js  required for writing to blob stream
pdf.js          required for preview visualization
pdf.worker.js   comes together with pdf.js
*/

PDFJS.workerSrc = 'js/pdf.worker.js';


// ---------------------------------
// ----------- SETTINGS ------------
// ---------------------------------

// impostazioni PDF, in mm
var pdf_larg = 200;
var pdf_alt = 110;

var pdf_msu = 12;
var pdf_mgiu = 10;

var pdf_msx = 10;
var pdf_mdx = 10;

// Helper function: converts mm to pdf-units (pt)
function mmToUnits(mm) {
  units = mm * 2.8368794326;
  return units;
}



// ----------------------------------------------------
// ---- FUNCTIONS THAT GENERATES INPUT FIELDS ---------
// ----------------------------------------------------



// popola un dato select a partire da una lista
// questa viene chiamata durante l'inizializzazione
var populate_select_input = function (selector, lista) {
  first_option = document.createElement("option");
  first_option.setAttribute("selected", "selected");
  first_option.setAttribute("disabled", "disabled");
  first_option.innerHTML = "...";
  selector.appendChild(first_option);
  for (i = 0; i < lista.length; i++) {
    var option = document.createElement("option");
    option.value = lista[i].option_ref;
    option.innerHTML = lista[i].option_name;
    selector.appendChild(option)
  };
}

// viene chiamato dall'onchange del selector pincipale
// ATTENZIONE: FUNZIONE IMPURA - CHIAMA "lista_strutture" che è esterno
var show_inputs = function(index) {
  struttura_selezionata = (lista_strutture[index - 1]);
  show_input_fields(text_input_container, struttura_selezionata,);
}




// -- DA QUI IN POI HELPER FUNCTIONS:

// crea un campo di testo a partire da container, enabled si/no, etichetta, id, value di precompilazione
var create_text_input2 = function (container, enabled, etichetta, id, value, ) {
  var label = document.createElement("label");
  label.textContent = etichetta;
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "input_field");
  input.setAttribute("id", id);
  if (!enabled) {
    input.setAttribute("disabled", "disabled");
  };
  if (value) {
    input.setAttribute("value", value);
  };
  input.setAttribute("autocomplete", "nope");
  label.appendChild(input);
  container.appendChild(label);
}

var create_text_input = function (enabled, etichetta, id, value, ) {
  var label = document.createElement("label");
  label.textContent = etichetta;
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "input_field");
  input.setAttribute("id", id);
  if (!enabled) {
    input.setAttribute("disabled", "disabled");
  };
  if (value) {
    input.setAttribute("value", value);
  };
  input.setAttribute("autocomplete", "nope");
  label.appendChild(input);
  return label;
}


// crea un select associato ad un campo di testo
var create_select_and_text = function (container, etichetta, id, lista) {
  var label = document.createElement("label");
  label.textContent = etichetta;

  create_text_input(container, true, "someEtichetta", "someId", "someText")
}


// popola i campi di input sulla base della scelta nel selector principale
var show_input_fields = function(container, struttura) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // crea gli input
  var enabled = (struttura.option_ref === "Libera") ? true : false;
  container.appendChild( create_text_input(enabled, "Struttura Bold 1:", "struttura_b1", struttura.struttura_bold_1) );
  container.appendChild( create_text_input(enabled, "Struttura Bold 2:", "struttura_b2", struttura.struttura_bold_2) );
  container.appendChild( create_text_input(enabled, "Struttura Bold 3:", "struttura_b3", struttura.struttura_bold_3) );
  container.appendChild( create_text_input(enabled, "Struttura Light 1:", "struttura_l1", struttura.struttura_light_1) );
  container.appendChild( create_text_input(enabled, "Struttura Light 2:", "struttura_l2", struttura.struttura_light_2) );

  let box = document.createElement("div");
  box.setAttribute("class", "input_box");
  box.appendChild( create_text_input(true, "Funzione 1:", "funzione_1", "Responsabile amministrativo") );
  box.appendChild( create_text_input(true, "Funzione 2:", "funzione_2", "") );
  box.appendChild( create_text_input(true, "Funzione 3:", "funzione_3", "") );
  container.appendChild(box);

  container.appendChild( create_text_input(true, "Nome 1:", "nome_1", "Barbara Napolitano") );
  container.appendChild( create_text_input(true, "Nome 2:", "nome_2", "") );
  container.appendChild( create_text_input(true, "Nome 3:", "nome_3", "") );
  container.appendChild( create_text_input(true, "Nome 4:", "nome_4", "") );
  container.appendChild( create_text_input(true, "Nome 5:", "nome_5", "") );
  container.appendChild( create_text_input(true, "Specifica:", "specifica", "") );


  // aggiunge nota in fondo
  let note = document.createElement("h6");
  note.innerHTML = "Per lasciare vuota una riga inserire uno spazio.";
  container.appendChild(note);
  // aggiorna il PDF
  aggiorna_pdf();
}






// ----------------------------------------------------
// ---- FETCH INFO FROM INPUT FIELDS TO OBJECT --------
// ----------------------------------------------------


var fetch_one_info = function (selector) {
  value = document.querySelector(selector) ? document.querySelector(selector).value : "";
  return value;
}


// Carica informazioni
var  fetch_info = function() {
  let infos = {}

  infos.St_b1 = fetch_one_info("#struttura_b1");
  infos.St_b2 = fetch_one_info("#struttura_b2");
  infos.St_b3 = fetch_one_info("#struttura_b3");
  infos.St_l1 = fetch_one_info("#struttura_l1");
  infos.St_l2 = fetch_one_info("#struttura_l2");

  infos.Funzioni = [];
  infos.Funzioni[0] = fetch_one_info("#funzione_1").toLowerCase();
  infos.Funzioni[1] = fetch_one_info("#funzione_2").toLowerCase();
  infos.Funzioni[2] = fetch_one_info("#funzione_3").toLowerCase();

  infos.Nomi = [];
  infos.Nomi[0] = fetch_one_info("#nome_1");
  infos.Nomi[1] = fetch_one_info("#nome_2");
  infos.Nomi[2] = fetch_one_info("#nome_3");
  infos.Nomi[3] = fetch_one_info("#nome_4");
  infos.Nomi[4] = fetch_one_info("#nome_5");

  infos.Nomi[7] = fetch_one_info("#specifica");

  return infos;
}




// ---------------------------------
// ---- CREATE PDF WITH PDFKIT -----
// ---------------------------------

/**
 * Aggiorna il PDF sia nell'anteprima che nel blog che può essere scaricato
 */

 var  aggiorna_pdf = function() {
  crea_pdf(fetch_info());
}




/**
 * Crea il PDF a partire dalle informazioni
 * @param {object} title - Le informazioni per il fuoriporta.
 */

var crea_pdf = function(info) {

  // Impostazioni layout
  let strutture_textbox_width = mmToUnits(180);
  let funzioni_textbox_width = mmToUnits(130);
  let right_textbox_width = mmToUnits(90);

  // Impostazioni colori
  let pdf_background = "#fff";
  let pdf_foreground = "#000";
  if (document.querySelector("#options-color-black").checked == true) {
    pdf_background = "#000";
    pdf_foreground = "#fff";
}


  // FUNZIONI
  var funzioni_options = {
    width: funzioni_textbox_width,
    lineGap: -4,
  };

  // NOMI ORIGINALE: carattere 20/16pt spazio sotto 4pt
  var corpo_nomi = 20;
  var nomi_options = {
    align: 'right',
    width: right_textbox_width,
    lineGap: -8,
    paragraphGap: 4
  };

  /* NOMI ORIGINALE: carattere 26/25pt spazio sotto 4pt
  var corpo_nomi = 26;
  var nomi_options = {
    align: 'right',
    width: right_textbox_width,
    lineGap: -6,
    paragraphGap: 6
  };
  */

  //Setup PDF document
  doc = new PDFDocument({
    autoFirstPage: false
  });
  stream = doc.pipe(blobStream())

  // Aggiungi pagina
  doc.addPage({
    size: [mmToUnits(pdf_larg), mmToUnits(pdf_alt)],
    margins: {
      top: mmToUnits(pdf_msu),
      bottom: mmToUnits(pdf_mgiu),
      left: mmToUnits(pdf_msx),
      right: mmToUnits(pdf_mdx)
    }
  });

  // Crea rettangolo di background
doc.rect(0, 0, mmToUnits(pdf_larg), mmToUnits(pdf_alt))
  .fill(pdf_background)


  // Mostra le guide se necessario
  if (document.querySelector("#options-margins").checked === true) {

    doc .rect(mmToUnits(pdf_msx), mmToUnits(pdf_msu), mmToUnits(pdf_larg - pdf_msx - pdf_mdx), mmToUnits(pdf_alt - pdf_msu - pdf_mgiu))
        .stroke("red")

        .moveTo(mmToUnits(0), mmToUnits(5))
        .lineTo(mmToUnits(pdf_larg), mmToUnits(5))
        .lineWidth(1)
        .stroke("blue")

        .moveTo(mmToUnits(0), mmToUnits(105))
        .lineTo(mmToUnits(pdf_larg), mmToUnits(105))
        .lineWidth(1)
        .stroke("blue")

        .moveTo(mmToUnits(pdf_msx), mmToUnits(38))
        .lineTo(mmToUnits(pdf_larg - pdf_mdx), mmToUnits(38))
        .lineWidth(.5)
        .stroke("green")

        .moveTo(mmToUnits(pdf_msx), mmToUnits(40.7))
        .lineTo(mmToUnits(pdf_larg - pdf_mdx), mmToUnits(40.7))
        .lineWidth(.5)
        .stroke("green")

        .moveTo(mmToUnits(pdf_msx), mmToUnits(95))
        .lineTo(mmToUnits(pdf_larg - pdf_mdx), mmToUnits(95))
        .lineWidth(.5)
        .stroke("green")
  }



  // Calcola allineamento parte destra
  doc.font(helvetica75, corpo_nomi); // sets ght fonts for the right calculations
  let lines_total_height = 0;
  info.Nomi.forEach(function(e) {
    let w = doc.widthOfString(e, nomi_options);
    let h = doc.heightOfString(e, nomi_options);
    lines_total_height += doc.heightOfString(e, nomi_options)
  });
  offset = 241 - lines_total_height;

  // Scrivi le scritte sul pdf
  doc .fill(pdf_foreground)
      .font(helvetica95, 30)
      .text(info.St_b1, {
        width: strutture_textbox_width,
        paragraphGap: mmToUnits(-3.4)
      })
      .text(info.St_b2, {
        width: strutture_textbox_width,
        paragraphGap: mmToUnits(-3.4)
      })
      .text(info.St_b3, {
        width: strutture_textbox_width,
        paragraphGap: mmToUnits(-3)
      })
      .font(helvetica45, 18)
      .text(info.St_l1, {
        width: strutture_textbox_width,
        paragraphGap: mmToUnits(-1)
      })
      .text(info.St_l2, {
        width: strutture_textbox_width,
        paragraphGap: mmToUnits(0)
      })

      .font(helvetica65, 2).text(" ") // questa linea serve come interlinea (brutto ma funziona)
      .font(helvetica65, 20)

      .text(info.Funzioni[0], funzioni_options)
      .text(info.Funzioni[1], funzioni_options)
      .text(info.Funzioni[2], funzioni_options)

      .font(helvetica75, corpo_nomi)
      .text(info.Nomi[0], mmToUnits(pdf_larg - pdf_mdx) - right_textbox_width, mmToUnits(pdf_msu) + offset, nomi_options)
      .text(info.Nomi[1], nomi_options)
      .text(info.Nomi[2], nomi_options)
      .text(info.Nomi[3], nomi_options)
      .text(info.Nomi[4], nomi_options)

      .font(helvetica45, 20)
      .text(info.Nomi[7], nomi_options)

  // chiude il pdf
      .end();

  // aggiorna link "scarica pdf" e l'anteprima
  stream.on('finish', function() {
    pdf_url = stream.toBlobURL('application/pdf')
    scaricaPdf_link = document.querySelector("#scarica_link");
    scaricaPdf_link.href = pdf_url;
    aggiorna_preview(pdf_url);
  });
}




// -------------------------------------
// ----- VISUALIZE PDF WITH PDF.JS -----
// -------------------------------------

var aggiorna_preview = function(url) {
  var loadingTask = PDFJS.getDocument(url);
  loadingTask.promise.then(function(pdf) {
    console.log('PDF loaded');

    // Fetch the first page
    var pageNumber = 1;
    pdf.getPage(pageNumber).then(function(page) {
      console.log('Page loaded');

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
        console.log('Page rendered');
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

// load font helvetica bold
xhr_to_load++;
var xhr = new XMLHttpRequest();
xhr.open("GET", "./fonts/HelveticaNeueLTPro-Bd.otf", true);
xhr.responseType = "arraybuffer";
xhr.onload = function(e) {
  helvetica75 = this.response;
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
  aggiorna_pdf();
};







var lista_strutture = [{
    option_ref: "DipDISEI",
    option_name: "DISEI",
    struttura_bold_1: "DISEI",
    struttura_light_1: "Dipartimento di",
    struttura_light_2: "Scienze per l'Economia e per l'Impresa"
  },
  {
    option_ref: "DipDSG",
    option_name: "DSG",
    struttura_bold_1: "DSG",
    struttura_light_1: "Dipartimento di",
    struttura_light_2: "Scienze Giuridiche"
  },
  {
    option_ref: "DipDSPS",
    option_name: "DSPS",
    struttura_bold_1: "DSPS",
    struttura_light_1: "Dipartimento di",
    struttura_light_2: "Scienze Politiche e Sociali"
  },
  {
    option_ref: "ScGiuripsrudenza",
    option_name: "Scuola di Giuripsrudenza",
    struttura_bold_1: "Scuola di",
    struttura_bold_2: "Giurisprudenza",
  },
  {
    option_ref: "ScScienzePolitiche",
    option_name: "Scuola di Scienze Politiche",
    struttura_bold_1: "Scuola di",
    struttura_bold_2: "Scienze Politiche",
    struttura_bold_3: "Cesare Alfieri",
  },
  {
    option_ref: "ScEconomia",
    option_name: "Scuola di Economia e Management",
    struttura_bold_1: "Scuola di",
    struttura_bold_2: "Economia e",
    struttura_bold_3: "Management",
  },
  {
    option_ref: "Libera",
    option_name: "-- Compilazione libera --",
    struttura_bold_1: "Struttura Bold 1",
    struttura_bold_2: "Struttura Bold 2",
    struttura_bold_3: "Struttura Bold 3",
    struttura_light_1: "Struttuera Light 1",
    struttura_light_2: "Struttura Light 2"
  }
];





// ---------------------------------
// ----------- INIZIALIZZA ---------
// ---------------------------------

document.addEventListener("DOMContentLoaded", function(event) {
  var struttura_selector = document.querySelector("#struttura_selector");
  var text_input_container = document.querySelector("#text_input_container");
  populate_select_input(struttura_selector, lista_strutture);
});
