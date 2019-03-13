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

function create_text_input(container, enabled, etichetta, id, value, ) {
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


function popola_info_struttura() {
  let index = struttura_selector.selectedIndex;
  console.log("index: " + index);
  struttura_selezionata = (lista_strutture[index - 1]);
  show_text_fields(struttura_selezionata, text_input_container);
}


function show_text_fields(struttura, container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  // crea gli input
  append_input_strutture(container, struttura);
  append_inputs_funzioni(container);
  append_inputs_nomi(container);

  // aggiunge nota in fondo
  let note = document.createElement("h6");
  note.innerHTML = "Per lasciare vuota una riga inserire uno spazio.";
  container.appendChild(note);
  // aggiorna il PDF
  aggiorna_pdf();
}

function append_input_strutture(container, strutt) {
  enabled = (strutt.option_ref === "Libera") ? true : false;
  create_text_input(container, enabled, "Struttura Bold 1:", "struttura_b1", strutt.struttura_bold_1);
  create_text_input(container, enabled, "Struttura Bold 2:", "struttura_b2", strutt.struttura_bold_2);
  create_text_input(container, enabled, "Struttura Bold 3:", "struttura_b3", strutt.struttura_bold_3);
  create_text_input(container, enabled, "Struttura Light 1:", "struttura_l1", strutt.struttura_light_1);
  create_text_input(container, enabled, "Struttura Light 2:", "struttura_l2", strutt.struttura_light_2);
}

function append_inputs_funzioni(container) {
  let box = document.createElement("div");
  box.setAttribute("class", "input_box");
  create_text_input(box, true, "Funzione 1:", "funzione_1", "Funzione 1");
  create_text_input(box, true, "Funzione 2:", "funzione_2", "Funzione 2");
  create_text_input(box, true, "Funzione 3:", "funzione_3", "Funzione 3");
  container.appendChild(box);
}

function append_inputs_nomi(container) {
  create_text_input(container, true, "Nome 1:", "nome_1", "Nome 1");
  create_text_input(container, true, "Nome 2:", "nome_2", "");
  create_text_input(container, true, "Nome 3:", "nome_3", "");
  create_text_input(container, true, "Nome 4:", "nome_4", "");
  create_text_input(container, true, "Nome 5:", "nome_5", "");
  create_text_input(container, true, "Nome 6:", "nome_6", "");
  create_text_input(container, true, "Nome 7:", "nome_7", "");
  create_text_input(container, true, "Specifica:", "specifica", "Specifica");
}






// ----------------------------------------------------
// ---- FETCH INFO FROM INPUT FIELDS TO OBJECT --------
// ----------------------------------------------------

// Carica informazioni
function fetch_info() {
  let infos = {}

  infos.St_b1 = document.querySelector("#struttura_b1") ? document.querySelector("#struttura_b1").value : "";
  infos.St_b2 = document.querySelector("#struttura_b2") ? document.querySelector("#struttura_b2").value : "";
  infos.St_b3 = document.querySelector("#struttura_b3") ? document.querySelector("#struttura_b3").value : "";
  infos.St_l1 = document.querySelector("#struttura_l1") ? document.querySelector("#struttura_l1").value : "";
  infos.St_l2 = document.querySelector("#struttura_l2") ? document.querySelector("#struttura_l2").value : "";

  infos.Fu_1 = document.querySelector("#funzione_1") ? document.querySelector("#funzione_1").value : "";
  infos.Fu_2 = document.querySelector("#funzione_2") ? document.querySelector("#funzione_2").value : "";
  infos.Fu_3 = document.querySelector("#funzione_3") ? document.querySelector("#funzione_3").value : "";

  infos.Nomi = [];
  infos.Nomi[0] = document.querySelector("#nome_1") ? document.querySelector("#nome_1").value : "";
  infos.Nomi[1] = document.querySelector("#nome_2") ? document.querySelector("#nome_2").value : "";
  infos.Nomi[2] = document.querySelector("#nome_3") ? document.querySelector("#nome_3").value : "";
  infos.Nomi[3] = document.querySelector("#nome_4") ? document.querySelector("#nome_4").value : "";
  infos.Nomi[4] = document.querySelector("#nome_5") ? document.querySelector("#nome_5").value : "";
  infos.Nomi[5] = document.querySelector("#nome_6") ? document.querySelector("#nome_6").value : "";
  infos.Nomi[6] = document.querySelector("#nome_7") ? document.querySelector("#nome_7").value : "";
  infos.Nomi[7] = document.querySelector("#specifica") ? document.querySelector("#specifica").value : "";

  return infos;
}




// ---------------------------------
// ---- CREATE PDF WITH PDFKIT -----
// ---------------------------------

// Main function: aggiorna pdf e visualizza anteprima
function aggiorna_pdf() {
  crea_pdf(fetch_info());
}


// Main functionality: creates pdf from info object
function crea_pdf(info) {

  // Impostazioni layout
  let left_textbox_width = mmToUnits(130);
  let right_textbox_width = mmToUnits(90);

  // Impostazioni colori
  let pdf_background = "#fff";
  let pdf_foreground = "#000";
  if (document.querySelector("#options-color-black").checked == true) {
    pdf_background = "#000";
    pdf_foreground = "#fff";
}
  // NOMI: carattere 20/16pt spazio sotto 4pt
  var nomi_options = {
    align: 'right',
    width: right_textbox_width,
    lineGap: -8,
    paragraphGap: 4
  };

  // NOMI: carattere 20/16pt spazio sotto 4pt
  var strutture_options = {
    align: 'right',
    width: left_textbox_width,
    lineGap: -8,
    paragraphGap: 4
  };



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

  // Mostra i margini se necessario
  if (document.querySelector("#options-margins").checked === true) {

    doc .rect(mmToUnits(pdf_msx), mmToUnits(pdf_msu), mmToUnits(pdf_larg - pdf_msx - pdf_mdx), mmToUnits(pdf_alt - pdf_msu - pdf_mgiu))
        .fill("red")

        .moveTo(0, mmToUnits(38))
        .lineTo(mmToUnits(200), mmToUnits(38))
        .lineWidth(.5)
        .stroke("black")

        .moveTo(0, mmToUnits(40.7))
        .lineTo(mmToUnits(200), mmToUnits(40.7))
        .lineWidth(.5)
        .stroke("black")

        .moveTo(0, mmToUnits(95))
        .lineTo(mmToUnits(200), mmToUnits(95))
        .lineWidth(.5)
        .stroke("black")

        .moveTo(0, mmToUnits(5))
        .lineTo(mmToUnits(200), mmToUnits(5))
        .lineWidth(1)
        .stroke("blue")

        .moveTo(0, mmToUnits(105))
        .lineTo(mmToUnits(200), mmToUnits(105))
        .lineWidth(1)
        .stroke("blue");
  }


    // Crea rettangolo di background
  doc.rect(0, 0, mmToUnits(pdf_larg), mmToUnits(pdf_alt))
    .fill(pdf_background)


  // Calcola allineamento parte destra
  doc.font(helvetica75, 20); // sets ght fonts for the right calculations
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
        width: left_textbox_width,
        paragraphGap: mmToUnits(-3.4)
      })
      .text(info.St_b2, {
        width: left_textbox_width,
        paragraphGap: mmToUnits(-3.4)
      })
      .text(info.St_b3, {
        width: left_textbox_width,
        paragraphGap: mmToUnits(-3)
      })
      .font(helvetica45, 18)
      .text(info.St_l1, {
        width: left_textbox_width,
        paragraphGap: mmToUnits(-1)
      })
      .text(info.St_l2, {
        width: left_textbox_width,
        paragraphGap: mmToUnits(0)
      })
      .font(helvetica65, 2).text(" ") // questa linea serve come interlinea (brutto ma funziona)
      .font(helvetica65, 20)
      .text(info.Fu_1, {
        width: left_textbox_width,
        lineGap: mmToUnits(-1.4)
      })
      .text(info.Fu_2, {
        width: left_textbox_width,
        lineGap: mmToUnits(-1.4)
      })
      .text(info.Fu_3, {
        width: left_textbox_width,
        lineGap: mmToUnits(-1.4)
      })

      .font(helvetica75, 20)
      .text(info.Nomi[0], mmToUnits(pdf_larg - pdf_mdx) - right_textbox_width, mmToUnits(pdf_msu) + offset, nomi_options)
      .text(info.Nomi[1], nomi_options)
      .text(info.Nomi[2], nomi_options)
      .text(info.Nomi[3], nomi_options)
      .text(info.Nomi[4], nomi_options)
      .text(info.Nomi[5], nomi_options)
      .text(info.Nomi[6], nomi_options)

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


// ---------------------------------
// ----- VISUALIZE WITH PDF.JS -----
// ---------------------------------

function aggiorna_preview(url) {
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
    struttura_bold_2: "Cesare Alfieri",
  },
  {
    option_ref: "ScEconomia",
    option_name: "Scuola di Economia e Management",
    struttura_bold_1: "Scuola di",
    struttura_bold_2: "Economia e Management",
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

var struttura_selector;
var text_input_container;

document.addEventListener("DOMContentLoaded", function(event) {
  struttura_selector = document.querySelector("#struttura_selector");
  text_input_container = document.querySelector("#text_input_container");
  populate_select_input(struttura_selector, lista_strutture);
});
