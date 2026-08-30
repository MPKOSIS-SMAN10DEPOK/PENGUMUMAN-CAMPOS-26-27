/* =========================================================
   TAHUN LAHIR
   ========================================================= */

const y = document.querySelector("#year");

for(let i = 2000; i <= 2026; i++){
  const o = document.createElement("option");
  o.value = i;
  o.textContent = i;
  y.appendChild(o);
}


/* =========================================================
   NORMALISASI TEKS
   ========================================================= */

const norm = s =>
  String(s ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();


/* =========================================================
   NORMALISASI HEADER
   Supaya:
   MPK-OSIS
   MPK - OSIS
   MPK – OSIS
   tetap dianggap sama
   ========================================================= */

function normHeader(s){

  return String(s ?? "")
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .toUpperCase();

}


/* =========================================================
   MEMBERSIHKAN NILAI CSV
   ========================================================= */

function cleanValue(v){

  let value = String(v ?? "").trim();

  value = value.replace(/^\uFEFF/, "");

  /*
   * Menghapus tanda kutip berlapis.
   *
   * """23,5""" -> 23,5
   * "23,5"     -> 23,5
   */

  while(
    value.length >= 2 &&
    value.startsWith('"') &&
    value.endsWith('"')
  ){

    value =
      value
        .slice(1, -1)
        .trim();

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


    /* Kutip ganda di dalam data */

    if(
      c === '"' &&
      q &&
      n === '"'
    ){

      cell += '"';
      i++;

      continue;
    }


    /* Buka / tutup kutip */

    if(c === '"'){

      q = !q;

      continue;
    }


    /* Pemisah kolom */

    if(
      c === "," &&
      !q
    ){

      row.push(cell);

      cell = "";

      continue;
    }


    /* Akhir baris */

    if(
      (c === "\n" || c === "\r") &&
      !q
    ){

      if(
        c === "\r" &&
        n === "\n"
      ){

        i++;

      }


      row.push(cell);

      cell = "";


      if(
        row.some(
          v => v.trim() !== ""
        )
      ){

        rows.push(row);

      }


      row = [];

      continue;
    }


    cell += c;
  }


  /* Data terakhir */

  if(
    cell !== "" ||
    row.length
  ){

    row.push(cell);

    if(
      row.some(
        v => v.trim() !== ""
      )
    ){

      rows.push(row);

    }

  }


  if(!rows.length){

    return [];

  }


  /* =======================================================
     HEADER
     ======================================================= */

  const originalHeaders =
    rows
      .shift()
      .map(x =>
        cleanValue(x)
      );


  /*
   * Header duplikat diberi nomor.
   *
   * Sub Total
   * Sub Total
   * Sub Total
   *
   * menjadi:
   *
   * Sub Total
   * Sub Total_2
   * Sub Total_3
   */

  const headers = [];
  const counter = {};


  originalHeaders.forEach(
    original => {

      const h =
        original.trim();


      if(
        counter[h] === undefined
      ){

        counter[h] = 1;

        headers.push(h);

      }else{

        counter[h]++;

        headers.push(
          `${h}_${counter[h]}`
        );

      }

    }
  );


  /* =======================================================
     DATA PESERTA
     ======================================================= */

  return rows.map(r => {

    const obj = {};

    headers.forEach(
      (key, i) => {

        obj[key] =
          cleanValue(
            r[i] ?? ""
          );

      }
    );


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
   MENGAMBIL NILAI DENGAN BEBERAPA ALIAS
   ========================================================= */

function getValue(p, ...keys){

  for(const key of keys){

    if(
      Object.prototype.hasOwnProperty.call(
        p,
        key
      )
    ){

      const value =
        cleanValue(p[key]);

      if(value !== ""){

        return value;

      }

    }

  }

  return "—";
}


/* =========================================================
   RENDER TABEL
   ========================================================= */

function render(p){

  const agama =
    norm(
      getValue(
        p,
        "agama",
        "Agama"
      )
    );


  const isIslam =
    agama === "ISLAM";


  const isKristen =
    agama === "KRISTEN" ||
    agama === "KATOLIK";


  let r1 = "";
  let r2 = "";
  let r3 = "";
  let body = "";


  /* =======================================================
     HELPER TABLE
     ======================================================= */

  const th = (
    text,
    attrs = ""
  ) => {

    return `
      <th ${attrs}>
        ${esc(text)}
      </th>
    `;

  };


  const td = (
    ...keys
  ) => {

    return `
      <td>
        ${esc(
          getValue(
            p,
            ...keys
          )
        )}
      </td>
    `;

  };


  /* =======================================================
     DATA DASAR
     ======================================================= */

  const basic = [
    "Nama",
    "Kelas",
    "Pilihan",
    "Skolastik"
  ];


  basic.forEach(k => {

    r1 += th(
      k,
      'rowspan="3"'
    );

    body += td(k);

  });


  /* =======================================================
     AGAMA ISLAM
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
      "Rukun Islam",
      "Akidah Akhlak",
      "Akidah"
    );

    body += td(
      "Rukun Iman",
      "Hadist & doa sehari-hari",
      "Hadist & doa Sehari-hari"
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


    /*
     * SUBTOTAL ISLAM
     */

    r1 += th(
      "Sub Total",
      'rowspan="3"'
    );


    body += `
      <td class="subtotal">
        ${esc(
          getValue(
            p,
            "Sub Total"
          )
        )}
      </td>
    `;

  }


  /* =======================================================
     AGAMA KRISTEN / KATOLIK
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


    /*
     * SUBTOTAL KRISTEN
     */

    r1 += th(
      "Sub Total",
      'rowspan="3"'
    );


    body += `
      <td class="subtotal">
        ${esc(
          getValue(
            p,
            "SubTotal"
          )
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
   * SUBTOTAL PUBLIC SPEAKING
   *
   * Ini adalah Sub Total_2
   */

  body += `
    <td class="subtotal">
      ${esc(
        getValue(
          p,
          "Sub Total_2"
        )
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


    /*
     * MPK-OSIS sering memiliki variasi
     * penulisan di CSV.
     */

    if(k === "MPK-OSIS"){

      body += td(
        "MPK-OSIS",
        "MPK - OSIS",
        "MPK – OSIS",
        "MPK — OSIS"
      );

    }else{

      body += td(k);

    }

  });


  r1 += th(
    "Sub Total",
    'rowspan="3"'
  );


  /*
   * SUBTOTAL WAWANCARA
   *
   * Ini adalah Sub Total_4.
   */

  body += `
    <td class="subtotal">
      ${esc(
        getValue(
          p,
          "Sub Total_4"
        )
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
        getValue(
          p,
          "Jumlah Nilai"
        )
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
   CEK DATA
   ========================================================= */

document
  .querySelector("#form")
  .addEventListener(
    "submit",
    async e => {

      e.preventDefault();


      const m =
        document.querySelector(
          "#msg"
        );


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


        /* =================================================
           INPUT
           ================================================= */

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


        /* =================================================
           CARI PESERTA
           ================================================= */

        const p =
          d.find(x =>

            norm(
              getValue(
                x,
                "Nama"
              )
            ) ===
            norm(name)

            &&

            norm(
              getValue(
                x,
                "Kelas"
              )
            ) ===
            norm(kelas)

            &&

            String(
              getValue(
                x,
                "tahun_lahir"
              )
            ).trim() ===
            String(year).trim()

            &&

            norm(
              getValue(
                x,
                "Pilihan"
              )
            ) ===
            norm(division)

          );


        /* =================================================
           DATA TIDAK DITEMUKAN
           ================================================= */

        if(!p){

          m.textContent =
            "Data tidak ditemukan. Periksa nama, kelas, tahun lahir, dan pilihan.";

          return;

        }


        /* =================================================
           STATUS
           ================================================= */

        const s =
          String(
            getValue(
              p,
              "status"
            )
          )
          .toLowerCase();


        const status =
          s === "blue"
            ? "blue"
            : s === "yellow"
              ? "yellow"
              : "red";


        const card =
          document.querySelector(
            "#resultCard"
          );


        card.className =
          "result " + status;


        /* =================================================
           JUDUL STATUS
           ================================================= */

        document.querySelector(
          "#status"
        ).textContent =

          status === "blue"
            ? "LOLOS"
            : status === "yellow"
              ? "LOLOS BERSYARAT"
              : "TIDAK LOLOS";


        document.querySelector(
          "#title"
        ).textContent =
          getValue(
            p,
            "judul"
          ) === "—"
            ? "Hasil Seleksi"
            : getValue(
                p,
                "judul"
              );


        /* =================================================
           DATA PESERTA
           ================================================= */

        document.querySelector(
          "#rname"
        ).textContent =
          getValue(
            p,
            "Nama"
          );


        document.querySelector(
          "#rclass"
        ).textContent =
          getValue(
            p,
            "Kelas"
          );


        document.querySelector(
          "#rdivision"
        ).textContent =
          getValue(
            p,
            "Pilihan"
          );


        document.querySelector(
          "#desc"
        ).textContent =

          getValue(
            p,
            "keterangan"
          ) === "—"

            ? "Silakan mengikuti informasi selanjutnya dari panitia."

            : getValue(
                p,
                "keterangan"
              );


        /* =================================================
           ICON
           ================================================= */

        document.querySelector(
          "#icon"
        ).textContent =

          status === "blue"
            ? "✓"
            : status === "yellow"
              ? "!"
              : "×";


        /* =================================================
           RENDER TABEL
           ================================================= */

        render(p);


        /* =================================================
           TAMPILKAN HASIL
           ================================================= */

        document
          .querySelector(
            "#result"
          )
          .classList
          .remove("hidden");


        document
          .querySelector(
            "#result"
          )
          .scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

      }
      catch(error){

        console.error(
          "Error:",
          error
        );


        m.textContent =
          "Database belum tersedia. Pastikan data/peserta.csv sudah di-upload ke GitHub.";

      }

    }
  );


/* =========================================================
   TOMBOL CEK DATA LAIN
   ========================================================= */

document
  .querySelector(
    "#reset"
  )
  .onclick = () => {

    document
      .querySelector(
        "#form"
      )
      .reset();


    document
      .querySelector(
        "#result"
      )
      .classList
      .add("hidden");


    document
      .querySelector(
        "#cek"
      )
      .scrollIntoView({
        behavior: "smooth"
      });

  };
