// -------------------------------------
// ----------- DEPENDENCIES ------------
// -------------------------------------
/*
pdfkit.js       required for pdf creation
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

// viene chiamato dall'onchange del selector pincipale
// ATTENZIONE: FUNZIONE IMPURA - CHIAMA "lista_strutture" che è esterno
var show_inputs = function(index) {
  struttura_selezionata = (lista_strutture[index - 1]);
  show_input_fields(text_input_container, struttura_selezionata,);
}

var timeout = null;
var update = function (e) {
  clearTimeout(timeout);
  timeout = setTimeout(function () {
      aggiorna_pdf();
  }, 500);
}

// -- DA QUI IN POI HELPER FUNCTIONS:

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

    aggiorna_pdf();
  };

  return input_multiline;
}


var create_text_plus = function(etichetta, id, value, type) {
  let input_line = document.createElement("div");
  input_line.setAttribute("class", "input_line");
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
  checkbox.onchange = aggiorna_pdf;
  if (type=="spec") {checkbox.setAttribute("checked", "checked");}
  input_line.appendChild(checkbox);
  input_line.appendChild(checkbox_label);

  return input_line;
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
  container.appendChild(box);


  var box = document.createElement("div");
  box.setAttribute("class", "input_box");
  box.appendChild( create_select_and_text("Funzione 1:", "funzione_1", lista_funzioni) );
  box.appendChild( create_select_and_text("Funzione 2:", "funzione_2", lista_funzioni) );
  box.appendChild( create_select_and_text("Funzione 3:", "funzione_3", lista_funzioni) );
  container.appendChild(box);


  var box = document.createElement("div");
  box.setAttribute("class", "input_box");

  var petit_line = document.createElement("div");
  petit_line.setAttribute("class", "input_line");
  var petit_checkbox = document.createElement("input");
  var petit_checkbox_label = document.createElement("label");
  petit_checkbox_label.textContent = "nomi piccoli";
  petit_checkbox.setAttribute("type", "checkbox");
  petit_checkbox.setAttribute("name", "petit");
  petit_checkbox.onchange = aggiorna_pdf;
  petit_line.appendChild(petit_checkbox);
  petit_line.appendChild(petit_checkbox_label);
  box.appendChild(petit_line);

  box.appendChild( create_text_plus("Nome 1:", "nome_1", "Siri Nergard", "nome") );
  box.appendChild( create_text_plus("Nome 2:", "nome_2", "Norvegese", "spec") );
  box.appendChild( create_text_plus("Nome 3:", "nome_3", "DIMAI", "spec") );
  box.appendChild( create_text_plus("Nome 4:", "nome_4", "Un nome molto lungo che va su tante righe", "spec") );
  box.appendChild( create_text_plus("Nome 5:", "nome_5") );
  box.appendChild( create_text_plus("Nome 6:", "nome_6") );
  box.appendChild( create_text_plus("Nome 7:", "nome_7") );
  box.appendChild( create_text_plus("Nome 8:", "nome_8") );
  box.appendChild( create_text_plus("Nome 9:", "nome_9") );
  box.appendChild( create_text_plus("Nome 10:", "nome_10") );
  box.appendChild( create_text_plus("Nome 11:", "nome_11") );
  box.appendChild( create_text_plus("Nome 12:", "nome_12") );
  box.appendChild( create_text_plus("Nome 13:", "nome_13") );
  box.appendChild( create_text_plus("Nome 14:", "nome_14") );

  // aggiunge nota in fondo
  let note = document.createElement("p");
  note.setAttribute("class", "tiny");
  note.innerHTML = "Per lasciare vuota una riga inserire uno spazio.";
  box.appendChild(note);
  container.appendChild(box);

  // aggiorna il PDF
  aggiorna_pdf();
}






// ----------------------------------------------------
// ---- FETCH INFO FROM INPUT FIELDS TO OBJECT --------
// ----------------------------------------------------


var fetch_one_info = function (selector) {
  let value = document.querySelector(selector) ? document.querySelector(selector).value : "";
  return value;
}

var fetch_nome = function (selector, checkbox_name, next_name) {

  // moltiplicatore per nomi petit
  let a = 1;
  let petit_checkbox = document.getElementsByName("petit");
  if (petit_checkbox[0].checked) {
  a = 1.5;
  }

  // controllo spaziosotto per specifica dopo nome
  let spec_dopo_nome = 1;
  let this_checkbox = document.getElementsByName(checkbox_name);
  let next_checkbox = document.getElementsByName(next_name);
  console.log(checkbox_name);
  console.log(this_checkbox);

  console.log(next_name);
  console.log(next_checkbox);
  if (next_checkbox[0]) {
    if (next_checkbox[0].checked) {
      spec_dopo_nome = 0;
    }
  }


  let obj = {};
  obj.content = "";
  obj.size = 0;
  obj.interlinea = 0;
  obj.spaziosotto = 0;
  let container = document.querySelector(selector);
  if (container) {
    obj.content = container.getElementsByTagName("input")[0].value;
    //NOME
    obj.size = 30/a;
    obj.interlinea = 24/a;
    obj.spaziosotto = 10/a*spec_dopo_nome;

    //SPECIFICA
    if (this_checkbox[0].checked) {
      obj.size = 20/a;
      obj.interlinea = 20/a;
      obj.spaziosotto = 5/a;
    };

  }
  return obj;
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
  infos.Funzioni.push( fetch_one_info("#funzione_1") );
  infos.Funzioni.push( fetch_one_info("#funzione_2") );
  infos.Funzioni.push( fetch_one_info("#funzione_3") );

  infos.Nomi = [];

  infos.Nomi.push(fetch_nome("#nome_1", "nome_1_checkbox", "nome_2_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_2", "nome_2_checkbox", "nome_3_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_3", "nome_3_checkbox", "nome_4_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_4", "nome_4_checkbox", "nome_5_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_5", "nome_5_checkbox", "nome_6_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_6", "nome_6_checkbox", "nome_7_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_7", "nome_7_checkbox", "nome_8_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_8", "nome_8_checkbox", "nome_9_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_9", "nome_9_checkbox", "nome_10_checkbox" ));
  infos.Nomi.push(fetch_nome("#nome_10", "nome_10_checkbox", "nome_11_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_11", "nome_11_checkbox", "nome_12_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_12", "nome_12_checkbox", "nome_13_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_13", "nome_13_checkbox", "nome_14_checkbox"));
  infos.Nomi.push(fetch_nome("#nome_14", "nome_14_checkbox", "nome_15_checkbox"));

  infos.Annotazioni_1 = "fuoriporta generato automaticamente dal sito:         wayfinding.unifi.it"
  infos.Annotazioni_2 = (function(){d = new Date(); return d.getDate()+" | "+(d.getMonth()+1)+" | "+d.getFullYear(); })()

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
 * @param {object} info - Le informazioni per il fuoriporta.
 * @param {string} info.St_b1 - Info struttura
 * @param {string} info.St_b2 - Info struttura
 * @param {string} info.St_b3 - Info struttura
 * @param {string} info.St_l1 - Info struttura
 * @param {string} info.St_l2 - Info struttura
 * @param {array} info.Funzioni - Array di stringhe per le funzioni
 * @param {array} info.Nomi - Array di oggetti
 * @param {string} info.Nomi[i].content - Nome o specifica
 * @param {number} info.Nomi[i].size - Corpo font in pt
 * @param {number} info.Nomi[i].spaziosotto - Spazio sotto paragrafo in pt
 */


