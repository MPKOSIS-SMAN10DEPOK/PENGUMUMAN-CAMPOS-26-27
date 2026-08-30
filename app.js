const y = document.querySelector("#year");

for(let i = 2000; i <= 2026; i++){
  const o = document.createElement("option");
  o.value = i;
  o.textContent = i;
  y.appendChild(o);
}


/* =========================================================
   NORMALISASI
   ========================================================= */

const norm = s =>
  String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();


/* =========================================================
   MEMBERSIHKAN NILAI CSV
   Contoh:
   """92,5""" -> 92,5
   "92,5"     -> 92,5
   ========================================================= */

function cleanValue(v){

  let value = String(v ?? "").trim();

  value = value.replace(/^\uFEFF/, "");

  while(
    value.length >= 2 &&
    value.startsWith('"') &&
    value.endsWith('"')
  ){
    value = value.slice(1, -1).trim();
  }

  return value;
}


/* =========================================================
   PARSER CSV
   ========================================================= */

function parseCSV(t){

  let rows = [];
  let row = [];
  let cell = "";
  let q = false;

  for(let i = 0; i < t.length; i++){

    const c = t[i];
    const n = t[i + 1];

    // Tanda kutip ganda di dalam field
    if(c === '"' && q && n === '"'){
      cell += '"';
      i++;
      continue;
    }

    // Buka / tutup tanda kutip
    if(c === '"'){
      q = !q;
      continue;
    }

    // Koma sebagai pemisah kolom
    if(c === "," && !q){
      row.push(cell);
      cell = "";
      continue;
    }

    // Akhir baris
    if((c === "\n" || c === "\r") && !q){

      if(c === "\r" && n === "\n"){
        i++;
      }

      row.push(cell);
      cell = "";

      if(row.some(v => v.trim())){
        rows.push(row);
      }

      row = [];
      continue;
    }

    cell += c;
  }

  // Sisa data terakhir
  if(cell || row.length){

    row.push(cell);

    if(row.some(v => v.trim())){
      rows.push(row);
    }
  }

  if(!rows.length){
    return [];
  }


  /* =======================================================
     HEADER
     ======================================================= */

  const originalHeaders = rows.shift().map(x =>
    cleanValue(x)
      .trim()
      .replace(/^\uFEFF/, "")
  );


  /* =======================================================
     HEADER DUPLIKAT
     
     Contoh:
     Sub Total
     Sub Total
     Sub Total

     menjadi:
     Sub Total
     Sub Total_2
     Sub Total_3
     ======================================================= */

  const headers = [];
  const counter = {};

  originalHeaders.forEach(h => {

    if(counter[h] === undefined){

      counter[h] = 1;
      headers.push(h);

    }else{

      counter[h]++;

      headers.push(
        `${h}_${counter[h]}`
      );

    }

  });


  /* =======================================================
     DATA
     ======================================================= */

  return rows.map(r => {

    const obj = {};

    headers.forEach((k, i) => {

      obj[k] = cleanValue(
        r[i] ?? ""
      );

    });

    return obj;

  });
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

const esc = v =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


/* =========================================================
   RENDER TABEL
   ========================================================= */

function render(p){

  const agama =
    norm(
      p.agama ||
      p.Agama ||
      ""
    );


  const isIslam =
    agama === "ISLAM";


  const isKristen =
    agama === "KRISTEN" ||
    agama === "KATOLIK";


  /* =======================================================
     MENGAMBIL NILAI
     ======================================================= */

  const val = (...keys) => {

    for(const k of keys){

      if(
        Object.prototype.hasOwnProperty.call(p, k)
      ){

        const value =
          cleanValue(p[k]);

        if(value !== ""){
          return value;
        }

      }

    }

    return "—";
  };


  /* =======================================================
     HELPER
     ======================================================= */

  const th = (
    text,
    attrs = ""
  ) =>
    `<th ${attrs}>${esc(text)}</th>`;


  const td = (...keys) =>
    `<td>${esc(val(...keys))}</td>`;


  let r1 = "";
  let r2 = "";
  let r3 = "";
  let body = "";


  /* =======================================================
     IDENTITAS
     ======================================================= */

  for(const k of [
    "Nama",
    "Kelas",
    "Pilihan",
    "Skolastik"
  ]){

    r1 += th(
      k,
      'rowspan="3"'
    );

    body += td(k);

  }


  /* =======================================================
     KEAGAMAAN ISLAM
     ======================================================= */

  if(isIslam){

    r1 += th(
      "Keagamaan Islam",
      'colspan="8"'
    );


    r2 += th(
      "Wudhu",
      'rowspan="2"'
    );

    r2 += th(
      "Sholat",
      'rowspan="2"'
    );

    r2 += th(
      "Akidah",
      'colspan="3"'
    );

    r2 += th(
      "Baca Al-Qur'an",
      'colspan="3"'
    );


    r3 += th(
      "Rukun Islam"
    );

    r3 += th(
      "Rukun Iman"
    );

    r3 += th(
      "Toleransi Beragama"
    );

    r3 += th(
      "Tajwid"
    );

    r3 += th(
      "Kefasihan"
    );

    r3 += th(
      "Kelancaran"
    );


    body += td(
      "Wudhu"
    );

    body += td(
      "Sholat"
    );

    body += td(
      "Rukun Islam"
    );

    body += td(
      "Rukun Iman"
    );

    body += td(
      "Toleransi Beragama"
    );

    body += td(
      "Tajwid"
    );

    body += td(
      "Kefasihan"
    );

    body += td(
      "Kelancaran"
    );


    r1 += th(
      "Sub Total",
      'rowspan="3"'
    );


    /*
     * SUBTOTAL KEAGAMAAN ISLAM
     * Kolom pertama "Sub Total"
     */

    body += `
      <td class="subtotal">
        ${esc(
          val("Sub Total")
        )}
      </td>
    `;

  }


  /* =======================================================
     KEAGAMAAN KRISTEN & KATOLIK
     ======================================================= */

  else if(isKristen){

    r1 += th(
      "Keagamaan Kristen & Katolik",
      'colspan="8"'
    );


    r2 += th(
      "Beribadah",
      'colspan="3"'
    );

    r2 += th(
      "Pemahaman Alkitab",
      'colspan="3"'
    );

    r2 += th(
      "Perilaku Sehari-Hari",
      'colspan="2"'
    );


    r3 += th(
      "Ibadah ke Gereja"
    );

    r3 += th(
      "Pelayanan di Gereja"
    );

    r3 += th(
      "Lagu Pujian"
    );

    r3 += th(
      "Doa Bapa Kami"
    );

    r3 += th(
      "Sepuluh Perintah Allah"
    );

    r3 += th(
      "Berdoa dan Membaca Al Kitab"
    );

    r3 += th(
      "Kebiasaan Baik"
    );

    r3 += th(
      "Menghormati Orang Tua"
    );


    body += td(
      "Ibadah ke Gereja"
    );

    body += td(
      "Pelayanan di Gereja"
    );

    body += td(
      "Lagu Pujian"
    );

    body += td(
      "Doa Bapa Kami"
    );

    body += td(
      "Sepuluh Perintah Allah"
    );

    body += td(
      "Berdoa dan Membaca Alkitab",
      "Berdoa dan Membaca Al Kitab"
    );

    body += td(
      "Kebiasaan Baik"
    );

    body += td(
      "Menghormati Orang Tua"
    );


    r1 += th(
      "Sub Total",
      'rowspan="3"'
    );


    /*
     * SUBTOTAL KRISTEN/KATOLIK
     * Header di CSV adalah "SubTotal"
     */

    body += `
      <td class="subtotal">
        ${esc(
          val("SubTotal")
        )}
      </td>
    `;

  }


  /* =======================================================
     PUBLIC SPEAKING
     ======================================================= */

  const pub = [

    "Intonasi",
    "Artikulasi",
    "Volume Suara",
    "Pemilihan Kata",
    "Struktur Kalimat",
    "Gestur",
    "Ekspresi",
    "Kesesuaian Isi",
    "Kelancaran"

  ];


  r1 += th(
    "Public Speaking",
    `colspan="${pub.length}"`
  );


  r2 += th(
    "Indikator",
    `colspan="${pub.length}"`
  );


  pub.forEach(k => {

    r3 += th(k);

    body += td(k);

  });


  r1 += th(
    "Sub Total",
    'rowspan="3"'
  );


  /*
   * PENTING:
   * Sub Total Public Speaking adalah
   * "Sub Total_2"
   *
   * BUKAN Sub Total_3
   */

  body += `
    <td class="subtotal">
      ${esc(
        val("Sub Total_2")
      )}
    </td>
  `;


  /* =======================================================
     WAWANCARA
     ======================================================= */

  const waw = [

    "Sikap & Perilaku",
    "Komunikasi",
    "Karakter",
    "Hubungan",
    "Dukungan",
    "Manajemen Waktu",
    "Konsistensi",
    "MPK-OSIS",
    "Komitmen"

  ];


  r1 += th(
    "Wawancara",
    `colspan="${waw.length}"`
  );


  r2 += th(
    "Indikator",
    `colspan="${waw.length}"`
  );


  waw.forEach(k => {

    r3 += th(k);

    body += td(
      k,
      k === "MPK-OSIS"
        ? "MPK-OSIS"
        : k
    );

  });


  r1 += th(
    "Sub Total",
    'rowspan="3"'
  );


  /*
   * PENTING:
   * Sub Total Wawancara adalah
   * "Sub Total_3"
   *
   * BUKAN Sub Total_5
   */

  body += `
    <td class="subtotal">
      ${esc(
        val("Sub Total_3")
      )}
    </td>
  `;


  /* =======================================================
     JUMLAH NILAI
     ======================================================= */

  r1 += th(
    "Jumlah Nilai",
    'rowspan="3"'
  );


  body += `
    <td class="final">
      ${esc(
        val("Jumlah Nilai")
      )}
    </td>
  `;


  /* =======================================================
     MASUKKAN KE TABLE
     ======================================================= */

  document.querySelector(
    "#scoreTable"
  ).innerHTML = `

    <thead>

      <tr class="group-row">
        ${r1}
      </tr>

      <tr class="sub-row">
        ${r2}
      </tr>

      <tr class="leaf-row">
        ${r3}
      </tr>

    </thead>

    <tbody>

      <tr>
        ${body}
      </tr>

    </tbody>

  `;
}


/* =========================================================
   FORM CEK HASIL
   ========================================================= */

document
  .querySelector("#form")
  .addEventListener(
    "submit",
    async e => {

      e.preventDefault();


      const m =
        document.querySelector("#msg");


      m.textContent = "";


      try{

        const r =
          await fetch(
            "data/peserta.csv?v=" +
            Date.now(),
            {
              cache: "no-store"
            }
          );


        if(!r.ok){
          throw new Error(
            "CSV tidak ditemukan"
          );
        }


        const d =
          parseCSV(
            await r.text()
          );


        const name =
          document.querySelector(
            "#name"
          ).value;


        const kelas =
          document.querySelector(
            "#class"
          ).value;


        const year =
          y.value;


        const division =
          document.querySelector(
            "#division"
          ).value;


        const p =
          d.find(x =>

            norm(x.Nama) ===
              norm(name)

            &&

            norm(x.Kelas) ===
              norm(kelas)

            &&

            String(
              x.tahun_lahir
            ).trim() ===
              String(year).trim()

            &&

            norm(x.Pilihan) ===
              norm(division)

          );


        if(!p){

          m.textContent =
            "Data tidak ditemukan. Periksa nama, kelas, tahun lahir, dan pilihan.";

          return;

        }


        /* =================================================
           STATUS
           ================================================= */

        const s =
          (
            p.status ||
            "red"
          ).toLowerCase();


        const card =
          document.querySelector(
            "#resultCard"
          );


        card.className =
          "result " + s;


        document.querySelector(
          "#status"
        ).textContent =

          s === "blue"
            ? "LOLOS"
            : s === "yellow"
              ? "LOLOS BERSYARAT"
              : "TIDAK LOLOS";


        document.querySelector(
          "#title"
        ).textContent =
          p.judul ||
          "Hasil Seleksi";


        document.querySelector(
          "#rname"
        ).textContent =
          p.Nama ||
          "—";


        document.querySelector(
          "#rclass"
        ).textContent =
          p.Kelas ||
          "—";


        document.querySelector(
          "#rdivision"
        ).textContent =
          p.Pilihan ||
          "—";


        document.querySelector(
          "#desc"
        ).textContent =
          p.keterangan ||
          "Silakan mengikuti informasi selanjutnya dari panitia.";


        document.querySelector(
          "#icon"
        ).textContent =

          s === "blue"
            ? "✓"
            : s === "yellow"
              ? "!"
              : "×";


        /* =================================================
           RENDER
           ================================================= */

        render(p);


        /* =================================================
           TAMPILKAN HASIL
           ================================================= */

        document
          .querySelector("#result")
          .classList
          .remove("hidden");


        document
          .querySelector("#result")
          .scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

      }
      catch(e){

        console.error(e);

        m.textContent =
          "Database belum tersedia. Pastikan data/peserta.csv sudah di-upload ke GitHub.";

      }

    }
  );


/* =========================================================
   RESET
   ========================================================= */

document
  .querySelector("#reset")
  .onclick = () => {

    document
      .querySelector("#form")
      .reset();


    document
      .querySelector("#result")
      .classList
      .add("hidden");


    document
      .querySelector("#cek")
      .scrollIntoView({
        behavior: "smooth"
      });

  };
