const y=document.querySelector("#year");
for(let i=2000;i<=2026;i++){const o=document.createElement("option");o.value=i;o.textContent=i;y.appendChild(o)}

const norm=s=>String(s??"").trim().replace(/\s+/g," ").toUpperCase();
function parseCSV(t){
  let rows=[],row=[],cell="",q=false;
  for(let i=0;i<t.length;i++){
    const c=t[i],n=t[i+1];
    if(c==='"'&&q&&n==='"'){cell+='"';i++;continue}
    if(c==='"'){q=!q;continue}
    if(c===','&&!q){row.push(cell);cell="";continue}
    if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&n==='\n')i++;row.push(cell);cell="";if(row.some(v=>v.trim()))rows.push(row);row=[];continue}
    cell+=c;
  }
  if(cell||row.length){row.push(cell);if(row.some(v=>v.trim()))rows.push(row)}
  if(!rows.length)return[];
  const h=rows.shift().map(x=>x.trim().replace(/^\uFEFF/,''));
  return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k,(r[i]??"").trim()])));
}
const esc=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function render(p){
  const agama = norm(p.agama || p.Agama || "");

  const isIslam = agama === "ISLAM";
  const isKristen = agama === "KRISTEN" || agama === "KATOLIK";

  const val = (...keys) => {
    for (const key of keys) {
      if (
        Object.prototype.hasOwnProperty.call(p, key) &&
        String(p[key] ?? "").trim() !== ""
      ) {
        return p[key];
      }
    }
    return "—";
  };

  const esc = v =>
    String(v ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;");

  const th = (text, attrs="") =>
    `<th ${attrs}>${esc(text)}</th>`;

  const td = (...keys) =>
    `<td>${esc(val(...keys))}</td>`;

  let header1 = "";
  let header2 = "";
  let header3 = "";
  let body = "";

  /* =====================================================
     IDENTITAS
     ===================================================== */

  header1 += th("Nama",'rowspan="3"');
  header1 += th("Kelas",'rowspan="3"');
  header1 += th("Pilihan",'rowspan="3"');
  header1 += th("Skolastik",'rowspan="3"');

  body += td("Nama");
  body += td("Kelas");
  body += td("Pilihan");
  body += td("Skolastik");


  /* =====================================================
     KEAGAMAAN
     HANYA SATU KELOMPOK SESUAI AGAMA
     ===================================================== */

  if (isIslam) {

    /*
      Struktur mengikuti Excel:

      Keagamaan Islam
      ├─ Wudhu
      ├─ Sholat
      ├─ Akidah
      │  ├─ Rukun Islam
      │  ├─ Rukun Iman
      │  └─ Toleransi Beragama
      └─ Baca Al-Qur'an
         ├─ Tajwid
         ├─ Kefasihan
         └─ Kelancaran
    */

    header1 += `<th colspan="8">Keagamaan Islam</th>`;

    header2 += `<th rowspan="2">Wudhu</th>`;
    header2 += `<th rowspan="2">Sholat</th>`;
    header2 += `<th colspan="3">Akidah</th>`;
    header2 += `<th colspan="3">Baca Al-Qur'an</th>`;

    header3 += th("Rukun Islam");
    header3 += th("Rukun Iman");
    header3 += th("Toleransi Beragama");
    header3 += th("Tajwid");
    header3 += th("Kefasihan");
    header3 += th("Kelancaran");

    body += td("Wudhu");
    body += td("Sholat");
    body += td("Rukun Islam");
    body += td("Rukun Iman");
    body += td("Toleransi Beragama");
    body += td("Tajwid");
    body += td("Kefasihan");
    body += td("Kelancaran");

    header1 += th("Sub Total",'rowspan="3"');
    body += `<td class="subtotal">${esc(val("Sub Total Keagamaan Islam"))}</td>`;

  } else if (isKristen) {

    /*
      Struktur Kristen/Katolik mengikuti Excel.
    */

    header1 += `<th colspan="8">Keagamaan Kristen &amp; Katolik</th>`;

    header2 += `<th colspan="3">Beribadah</th>`;
    header2 += `<th colspan="3">Pemahaman Alkitab</th>`;
    header2 += `<th colspan="2">Perilaku Sehari-Hari</th>`;

    header3 += th("Ibadah ke Gereja");
    header3 += th("Pelayanan di Gereja");
    header3 += th("Lagu Pujian");
    header3 += th("Doa Bapa Kami");
    header3 += th("Sepuluh Perintah Allah");
    header3 += th("Berdoa dan Membaca Al Kitab");
    header3 += th("Kebiasaan Baik");
    header3 += th("Menghormati Orang Tua");

    body += td("Ibadah ke Gereja");
    body += td("Pelayanan di Gereja");
    body += td("Lagu Pujian");
    body += td("Doa Bapa Kami");
    body += td("Sepuluh Perintah Allah");
    body += td("Berdoa dan Membaca Alkitab","Berdoa dan Membaca Al Kitab");
    body += td("Kebiasaan Baik");
    body += td("Menghormati Orang Tua");

    header1 += th("Sub Total",'rowspan="3"');
    body += `<td class="subtotal">${esc(val("Sub Total Keagamaan Kristen & Katolik"))}</td>`;
  }


  /* =====================================================
     PUBLIC SPEAKING
     ===================================================== */

  const publicSpeaking = [
    "Intonasi",
    "Artikulasi",
    "Volume Suara",
    "Pemilihan Kata",
    "Struktur Kalimat",
    "Gestur",
    "Ekspresi",
    "Kesesuaian Isi",
    "Kelancaran Public Speaking"
  ];

  header1 += `<th colspan="${publicSpeaking.length}">Public Speaking</th>`;
  header2 += `<th colspan="${publicSpeaking.length}">Indikator</th>`;

  publicSpeaking.forEach(k => {
    header3 += th(k);
    body += td(k);
  });

  header1 += th("Sub Total",'rowspan="3"');
  body += `<td class="subtotal">${esc(val("Sub Total Public Speaking"))}</td>`;


  /* =====================================================
     WAWANCARA
     ===================================================== */

  const wawancara = [
    "Sikap & Perilaku",
    "Komunikasi",
    "Karakter",
    "Hubungan",
    "Dukungan",
    "Manajemen Waktu",
    "Konsistensi",
    "MPK - OSIS",
    "Komitmen"
  ];

  header1 += `<th colspan="${wawancara.length}">Wawancara</th>`;
  header2 += `<th colspan="${wawancara.length}">Indikator</th>`;

  wawancara.forEach(k => {
    header3 += th(k);

    if (k === "MPK - OSIS") {
      body += td("MPK - OSIS");
    } else {
      body += td(k);
    }
  });

  header1 += th("Sub Total",'rowspan="3"');
  body += `<td class="subtotal">${esc(val("Sub Total Wawancara"))}</td>`;


  /* =====================================================
     JUMLAH NILAI
     ===================================================== */

  header1 += th("Jumlah Nilai",'rowspan="3"');
  body += `<td class="final">${esc(val("Jumlah Nilai"))}</td>`;


  /* =====================================================
     RENDER
     ===================================================== */

  document.querySelector("#scoreTable").innerHTML = `
    <thead>
      <tr class="group-row">
        ${header1}
      </tr>

      <tr class="sub-row">
        ${header2}
      </tr>

      <tr class="leaf-row">
        ${header3}
      </tr>
    </thead>

    <tbody>
      <tr>
        ${body}
      </tr>
    </tbody>
  `;
}

document.querySelector("#form").addEventListener("submit",async e=>{e.preventDefault();let m=document.querySelector("#msg");m.textContent="";try{let r=await fetch("data/peserta.csv?v="+Date.now(),{cache:"no-store"});if(!r.ok)throw 0;let d=parseCSV(await r.text()),p=d.find(x=>norm(x.Nama)==norm(document.querySelector("#name").value)&&norm(x.Kelas)==norm(document.querySelector("#class").value)&&x.tahun_lahir==y.value&&norm(x.Pilihan)==norm(document.querySelector("#division").value));if(!p){m.textContent="Data tidak ditemukan. Periksa nama, kelas, tahun lahir, dan pilihan.";return}let s=(p.status||"red").toLowerCase(),card=document.querySelector("#resultCard");card.className="result "+s;document.querySelector("#status").textContent=s=="blue"?"LOLOS":s=="yellow"?"LOLOS BERSYARAT":"TIDAK LOLOS";document.querySelector("#title").textContent=p.judul||"Hasil Seleksi";document.querySelector("#rname").textContent=p.Nama||"—";document.querySelector("#rclass").textContent=p.Kelas||"—";document.querySelector("#rdivision").textContent=p.Pilihan||"—";document.querySelector("#desc").textContent=p.keterangan||"Silakan mengikuti informasi selanjutnya dari panitia.";document.querySelector("#icon").textContent=s=="blue"?"✓":s=="yellow"?"!":"×";render(p);document.querySelector("#result").classList.remove("hidden");document.querySelector("#result").scrollIntoView({behavior:"smooth",block:"start"})}catch(e){m.textContent="Database belum tersedia. Pastikan data/peserta.csv sudah di-upload ke GitHub."}});
document.querySelector("#reset").onclick=()=>{document.querySelector("#form").reset();document.querySelector("#result").classList.add("hidden");document.querySelector("#cek").scrollIntoView({behavior:"smooth"})};