const crea_pdf = function(info) {

  // Impostazioni colori
  let pdf_background = "#fff";
  let pdf_foreground = "#000";
  if (document.querySelector("#options-color-black").checked == true) {
    pdf_background = "#000";
    pdf_foreground = "#fff";
}


  // Impostazioni layout
  let strutture_textbox_width = mmToUnits(80);
  let funzioni_textbox_width = mmToUnits(80);
  let right_textbox_width = mmToUnits(95);

  // Impostazioni font
  // strutture bold
  let strutture_bold_font = helvetica95;
  let strutture_bold_corpo = 25;
  let strutture_bold_interlinea = 21;
  let strutture_bold_options = {
    align: 'left',
    width: strutture_textbox_width,
    lineGap: strutture_bold_interlinea-strutture_bold_corpo*1.2,
    paragraphGap: 0
  };

  // strutture light
  let strutture_light_font = helvetica45;
  let strutture_light_corpo = 16;
  let strutture_light_interlinea = 14;
  let strutture_light_options = {
    align: 'left',
    width: strutture_textbox_width,
    lineGap: strutture_light_interlinea-strutture_light_corpo*1.2,
    paragraphGap: 0
  };

  // funzioni
  let funzioni_font = helvetica65;
  let funzioni_corpo = 20;
  let funzioni_interlinea = 20;
  let funzioni_options = {
    width: funzioni_textbox_width,
    lineGap: funzioni_interlinea-funzioni_corpo*1.2,
    paragraphGap: 5
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
      bottom: 0,
      left: mmToUnits(pdf_msx),
      right: mmToUnits(pdf_mdx)
    }
  });

  // Crea rettangolo di background
doc.rect(0, 0, mmToUnits(pdf_larg), mmToUnits(pdf_alt))
  .fill(pdf_background)


  // Mostra le guide se necessario
  // document.querySelector("#options-margins").checked = true;              // uncomment this to force margin visualization
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





  // Scrive le scritte sul pdf

      // imposta colore
  doc .fill(pdf_foreground);

      // strutture bold
  doc .font(strutture_bold_font, strutture_bold_corpo)
      .text(info.St_b1, strutture_bold_options)
      .text(info.St_b2, strutture_bold_options)
      .text(info.St_b3, strutture_bold_options)
      // strutture light

      .font(strutture_light_font, strutture_light_corpo)
      .text(info.St_l1, strutture_light_options)
      .text(info.St_l2, strutture_light_options)

      // questa linea serve come interlinea (brutto ma funziona)
      .font(helvetica65, 8.5).text(" ")

      // funzioni
      .font(funzioni_font, funzioni_corpo)
      info.Funzioni.forEach(function(e) {
        doc.text(e, funzioni_options);
      })

      console.log (info.Nomi);

      // Calcola allineamento parte destra
      let lines_total_height = 0;
      info.Nomi.forEach(function(e) {
        doc.font(helvetica45, e.size); // sets fonts for the right calculations
        let h = doc.heightOfString(e.content, {align: 'right', width: right_textbox_width, lineGap: e.interlinea-e.size*1.2, paragraphGap: e.spaziosotto});
        // console.log (w,h);
        lines_total_height += h;
      });
      lines_total_height -= info.Nomi[info.Nomi.length - 1].spaziosotto;

      // nomi e specifiche
      doc .font(helvetica45, 1)
          .text(" ", mmToUnits(pdf_larg - pdf_mdx) - right_textbox_width, mmToUnits(pdf_msu) + 241 - lines_total_height)
      info.Nomi.forEach(function(e) {
        doc .font(helvetica45, (e.size))
            .text(e.content, {align: 'right', width: right_textbox_width, lineGap: e.interlinea-e.size*1.2, paragraphGap: e.spaziosotto});
      })

      // annotazioni sulla riga in basso
  doc .font(helvetica45, 8)
      .text(info.Annotazioni_1, mmToUnits(pdf_msx), mmToUnits(106), {})
      .text(info.Annotazioni_2, mmToUnits(pdf_msx), mmToUnits(106), {align: "right"})


  // chiude il pdf
  doc.end();

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







// ---------------------------------
// ----------- INIZIALIZZA ---------
// ---------------------------------

document.addEventListener("DOMContentLoaded", function(event) {
  var struttura_selector = document.querySelector("#struttura_selector");
  var text_input_container = document.querySelector("#text_input_container");
  populate_select_input(struttura_selector, lista_strutture);

  // comment this for production
  struttura_selector.selectedIndex = 1;
  show_inputs(1);
});
