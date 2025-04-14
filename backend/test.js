let organizacije = [
  {
    idOrg: "890",
    naziv: "Reddit",
    pib: 8659343,
    mb: 2309420,
    racun: 265 - 423454 - 736,
    tip: { tipId: "6731", tipName: "DOO" },
    roditeljOrganizacija: "",
    zaposleniList: [
      {
        jmbg: "0204997710082",
        pozicija: { pozicijaId: "35793", pozicijaName: "Konobar" },
        sektor: { sektorId: "758493", sektorName: "Banket" },
        netopalataIzUgovora: "50.000",
        fixUgovoren: "70.000",
        tipUgovora: { tipUgovoraId: "83625", tipUgovoraName: "Na odrednjeno" },
        kafa: "Da",
        zaRacDnev: "Da",
      },
      {
        jmbg: "1325620710084",
        pozicija: "Kuvar",
        sektor: "Kuhinja",
        netopalataIzUgovora: "60.000",
        fixUgovoren: "90.000",
        tipUgovora: "Na neodrednjeno",
        kafa: "Da",
        zaRacDnev: "Ne",
      },
    ],
  },
  {
    idOrg: "371",
    naziv: "Flixbus",
    pib: 3357257,
    mb: 2467257,
    racun: 763 - 24725 - 537,
    tip: { tipId: "8324", tipName: "Agencija" },
    roditeljOrganizacija: "962652347052456",
    zaposleni: [
      {
        jmbg: "0204997710082",
        pozicija: { pozicijaId: "347748", pozicijaName: "Piljar" },
        sektor: { sektorId: "2464568", sektorName: "KRoc" },
        netopalataIzUgovora: "50.000",
        fixUgovoren: "70.000",
        tipUgovora: { tipUgovoraId: "45745", tipUgovoraName: "Na 2 meseca" },
        kafa: "Da",
        zaRacDnev: "Da",
      },
      {
        jmbg: "2859245854368",
        pozicija: "Konobar",
        sektor: "Kuhinja",
        netopalataIzUgovora: "60.000",
        tipUgovora: "Na neodrednjeno",
        fixUgovoren: "90.000",
        kafa: "Da",
        zaRacDnev: "Ne",
      },
    ],
  },
  {
    idOrg: "385",
    naziv: "Samsung",
    pib: 84639425,
    mb: 357256459,
    racun: 266 - 2356 - 362,
    tip: { tipId: "6731", tipName: "DOO" },
    roditeljOrganizacija: "9245830237458",
    zaposleni: [
      {
        jmbg: "0204997710082",
        pozicija: "Kuvar",
        sektor: "Banket",
        netopalataIzUgovora: "50.000",
        tipUgovora: "Na odrednjeno",
        fixUgovoren: "70.000",
        kafa: "Da",
        zaRacDnev: "Da",
      },
      {
        jmbg: "2859245854368",
        pozicija: "Konobar",
        sektor: "Kuhinja",
        netopalataIzUgovora: "60.000",
        tipUgovora: "Na neodrednjeno",
        fixUgovoren: "90.000",
        kafa: "Da",
        zaRacDnev: "Ne",
      },
    ],
  },
];

let zaposleni = [
  {
    ime: "Jovan",
    prezime: "Jovanovic",
    jmbg: "2938692690637",
    valuta: "Eur",
    status: "Aktivan",
  },
  {
    ime: "Ana",
    prezime: "Ivanovic",
    jmbg: "1325620710084",
    valuta: "Rsd",
    status: "Neaktivan",
  },
  {
    ime: "Marija",
    prezime: "Matic",
    jmbg: "0204997710082",
    valuta: "Rsd",
    status: "Aktivan",
  },
  {
    ime: "Rade",
    prezime: "Nikolic",
    jmbg: "2859245854368",
    valuta: "Eur",
    status: "Aktivan",
  },
];

/*
==== DODAVANJE ZAPOSLENOG ORGANIZACIJI I DEFINISANJE NJEGOVE ULOGE U TOJ ORGANIZACIJI ====
- Kod dodavanja organizacije zaposlenog na select izfiltriramo sva imena organizacije i kad izaberemo dobijemo id organizacije
- Kroz gui dodajem pozicija, sektor, netopalataIzUgovora, fixUgovoren, kafa, zaRacDnev 
- Zajedno sa jmbg-om kreiram zaseban objekat koji definise mesto (sa svim podacima) u nekoj organizaciji
- Saljem serveru idOrg da bi nasao u koju organizaciju da ga smestim i ceo taj objekat stavljam u listu zaposlenih u toj organizaciji... 
*/

/*
==== KREIRANJE ORGANIZACIJE I OGRANKA ====
1. Organizacija
- Popune se podaci iz gui-ja naziv, pib, mb, tip (DOO i Agencija)
- roditeljOrganizacija ce da bude prazno jer je to ustvari roditeljska firma
- zaposleni array ce da bude prazno jer ne dodajemo zaposlenog pri kreiranju organizacije

2. Ogranak
- Popune se podaci iz gui-ja naziv 
- za tip (Ogranak) u selectu se izgenerisu sva imena organizacija kojima roditeljOrganizacija je prazno jer su to roditeljske organizacije
  kojima se dodaje ta cerka organizacija
- Kad se izabere naziv ustavri se izabira idOrg fetchuje se sa servera ta organizacija i pib, racun i mb se popunjavaju
- Ondase taj objekat cuva kao ogranizacija tip Ogranak

*/

let data = {
  zaposlen: {
    ime: "Jovan",
    prezime: "Jovanovic",
    jmbg: "2938692690637",
    valuta: "Eur",
    status: "Aktivan",
  },
  organizacije: {
    890: {
      jmbg: "0204997710082",
      pozicija: "Konobar",
      sektor: "Banket",
      netopalataIzUgovora: "50.000",
      fixUgovoren: "70.000",
      tipUgovora: "Na odrednjeno",
      kafa: "Da",
      zaRacDnev: "Da",
    },
    371: {
      jmbg: "0204997710082",
      pozicija: "Kuvar",
      sektor: "Banket",
      netopalataIzUgovora: "50.000",
      fixUgovoren: "70.000",
      tipUgovora: "Na neodrednjeno",
      kafa: "Da",
      zaRacDnev: "Da",
    },
  },
};

let data_ = [
  { _id: "66912365d2672debd94a4412", name: "Azimen" },
  { _id: "669135e22f2fe74c42d855bd", name: "Moja organizacija" },
  { _id: "83894b2k464k6v63k8335jg8", name: "Roda" },
  { _id: "df68hd47h9fgj6fjfd0h5d6f", name: "Flixbus" },
];

let jednaOrg = [
  {
    idOrg: "890",
    naziv: "Reddit",
    pib: 8659343,
    mb: 2309420,
    racun: 265 - 423454 - 736,
    tip: "DOO",
    roditeljOrganizacija: "",
    zaposleniList: [
      {
        //jmbg je ovaj jedan section
        ime: "Marija",
        prezime: "Matic",
        jmbg: "0204997710082",
        valuta: "Rsd",
        status: "Aktivan",

        pozicija: "Konobar",
        sektor: "Banket",
        netopalataIzUgovora: "50.000",
        fixUgovoren: "70.000",
        tipUgovora: "Na odrednjeno",
        kafa: "Da",
        zaRacDnev: "Da",
      },

      {
        jmbg: "1325620710084",
        pozicija: "Kuvar",
        sektor: "Kuhinja",
        netopalataIzUgovora: "60.000",
        fixUgovoren: "90.000",
        tipUgovora: "Na neodrednjeno",
        kafa: "Da",
        zaRacDnev: "Ne",
      },
    ],
  },
];

let a = {
  "66912365d2672debd94a4412": {
    organizacijaId: "66912365d2672debd94a4412",
    fixUgovoren: "2323",
    selectedOptionKafa: "Ne",
    selectedOptionDnevnica: "Da",
  },
  "976349052426783449562956": {
    organizacijaId: "976349052426783449562956",
    fixUgovoren: "9548",
    selectedOptionKafa: "Ne",
    selectedOptionDnevnica: "Ne",
  },
  "374289360529734609256478": {
    organizacijaId: "374289360529734609256478",
    fixUgovoren: "6950",
    selectedOptionKafa: "Da",
    selectedOptionDnevnica: "Da",
  },
};

//
function getRandomWord(length = 5) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let word = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    word += letters[randomIndex];
  }
  return word;
}

// console.log(getRandomWord())

//
let myarray = ["a", "b", "c"];

function removeElement(array, element) {
  return array.filter((item) => item !== element);
}

myarray = removeElement(myarray, "a");
// console.log(myarray);

//
const keyToDelete = "66912365d2672debd94a4412";

if (a.hasOwnProperty(keyToDelete)) {
  delete a[keyToDelete];
} else {
  console.log(`Key ${keyToDelete} does not exist in the object.`);
}

// console.log(a);

//Konvertovanje u listu koja ide u select za filtriranje
let list1 = [
  { _id: "66942838ee1921212ef6e3f4", name: "Tip_org_1" },
  { _id: "66942872ee1921212ef6e409", name: "Tip_org_2" },
  { _id: "66967bcee4a9358040418f08", name: "Ogranak" },
  { _id: "66967bd5e4a9358040418f0c", name: "DOO" },
  { _id: "66967be5e4a9358040418f10", name: "Agencija" },
];

const list2 = list1.map((item) => ({
  value: item.name,
  label: item.name,
}));

list2.unshift({ value: "svi", label: "Tip" });

// console.log(list2);

//Output
let userkojisecuva = {
  name: "Rade",
  lastName: "JOvaovic",
  username: "",
  password: "",
  jmbg: "12623734572345",
  roles: ["Zaposleni"],
  plata: "100000",
  status: "Aktivan",
  valuta: "EUR",
  pozicijeUsera: {
    "669135e22f2fe74c42d855bd": {
      _id: "669135e22f2fe74c42d855bd",
      name: "Moja organizacija",
      fixUgovoren: "14256",
      selectedOptionKafa: "Ne",
      selectedOptionDnevnica: "Da",
      netoPlataUgovor: "1234",
      pozcicijaName: "Kuvar",
      tipUgovoraName: "Na odrednjeno",
      sektorName: "Sektor_2",
    },
    "66912365d2672debd94a4412": {
      _id: "66912365d2672debd94a4412",
      name: "Azimen",
      fixUgovoren: "346836",
      selectedOptionKafa: "Da",
      selectedOptionDnevnica: "Ne",
      netoPlataUgovor: "6445",
      pozcicijaName: "Konobar",
      tipUgovoraName: "Na neodrednjeno",
      sektorName: "Sektor_3",
    },
  },
};

//====

let orgs = [
  {
    _id: {
      $oid: "66912365d2672debd94a4412",
    },
    name: "Azimen",
    pib: "123444",
    mb: "34556",
    racun: "23445",
    tip: "Ogranak",
    roditeljOrganizacija: "",
    zaposleni: [
      {
        jmbg: "02482648294",
        pozicija: "Kuvar",
        sektor: "Sektor_1",
        netopalataIzUgovora: "32000",
        fixUgovoren: "50000",
        tipUgovora: "Na odrednjeno",
        kafa: "Da",
        zaRacDnev: "Ne",
        _id: {
          $oid: "66981373bfaa5fd7c0d002bd",
        },
      },
      {
        jmbg: "234524",
        pozicija: "Menadzer",
        sektor: "Sektor_1",
        netopalataIzUgovora: "23234234",
        fixUgovoren: "1232",
        tipUgovora: "Na odrednjeno",
        kafa: "Ne",
        zaRacDnev: "Da",
        _id: {
          $oid: "66981434bfaa5fd7c0d002cf",
        },
      },
      {
        jmbg: "234",
        pozicija: "Kuvar",
        sektor: "Sektor_2",
        netopalataIzUgovora: "12356",
        fixUgovoren: "3234",
        tipUgovora: "Na neodrednjeno",
        kafa: "Ne",
        zaRacDnev: "Da",
        _id: {
          $oid: "669816f5bfaa5fd7c0d002e8",
        },
      },
    ],
    __v: 0,
  },
  {
    _id: {
      $oid: "669135e22f2fe74c42d855bd",
    },
    name: "Moja organizacija",
    pib: "456578697",
    mb: "78956",
    racun: "12324",
    tip: "Agencija",
    roditeljOrganizacija: "",
    zaposleni: [
      {
        jmbg: "02482648294",
        pozicija: "Konobar",
        sektor: "Sektor_2",
        netopalataIzUgovora: "79000",
        fixUgovoren: "60000",
        tipUgovora: "Na neodrednjeno",
        kafa: "Ne",
        zaRacDnev: "Da",
        _id: {
          $oid: "66981373bfaa5fd7c0d002bf",
        },
      },
      {
        jmbg: "234",
        pozicija: "Menadzer",
        sektor: "Sektor_1",
        netopalataIzUgovora: "234",
        fixUgovoren: "675",
        tipUgovora: "Na odrednjeno",
        kafa: "Da",
        zaRacDnev: "Ne",
        _id: {
          $oid: "669816f5bfaa5fd7c0d002ea",
        },
      },
    ],
    __v: 0,
  },
];

let mydata = [
  { _id: "87fs6d57gsfdr", name: "Azimen" },
  { _id: "h32kjnl24jb63", name: "Moja organizacija" },
];

let namesArray = mydata.map((item) => item.name);

// console.log(namesArray); [ "Azimen", "Moja organizacija" ]

function brDanaRadaProsliMesec() {
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth - 1);
  const firstDayOfPreviousMonth = new Date(
    lastDayOfPreviousMonth.getFullYear(),
    lastDayOfPreviousMonth.getMonth(),
    1
  );

  let count = 0;
  let currentDate = new Date(firstDayOfPreviousMonth);

  while (currentDate <= lastDayOfPreviousMonth) {
    if (currentDate.getDay() !== 0) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// const numDays = brDanaRadaProsliMesec();
// console.log(numDays);

function brDanaRadaOvajMesec() {
  const today = new Date();
  const firstDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );
  const lastDayOfCurrentMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );

  let count = 0;
  let currentDate = new Date(firstDayOfCurrentMonth);

  while (currentDate <= lastDayOfCurrentMonth) {
    if (currentDate.getDay() !== 0) {
      // 0 represents Sunday
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// const numDays = brDanaRadaOvajMesec();
// console.log(numDays);

let plata = 55000;

//saljem serveru da bi nasao organizaciju i sve ostale podatke
let sendingForObracuni = {
  fetchID: "8347293",
  idOrganizacije: "2938562938674",
  kurs: "117.52",
  brPrazDana: 4,
  iznosKafe: 35,
};

let obracunMesecni = {
  idObracuna: "7312489367432937246", //Se bira radi fetcha
  fetchID: "8347293",
  kurs: "117.52", //Def u globalnim
  brojZaposlenih: 18, //Ovo je broj zaposlenih iz jedne organizacije
  brPrazDana: 4, //Def u globalnim
  idOrganizacije: "2938562938674",
  zaposleni: [
    {
      jmbg: "2738947", //ime, prezime, jmbg - taj i valuta
      pozicija: { dnevnica: 7500 },
      fixUgovoren: 300000,
      kafa: "Da",
      zaracDnev: "Da",
    },
    {
      jmbg: "89236923", //ime, prezime, jmbg - taj i valuta
      pozicija: { dnevnica: 5000 },
      fixUgovoren: 200000,
      kafa: "Ne",
      zaracDnev: "Da",
    },
    {
      jmbg: "72354824", //ime, prezime, jmbg - taj i valuta
      pozicija: { dnevnica: 2500 },
      fixUgovoren: 800000,
      kafa: "Da",
      zaracDnev: "Ne",
    },
  ],
};

let aaaa = {
  //Ne zanoravi kog je meseca
  organizacijaId: "669f92039f8e6f2c780f54cc",
  key: "Aml3QStsZVllKExmBsx1ai8f6dRieo",
  kurs: "4534",
  brPrazDana: "53",
  iznosKafe: "345",
  zaposleni_: [
    {
      jmbg: "0485935",
      name: "Milan",
      lastName: "Jovanovic",
      valuta: "RSD",
      zaracDnev: "Ne",
      kafa: "Da",
      dnevnica: "24000",
      plata: {
        vrOd: "",
        vrDo: "",
        brRadDa: "",
        dnev: "",
        realPlata: "",
      },
      bol: {
        vrOd: "",
        vrDo: "",
        brDana: "",
        bol: "",
      },
      kazna: {
        tip: "",
        nac: "",
        izn: "",
        kom: "",
      },
      praz: {
        brD: "",
        izn: "",
      },
      tros: {
        ci: "",
        kom: "",
      },
      bon: {
        ci: "",
        kom: "",
      },
      dPrekR: {
        brD: "",
        izn: "",
      },
      rep: {
        ci: "",
        kom: "",
      },
      prev: "",
      np: "",
      prinN: "",
      ak: "",
      kred: "",
    },
  ],
};

let obracunSave = {
  key: "Aml3QStsZVllKExmBsx1ai8f6dRieo", //Iz reduxa
  zaposleni_: [
    {
      jmbg: "0485935",
      name: "Milan",
      lastName: "Jovanovic",
      valuta: "RSD",
      zaracDnev: "Ne",
      kafa: "Da",
      dnevnica: "24000",
      plata: {
        vrOd: "",
        vrDo: "",
        brRadDa: "",
        dnev: "",
        realPlata: "",
      },
      bol: {
        vrOd: "",
        vrDo: "",
        brDana: "",
        bol: "",
      },
      kazna: {
        tip: "",
        nac: "",
        izn: "",
        kom: "",
      },
      praz: {
        brD: "",
        izn: "",
      },
      tros: {
        ci: "",
        kom: "",
      },
      bon: {
        ci: "",
        kom: "",
      },
      dPrekR: {
        brD: "",
        izn: "",
      },
      rep: {
        ci: "",
        kom: "",
      },
      prev: "",
      np: "",
      prinN: "",
      ak: "",
      kred: "",
    },
  ],
};

let generateRandomString = (length = 30) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length },
    () => characters[Math.floor(Math.random() * characters.length)]
  ).join("");
};

// hf7r9tvg0s79tvstvgs8v6ts8pfypbvasi3fdsift6s => Output
// console.log(generateRandomString(30));

const [procenatKazna, setProcenatKazna] = useState("");

const onProcenatKaznaChanged = (e) => {
  setProcenatKazna(e.target.value);
  if (fieldErrors.procenatKazna) {
    setFieldErrors((prev) => ({ ...prev, procenatKazna: false }));
  }
};

<div className="sm:col-span-1">
  <label
    htmlFor="procenatKazna"
    className="block text-sm font-medium leading-6 text-gray-900"
  >
    Procenat
  </label>
  <div className="mt-1">
    <input
      type="number"
      value={procenatKazna}
      onChange={onProcenatKaznaChanged}
      name="procenatKazna"
      id="procenatKazna"
      autoComplete="procenatKazna"
      className="block w-full rounded border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
    />
    {/* {isHoveredKazna && komentarKazna && (
            <div className="relative top-full mt-1 left-0 bg-gray-200 text-gray-900 text-xs rounded p-1 shadow-lg z-50">
                {komentarKazna}
            </div>
        )} */}
  </div>
</div>;

//Napravi strukturu svake ishrane i sacuvaj ih u bazu
//U padajucem meniju napravi da se prikazuju sve nishrane
//Defaultno je izbrano prva - Tvoja ishrana

//Ovde su sve namirnice
let ishrana = {
  id: "a8w94y983y9",
  naziv: "Keto",
  komentar:
    "Ovo je ishrana gde sam određuješ koje namirnice jedeš a koje ne. Ovo je verovatno najbolji vid ishrane ako poznaješ dovoljno sebe i odlučan si u tome šta voliš a šta ne. U okviru opcije Tvoja ishrana možeš da menjaš namirnice. ",
  namirnice: [
    {
      id: "sfdg7d86f598",
      ime: "Celer",
      tip: "Povrce",
      podtip: "Lisnato",
      Gluten: "true",
      Laktoza: "false",
      Alergen: "false",
      Ishrana: ["Keto", "Vege", "Moja izhrana"],
    },
    {
      ime: "Kravlje",
      tip: "Mlecni proiz",
      podtip: "Mleko",
      Gluten: "true",
      Laktoza: "false",
      Alergen: "false",
      Ishrana: ["Keto", "Vege"],
    },
  ],

  voce: {
    citrus: ["Narandza", "Limun", "Grejpfrut", "Mandarina"],
    bobicasto: ["Jagoda", "Malina", "Borovnica", "Kupina", "Ribizla"],
    kostunjicavo: ["Breskva", "Šljiva", "Trešnja", "Kajsija", "Višnja"],
    tropsko: ["Banana", "Mango", "Ananas", "Papaja", "Kivi"],
    jabIkrus: ["Jabuka", "Kruska", "Dinja"],
    lubenica: ["Lubenica", "Dinja"],
  },
  povrce: {
    lisnato: [
      "Spanać",
      "Blitva",
      "Kelj",
      "Zelena salata",
      "Rukola",
      "Matovilac",
      "Celer",
    ],
    korenito: ["Šargarepa", "Cvekla", "Krompir", "Batat", "Rotkva"],
    tikve: ["Bundeva", "Tikvica", "Krastavac"],
    lukvicasto: ["Crni luk", "Beli luk", "Praizluk"],
    paprikeIparadajz: ["Paradajz", "Paprika", "Čili papričice"],
    mahunarke: ["Grašak", "Pasulj", "Sočivo", "Leblebija", "Soja"],
  },
  orasastiPlodIsSem: {
    orsasatiPlod: ["Badem", "Orah", "Lešnik", "Indijski orah", "Kikiriki"],
    semenke: ["Suncokret", "Lan", "Susam", "Bundeva"],
  },
  zitarice: {
    celovite: [
      "Pšenica",
      "Ječam",
      "Ovas",
      "Raž",
      "Spelta",
      "Heljda",
      "Proso",
      "Pririnač (integralni)",
      "Kukuruz",
    ],
    proizOdCelZit: [
      "Hleb od celovitog zrna",
      "Integralna Testenina",
      "Ovsena kaša",
    ],
    rafinisane: [
      "Beli hleb",
      "Beli pirinač",
      "Obična testenina",
      "Keks",
      "Kolač",
    ],
  },
  mlecniProiz: {
    mleko: ["Kravlje", "Kozije", "Sojno", "Bademovo (alternativna mleka)"],
    jogurt: ["Običan", "Grčki", "Voćni"],
    sir: ["Gauda", "Edamer", "Feta", "Parmezan", "Mozzarela", "Rikota"],
    kisMleko: ["Kefir", "Kiselo mleko"],
    pavlakaImaslac: ["Kisela pavlaka", "Slatka pavlaka", "Maslac"],
  },
  mesoRibaJaja: {
    crvMes: ["Govedina", "Teletina", "Svinjetina", "Jagnjetina", "Konjetina"],
    belMes: ["Piletina", "Pačetina", "Ćuretina", "Guščetina"],
    ribImorsPlod: [
      "Šaran",
      "Som",
      "Pastrmka",
      "Smudj",
      "Deverika",
      "Kečiga",
      "Štuka",
      "Losos",
      "Tuna",
      "Bakalar",
      "Lignje",
      "Skuša",
      "Škampi",
    ],
    preradj: [
      "Šunka",
      "Slanina",
      "Kobasice",
      "Salama",
      "Pašteta",
      "Mesni narezak",
    ],
    jaja: ["Pileća", "Prepeličija"],
  },
  uljeMastiSeceri: {
    biljUlj: ["Maslinovo", "Suncokretovo", "Kokosovo", "Laneno", "Ulje repice"],
    maslImar: ["Margarin", "Mlečni maslac - puter"],
    secIzas: ["Beli šećer", "Smedji šećer", "Med", "Agava", "Javorov sirup"],
  },
  pica: {
    sokovi: ["Voćni sokovi", "Povrćni", "Smuti"],
    kadIcaj: ["Crni čaj", "Zeleni čaj", "Biljni čaj", "Crna kafa"],
    aklohol: ["Vino", "Pivo", "Rakija", "Votka", "Viski"],
    bezalk: ["Gazirani sokovi", "Energetska pića"],
  },
};

//Da kada kreira ishranu imace da mu se prikazuju svi podaci
//Jedan dropdown gde cu imati sve
let maneUHrani = {
  gluten: [
    "Pšenica",
    "Ječam",
    "Ovas",
    "Raž",
    "Spelta",
    "Hleb od celovitog zrna",
    "Integralna Testenina",
    "Ovsena kaša",
    "Beli hleb",
    "Obična testenina",
    "Keks",
    "Kolač",
  ], //Izbacujem sve
  laktoza: [
    "Kravlje",
    "Običan",
    "Grčki",
    "Voćni",
    "Gauda",
    "Edamer",
    "Feta",
    "Parmezan",
    "Mozzarela",
    "Rikota",
    "Kefir",
    "Kiselo mleko",
    "Kisela pavlaka",
    "Slatka pavlaka",
    "Maslac",
  ], //Izbacujem sve
  //Izbacujem pojedinacno selektovano
  alergeni: [
    "Celer",
    "Soja",
    "Badem",
    "Orah",
    "Lešnik",
    "Indijski orah",
    "Kikiriki",
    "Susam",
    "Pšenica",
    "Ječam",
    "Ovas",
    "Raž",
    "Kravlje mleko",
    "Kozije mleko",
    "Sojno mleko",
    "Bademovo mleko",
    "Šaran",
    "Som",
    "Pastrmka",
    "Smudj",
    "Deverika",
    "Kečiga",
    "Štuka",
    "Losos",
    "Tuna",
    "Bakalar",
    "Lignje",
    "Skuša",
    "Škampi",
    " jaja",
  ],
};

let cilj = {
  tip: "Primaran/Specificn/Motivacija",
  name: "Mrsavljenje/Povecanjemase...",
};

let fizPar = {
  tip: "FizickaAktivnost/Dijagnoza",
  name: "Trcanje/Joga/Dijabetes/Srcane bolesti",
};

//
let novaIsh = {
  id: "a8w94y983y9",
  naziv: "Keto",
  komentar:
    "Ovo je ishrana gde sam određuješ koje namirnice jedeš a koje ne. Ovo je verovatno najbolji vid ishrane ako poznaješ dovoljno sebe i odlučan si u tome šta voliš a šta ne. U okviru opcije Tvoja ishrana možeš da menjaš namirnice. ",
  namirnice: [idNam, idNam, idNam],
};

let namirnica = [
  {
    idNam: "7f5g75fd8",
    ime: "Narandza",
    tip: "Voce",
    podtip: "Citrus",
    Gluten: "false",
    Laktoza: "false",
    Alergen: "false",
    Ishrana: ["Dijet", "Vege"],
  },
  {
    idNam: "7f5g75fd8",
    ime: "Linum",
    tip: "Voce",
    podtip: "Citrus",
    Gluten: "false",
    Laktoza: "false",
    Alergen: "false",
    Ishrana: ["Peleo", "Vege", "Ultra brza ishrana"],
  },
  {
    idNam: "7f5g75fd8",
    ime: "Celer",
    tip: "Povrce",
    podtip: "Lisnato",
    Gluten: "true",
    Laktoza: "false",
    Alergen: "false",
    Ishrana: ["Keto", "Vege"],
  },
  {
    idNam: "7564958",
    ime: "Ovas",
    // tip: "Zitarice",
    // podtip: "Celovito",
    Gluten: "true",
    Laktoza: "false",
    Alergen: "true",
    Ishrana: ["Keto", "Vege"],
  },
];

let model = [
  {
    tip: {
      ime: "",
      podtip: {
        ime: "",
        nam: [idNam],
      },
    },
  },
];

let dataModel = [
  {
    tip: {
      ime: "Voce",
      podtip: [
        {
          ime: "Citrus",
          nam: [
            {
              idNam: "dfg4578dg0",
              ime: "Narandza",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "92734n203",
              ime: "Limun",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "b3o4yt8n3",
              ime: "Grejp",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
          ],
        },
        {
          ime: "Bobicasto",
          nam: [
            {
              idNam: "dfg4578dg0",
              ime: "Jagoda",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "92734n203",
              ime: "Malina",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "b3o4yt8n3",
              ime: "Kupina",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
          ],
        },
      ],
    },
  },
  {
    tip: {
      ime: "Povrce",
      podtip: [
        {
          ime: "Lisnato",
          nam: [
            {
              idNam: "dfg4578dg0",
              ime: "Spanac",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "92734n203",
              ime: "Blitva",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "b3o4yt8n3",
              ime: "Kelj",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
          ],
        },
        {
          ime: "Korenito",
          nam: [
            {
              idNam: "dfg4578dg0",
              ime: "Sargarepa",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "92734n203",
              ime: "Cvekla",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
            {
              idNam: "b3o4yt8n3",
              ime: "Klej",
              Gluten: "true",
              Laktoza: "false",
              Alergen: "true",
            },
          ],
        },
      ],
    },
  },
];

//Moj dnevnik record
let mojDnevnik = [
  {
    idKlijenta: "",
    god: "27",
    tezina: "78",
    visina: "183",
    struk: "50",
    vrat: "12",
    kuk: "",
    bmi: "",
    procenatTelesneMase: "",
    telesnaMasa: "",
    cistaTelesnaMast: "",
    idealneTelesneMasti: "",
    povecanje: "",
    smanjenje: "",
    telesnaMasaBmi: "",
    kategorija: "",
  },
  {
    id: "7c24n98273",
    idKlijenta: " 3567u33u3u",
    god: "21",
    tezina: "45",
    visina: "190",
    struk: "60",
    vrat: "14",
    kuk: "40",
    bmi: "23.65", //Kg/m2
    procTelMas: "1.11%",
    telMast: "7.34kg",
    leanBodMas: "31.13kg",
    idealTelMas: "54.30%",
    telMastIdelKg: "2.64",
    telMastBmiM: "13.96",
    katTelMas: "Gojaznost",
  },
  {
    id: "n7x470c2cm2",
    idKlijenta: "h894nvy298",
    god: "14",
    tezina: "58",
    visina: "133",
    struk: "10",
    vrat: "12",
    kuk: "",
    bmi: "", //Kg/m2
    procTelMas: "8.03%",
    telMast: "6.27kg",
    leanBodMas: "71.73kg",
    idealTelMas: "12.70%",
    telMastIdelKg: "3.64",
    telMastBmiM: "17.96",
    katTelMas: "Sportisti",
  },
  {
    id: "n7x470c2cm2",
    idKlijenta: "h894nvy298",
    god: "27",
    tezina: "78",
    visina: "183",
    struk: "50",
    vrat: "12",
    kuk: "",
    bmi: "", //Kg/m2
    procTelMas: "8.03%",
    telMast: "6.27kg",
    leanBodMas: "71.73kg",
    idealTelMas: "12.70%",
    telMastIdelKg: "3.64",
    telMastBmiM: "17.96",
    katTelMas: "Sportisti",
  },
];

//Bmi
//

//SAMPLE SIZES
// Age: 25 years
// Gender: Male
// Weight: 75 kg
// Height: 175 cm
// Waist Circumference: 85 cm
// Neck Circumference: 37 cm
// Hip Circumference: N/A (not applicable for males)

// Age: 35 years
// Gender: Male
// Weight: 90 kg
// Height: 180 cm
// Waist Circumference: 95 cm
// Neck Circumference: 40 cm

// Age: 30 years
// Gender: Female
// Weight: 65 kg
// Height: 165 cm
// Waist Circumference: 70 cm
// Neck Circumference: 32 cm
// Hip Circumference: 98 cm

// Age: 28 years
// Gender: Female
// Weight: 70 kg
// Height: 170 cm
// Waist Circumference: 75 cm
// Neck Circumference: 33 cm
// Hip Circumference: 100 cm

//Mogucnost brisanja recorda pracenja procesa u mom dnevniku
//Graph za: Procenat telesne masti, Telesne masti i Čista telesna mast ()

//ON HOCE SAMO DA DODAJE NAMIRNICE A TIPOVI I PODTIPOVI SU HARDKODOVANI

//Učestalost obroka???:
//1 (Rucak)
//2 (Dorucak Rucak)
//3 (Dorucak Rucak Vecera)
//4 (Dorucak Uzina Rucak Vecera)
//5 (Dorucak Uzina Rucak Uzina Vecera)

let naminice = [
  {
    id: "8y43n94283n",
    podgrupa: "Citrus",
    naziv: "Limun",
    gluten: true,
    alergen: false,
    laktoza: false,
    ishrane: ["Keto", "Vege"],
  },
  {
    id: "n98c3vv3",
    podgrupa: "Citrus",
    naziv: "Pomorandza",
    gluten: true,
    alergen: true,
    laktoza: false,
    ishrane: ["Peleo", "Vege"],
  },
  {
    id: "8s7f57s7",
    podgrupa: "Bobicasto",
    naziv: "Limun",
    gluten: true,
    alergen: false,
    laktoza: false,
    ishrane: ["Keto"],
  },
];

let ishrane = [
  {
    id: "8s7f57s7",
    podgrupa: "Bobicasto",
    naziv: "Limun",
    gluten: true,
    alergen: false,
    laktoza: false,
    ishrane: ["Keto"],
  },
];

//Model namirnice:
// {
//     "_id": "ObjectId",
//     "naziv": "String",
//     "laktoza": "Boolean",
//     "gluten": "Boolean",
//     "alergen": "Boolean",
//     "grupa": "String"
// }

// Model ishrane:
// {
//     "naziv": "String",
//     "komentar": "String",
//     "namirnice": [
//       {
//         "$ref": "namirnice",
//         "$id": "ObjectId"
//       }
//     ]
// }

const faqs = [
  {
    id: 1,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 2,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 3,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 4,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 5,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    id: 6,
    question: "What's the best thing about Switzerland?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  // More questions...
];

//Edit naminrica

// {/* Popup forma */}
// {isPopupOpen && (
//     <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg z-50 max-w-md w-full max-h-screen overflow-y-auto" ref={popupRef}>
//         <h2 className="text-xl font-bold mb-4">Kreiraj/Izmeni Ishranu</h2>
//         <form onSubmit={handleSubmit}>
//           {/* Naziv Ishrane */}
//           <div className="mb-4">
//             <label className="block text-gray-700 font-bold mb-2">
//               Naziv Ishrane: <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={nazivIshrane}
//               onChange={(e) => setNazivIshrane(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//               required
//             />
//           </div>

//           {/* Komentar */}
//           <div className="mb-4">
//             <label className="block text-gray-700 font-bold mb-2">Komentar:</label>
//             <textarea
//               value={komentar}
//               onChange={(e) => setKomentar(e.target.value)}
//               className="w-full px-3 py-2 border rounded-lg"
//               rows="3"
//             ></textarea>
//           </div>

//           {/* Poruka o grešci */}
//           {errorMessage && (
//             <div className="mb-4 text-red-500 font-bold">
//               {errorMessage}
//             </div>
//           )}

//           {/* Odabir Namirnica */}
//           {/* IMAJ U VIDU OVAJ DEO KODSA JER STRUKTUIRA GRUPE NAMIRNICE I PODTIPOVE !!! POSTAVI I CONDITIONAL !!! */}
//           <div className="mb-4">
//             <h3 className="text-xl font-semibold mb-2">Odabir Namirnica</h3>
//             <div className="overflow-y-scroll" style={{ maxHeight: "400px" }}>
//               {Object.keys(grupisaneNamirnice).map((grupa) => (
//                 <div key={grupa} className="mb-4">
//                   <h3 className="text-lg font-semibold">{grupa}</h3>
//                   {Object.keys(grupisaneNamirnice[grupa]).map((podtip) => (
//                     <div key={podtip} className="ml-4 mb-2">
//                       <h4 className="text-md font-medium">{podtip}</h4>
//                       <div className="ml-6">
//                         {grupisaneNamirnice[grupa][podtip].map((namirnica) => (
//                           <div key={namirnica._id} className="flex items-center mb-1">
//                             <input
//                               type="checkbox"
//                               value={namirnica._id}
//                               checked={odabraneNamirnice.includes(namirnica._id)}
//                               onChange={handleNamirnicaChange}
//                               className="mr-2"
//                             />
//                             <label>
//                               {namirnica.naziv}{" "}
//                               {namirnica.alergen ? "(Alergen)" : namirnica.gluten ? "(Sadrži Gluten)" : namirnica.laktoza ? "(Sadrži Laktozu)" : ""}
//                             </label>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600"
//           >
//             Sačuvaj Ishranu
//           </button>
//         </form>
//       </div>
//     </div>
//   )}

// useEffect(() => {
//     console.log("Promena u odabranim namirnicama:", odabraneNamirnice);
//   }, [odabraneNamirnice]);

//   bg-white

// Bolesti i Zdravstveni Problemi
// Mentalno Zdravlje i Psihološki Aspekti
// Fizička Kondicija i Performanse
// Zdravstvene Navike i Prevencija
// Specifični Ciljevi za Životni Stil

let selected = {
  "671a1c1632c617b42f16fa52": false,
  "671a1c5832c617b42f16fa62": false,
  "671a1c8032c617b42f16fa69": false,
  "6718bf91bda1cf252d98ec44": false,
  "6718d9e8bda1cf252d98ecb9": false,
  "671784a5782070c626c837d8": true,
  "671790ddfd27a07021e11368": true,
  "6717941efd27a07021e11378": true,
};

let odabranenami = [
  "671f5bec5997900563cea6d1",
  "671f5b785997900563cea6a7",
  "671f5d265997900563cea74f",
  "671f6cc85997900563ceaa70",
];

let namir = [
  {
    _id: "671f5b785997900563cea6a7",
    naziv: "Narandža",
    grupa: "Voće",
    podtip: "Citrus",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5b9a5997900563cea6b5",
    naziv: "Limun",
    grupa: "Voće",
    podtip: "Citrus",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: ["Novi kombi max"],
  },
  {
    _id: "671f5bd75997900563cea6c3",
    naziv: "Grejpfrut",
    grupa: "Voće",
    podtip: "Citrus",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: ["Novi kombi max"],
  },
  {
    _id: "671f5bec5997900563cea6d1",
    naziv: "Mandarina",
    grupa: "Voće",
    podtip: "Citrus",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5c2b5997900563cea6df",
    naziv: "Jagoda",
    grupa: "Voće",
    podtip: "Bobičasto",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5c995997900563cea6ed",
    naziv: "Malina",
    grupa: "Voće",
    podtip: "Bobičasto",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5cb05997900563cea6fb",
    naziv: "Borovnica",
    grupa: "Voće",
    podtip: "Bobičasto",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5cca5997900563cea717",
    naziv: "Kupina",
    grupa: "Voće",
    podtip: "Bobičasto",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5ce05997900563cea72c",
    naziv: "Ribizla",
    grupa: "Voće",
    podtip: "Bobičasto",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5d265997900563cea74f",
    naziv: "Breskva",
    grupa: "Voće",
    podtip: "Kostunjicavo",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5d4c5997900563cea75d",
    naziv: "Šljiva",
    grupa: "Voće",
    podtip: "Kostunjicavo",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5e715997900563cea7aa",
    naziv: "Trešnja",
    grupa: "Voće",
    podtip: "Kostunjicavo",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5ea75997900563cea7c5",
    naziv: "Kajsija",
    grupa: "Voće",
    podtip: "Kostunjicavo",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5eb85997900563cea7d2",
    naziv: "Višnja",
    grupa: "Voće",
    podtip: "Kostunjicavo",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5ed75997900563cea7ed",
    naziv: "Banana",
    grupa: "Voće",
    podtip: "Tropsko",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5ef95997900563cea816",
    naziv: "Mango",
    grupa: "Voće",
    podtip: "Tropsko",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5f7c5997900563cea837",
    naziv: "Ananas",
    grupa: "Voće",
    podtip: "Tropsko",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5f915997900563cea844",
    naziv: "Papaja",
    grupa: "Voće",
    podtip: "Tropsko",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5f9e5997900563cea851",
    naziv: "Kivi",
    grupa: "Voće",
    podtip: "Tropsko",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5fd15997900563cea86c",
    naziv: "Jabuka",
    grupa: "Voće",
    podtip: "Jabuke i Kruške",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5fdf5997900563cea879",
    naziv: "Kruška",
    grupa: "Voće",
    podtip: "Jabuke i Kruške",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f5fef5997900563cea886",
    naziv: "Dunja",
    grupa: "Voće",
    podtip: "Jabuke i Kruške",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f60115997900563cea893",
    naziv: "Lubenica",
    grupa: "Voće",
    podtip: "Lubenica",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f60265997900563cea8a0",
    naziv: "Dinja",
    grupa: "Voće",
    podtip: "Lubenica",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: [],
  },
  {
    _id: "671f6cc85997900563ceaa70",
    naziv: "Spanać",
    grupa: "Povrće",
    podtip: "Lisnato",
    laktoza: false,
    gluten: false,
    alergen: false,
    __v: 0,
    ishrane: [
      "Tvoja ishrana",
      "Biljna ishrana",
      "Keto dijeta",
      "Mediteranska dijeta",
      "Veganska dijeta",
      "Paleo dijeta",
      "Bezglutenska dijeta",
      "Fleksitarijanska dijeta",
      "Tvoja ishrana ZA SVAKI DŽEP",
    ],
    ciljevi: ["Novi kombi max", "YYyY", "List", "Vege1"],
  },
];

let sadas = [
  {
    _id: "6728aa8464c5fe6e9ff5ac92",
    tip: "specCilj",
    naziv: "Upravljanje dijabetesom tipa 2",
    defTip: "Bolesti i Zdravstveni Problemi",
    namirnice: [
      "671f5b785997900563cea6a7",
      "671f5bd75997900563cea6c3",
      "671f5c2b5997900563cea6df",
      "671f5c995997900563cea6ed",
      "671f5cb05997900563cea6fb",
      "671f5cca5997900563cea717",
    ],
    __v: 0,
  },
  {
    _id: "6728aab464c5fe6e9ff5ac96",
    tip: "specCilj",
    naziv: "Smanjenje stresa i anksioznosti kroz ishranu",
    defTip: "Mentalno Zdravlje i Psihološki Aspekti",
    namirnice: [
      "671f5bd75997900563cea6c3",
      "671f5bec5997900563cea6d1",
      "671f5ce05997900563cea72c",
      "671f5d265997900563cea74f",
    ],
    __v: 0,
  },
];
// let lista = ['671f99bfd1348708c15bae5f','671f98fad1348708c15badd9','671f98dbd1348708c15badbb','671f990ad1348708c15bade8','671f98ebd1348708c15badca','671f98cbd1348708c15badac','671f98b7d1348708c15bad9d','671f98b7d1348708c15bad9d','671f98a3d1348708c15bad8e','671f988ed1348708c15bad7f','671f987dd1348708c15bad70','671f986dd1348708c15bad61','671f985cd1348708c15bad52','671f9844d1348708c15bad43','671f9835d1348708c15bad34','671f951ed1348708c15babd5','671f94f5d1348708c15babc6','671f94b6d1348708c15babb7','671f948cd1348708c15baba8','671f82c75997900563cead79','671f82b35997900563cead6a','671f829b5997900563cead5b','671f82735997900563cead4c','6717c4f9dcde0ddee8cb20fb', '67178cd4782070c626c8382f', '67178d4d782070c626c8384b', '67178dc0782070c626c83865', '67178ce6782070c626c83833', '67178d15782070c626c8383f', '6717dce0170ab064a200fc62', '67178e0e782070c626c83875', '67178cf6782070c626c83837', '6718bf3bbda1cf252d98ec3b', '67178d05782070c626c8383b', '671d3b245997900563cea1c6', '671d42d25997900563cea424', '671d4c6f5997900563cea51c', '671f5b785997900563cea6a7', '671f5b9a5997900563cea6b5', '671f5bd75997900563cea6c3', '671f5bec5997900563cea6d1', '671f5c2b5997900563cea6df', '671f5c995997900563cea6ed', '671f5cb05997900563cea6fb', '671f5cca5997900563cea717', '671f5ce05997900563cea72c', '671f5d265997900563cea74f', '671f5d4c5997900563cea75d', '671f66e45997900563cea8fa', '671f67465997900563cea917', '671f67bc5997900563cea943', '671f5e715997900563cea7aa', '671f5ea75997900563cea7c5', '671f5eb85997900563cea7d2', '671f5ed75997900563cea7ed', '671f5ef95997900563cea816', '671f5f7c5997900563cea837', '671f5f915997900563cea844', '671f5f9e5997900563cea851', '671f5fd15997900563cea86c', '671f5fdf5997900563cea879', '671f5fef5997900563cea886', '671f60115997900563cea893', '671f60265997900563cea8a0', '671f6cc85997900563ceaa70', '671f6d555997900563ceaa8e', '671f6d625997900563ceaa9d', '671f6d775997900563ceaaac', '671f6d895997900563ceaabb', '671f6d9e5997900563ceaad1', '671f6daf5997900563ceaae0', '671f761e5997900563ceab36', '671f762e5997900563ceab45', '671f763b5997900563ceab54', '671f764e5997900563ceab63', '671f765d5997900563ceab72', '671f7e5d5997900563ceabbd', '671f7e705997900563ceabcf', '671f7e815997900563ceabde', '671f7fd15997900563ceac00', '671f7fee5997900563ceac16', '671f7fff5997900563ceac25', '671f80235997900563ceac34', '671f80335997900563ceac43', '671f80495997900563ceac52', '671f80645997900563ceac61', '671f80735997900563ceac70', '671f80865997900563ceac7f', '671f809b5997900563ceac8e', '671f80aa5997900563ceac9d', '671f81235997900563ceacac', '671f81335997900563ceacbb', '671f81445997900563ceacca', '671f81595997900563ceacd9', '671f81705997900563ceace8', '671f81875997900563ceacf7', '671f81955997900563cead06', '671f81ba5997900563cead19']

const [odabraneNamirnice, setOdabraneNamirnice] = useState([
  "671f99bfd1348708c15bae5f",
  "671f98fad1348708c15badd9",
  "671f98dbd1348708c15badbb",
  "671f990ad1348708c15bade8",
  "671f98ebd1348708c15badca",
  "671f98cbd1348708c15badac",
  "671f98b7d1348708c15bad9d",
  "671f98a3d1348708c15bad8e",
  "671f988ed1348708c15bad7f",
  "671f987dd1348708c15bad70",
  "671f986dd1348708c15bad61",
  "671f985cd1348708c15bad52",
  "671f9844d1348708c15bad43",
  "671f9835d1348708c15bad34",
  "671f951ed1348708c15babd5",
  "671f94f5d1348708c15babc6",
  "671f94b6d1348708c15babb7",
  "671f948cd1348708c15baba8",
  "671f82c75997900563cead79",
  "671f82b35997900563cead6a",
  "671f829b5997900563cead5b",
  "671f82735997900563cead4c",
  "671f81ba5997900563cead19",
  "671f81705997900563ceace8",
  "671f81595997900563ceacd9",
  "671f81445997900563ceacca",
  "671f81335997900563ceacbb",
  "671f81235997900563ceacac",
  "671f80aa5997900563ceac9d",
  "671f6daf5997900563ceaae0",
]);

let = {
  dan: "Dan 1",
  obrok: {
    NazivObroka: "Naslov: sikgjdasjdglasf",
    Naslov: "asdfasdfsad",
    Opis: "asfdgadfshad",
    Sastojci: "adfhqdfh",
    Instrukcije: "adtjadtj",
    Kalorije: "dtjqdtjqaetd",
  },
  obrok: {
    Naslov: "asdfasdfsad",
    Opis: "asfdgadfshad",
    Sastojci: "adfhqdfh",
    Instrukcije: "adtjadtj",
    Kalorije: "dtjqdtjqaetd",
  },
  obrok: {
    Naslov: "asdfasdfsad",
    Opis: "asfdgadfshad",
    Sastojci: "adfhqdfh",
    Instrukcije: "adtjadtj",
    Kalorije: "dtjqdtjqaetd",
  },
};

const hol = {
  fizickoZdravlje: "opis o fizičkom zdravlju",
  zdraveNavike: "opis o zdravim navikama",
  preventivnaNega: "opis o preventivnoj nezi",
  odrzavanjeBilansa: "opis održavanju bilansa",
};

klijentData = {
  tez: "",
  visina: "",
  primCilj: "",
  komCilja: "",
  specCilj: ["", ""],
  motiv: "",
  komCilja: "",
  nivoAkt: "",
  datumRodj: "",
  tdee: "",
  vrstaFiz: ["", ""],
  struk: "",
  kuk: "",
  but: "",
  kvr: "",
  dijag: "",
  alerg: "",
  ish: "",
  obr: "",
  naviIsh: "",
  pretIskDij: "",
  pus: "",
  alk: "",
};

// LAKTOZA
// Kravlje mleko
// Jogurt
// Grčki jogurt
// Voćni jogurt
// Gauda
// Edamer
// Feta
// Parmezan
// Mozzarela
// Rikota
// Kefir
// Kiselo mleko
// Kisela pavlaka
// Slatka pavlaka

// GLUTEN
// Pšenica
// Ječam
// Ovas
// Raž
// Spelta
// Hleb od celovitog zrna
// Integralna testenina
// Ovsena kaša
// Beli hleb
// Obična testenina
// Keks
// Kolač

// Težina: 80
// Visina: 181
// Primarni cilj: Ishrana za trudnice i porodilje
// Motivacija:
// Datum rođenja: 1997-04-02
// TDEE: 2524.33
// BMI: 22.2
// BMR: 1900.2
// Vrsta fizičke aktivnosti: Vožnja bicikla, Zumba ili plesni fitnes, Planinarenje
// Struk: 101
// Kuk: 100
// Krvna grupa: A
// Dijagnoza: Dijabetes
// Alergije: Moja alrg
// Ishrana: Tvoja ishrana
// Broj obroka: Doručak, Ručak, Večera
// Pusenje: 3 cigareta
// Alkohol: 2 do 4 vino

// Dan 1
//     Opis:
//     Sastojci:
//     Instrukcije:
//     Kalorije:
//     Vreme pripreme: [x] minuta
//     Cena:

// Dan 2
//     Opis:
//     Sastojci:
//     Instrukcije:
//     Kalorije:

// Ime i prezime
// Cilj
// Specifični cilj
// Motivacija za promenu
// Nivo fizičke aktivnosti
// Vrste fizičke aktivnosti
// Stanje imuniteta
// Vrste ishrane
// Navike u ishrani

// db.promptovis.insertOne({
//     "prompt": "1",
//     "holisticki": {
//       "text": "Holistički pristup zdravlju",
//       "brKar": 3
//     },
//     "planIsh": {
//       "text": "Plan ishrane je uravnotežen",
//       "brKar": 5
//     },
//     "fizAkt": {
//       "text": "Fizička aktivnost uključuje svakodnevno hodanje",
//       "brKar": 2
//     },
//     "imun": {
//       "text": "Imunitet je u dobrom stanju",
//       "brKar": 4
//     },
//     "san": {
//       "text": "San je redovan i kvalitetan",
//       "brKar": 6
//     },
//     "voda": {
//       "text": "Dovoljna količina vode dnevno",
//       "brKar": 7
//     },
//     "predijeta": {
//       "text": "Predijeta je bila efikasna",
//       "brKar": 8
//     },
//     "alergiio": {
//       "text": "Nema alergija na hranu",
//       "brKar": 1
//     },
//     "alk": {
//       "text": "Alkohol se konzumira umeren",
//       "brKar": 2
//     },
//     "pus": {
//       "text": "Ne puši",
//       "brKar": 0
//     }
//   })

let ishranee = [
  {
    _id: "671784a5782070c626c837d8",
    naziv: "Tvoja ishrana",
    komentar:
      "Ovo je ishrana gde sam određuješ koje namirnice jedeš, a koje ne. Ovo je verovatno najbolji vid ishrane ako poznaješ dovoljno sebe i odlučan si u tome šta voliš a šta ne.",
    namirnice: [
      "6717c4f9dcde0ddee8cb20fb",
      "67178cd4782070c626c8382f",
      "67178d4d782070c626c8384b",
      "67178dc0782070c626c83865",
      "67178ce6782070c626c83833",
      "67178d15782070c626c8383f",
      "6717dce0170ab064a200fc62",
      "671f9cbcd1348708c15bb00f",
      "671f9df0d1348708c15bb051",
      "671f9e0dd1348708c15bb060",
      "672490f6d2ccc141bc53263d",
      "67249137d2ccc141bc532659",
    ],
  },
  {
    _id: "671790ddfd27a07021e11368",
    naziv: "Biljna ishrana",
    komentar:
      "Biljna ishrana se temelji na konzumiranju namirnica biljnog porekla, uključujući voće, povrće, integralne žitarice, mahunarke, orašaste plodove i semenke. Ova vrsta ishrane isključuje ili značajno ograničava namirnice životinjskog porekla, kao što su meso, mlečni proizvodi i jaja. Fokus je na prirodnim, neobrađenim sastojcima bogatim vlaknima, vitaminima, mineralima i antioksidansima, što doprinosi zdravlju srca, smanjenju rizika od hroničnih bolesti poput dijabetesa tipa 2, gojaznosti i određenih vrsta raka.\nBiljna ishrana je poznata po svojoj održivosti, ekološkim prednostima, i podršci zdravom načinu života.",
    namirnice: [
      "67178cc0782070c626c8382b",
      "67178cf6782070c626c83837",
      "67178d15782070c626c8383f",
      "671f840a5997900563ceae05",
      "671f99f3d1348708c15bae7d",
      "671f9a38d1348708c15baeaa",
      "671f9b36d1348708c15baf40",
      "671f9bd6d1348708c15baf71",
      "671f9be9d1348708c15baf80",
      "671f9bfbd1348708c15baf8f",
      "671f9c0ad1348708c15baf9e",
      "672490f6d2ccc141bc53263d",
      "67249137d2ccc141bc532659",
    ],
  },
  {
    _id: "6717941efd27a07021e11378",
    naziv: "Keto dijeta",
    komentar:
      "Popularna zbog svojih brzih rezultata u gubitku težine, ova dijeta je niskougljenična i visokomasna. Posebno je popularna među ljudima koji žele da brzo izgube težinu.",
    namirnice: [
      "6717c1b9d60786f9d9a0f8e1",
      "6717c4f9dcde0ddee8cb20fb",
      "67178cd4782070c626c8382f",
      "67178d4d782070c626c8384b",
      "671f9b63d1348708c15baf4f",
      "671f9b85d1348708c15baf5e",
      "671f9bd6d1348708c15baf71",
      "671f9be9d1348708c15baf80",
      "671f9bfbd1348708c15baf8f",
      "671f9c0ad1348708c15baf9e",
      "671f9df0d1348708c15bb051",
      "671f9e0dd1348708c15bb060",
      "67249137d2ccc141bc532659",
    ],
  },
  {
    _id: "671794e2fd27a07021e11385",
    naziv: "Mediteranska dijeta",
    komenta:
      "Ova dijeta je poznata po svojim zdravstvenim prednostima, uključujući smanjenje rizika od kardiovaskularnih bolesti. Ona se fokusira na unos voća, povrća, ribe, maslinovog ulja, i celih žitarica.",
    namirnice: [
      "671f9b36d1348708c15baf40",
      "671f9b63d1348708c15baf4f",
      "671f9b85d1348708c15baf5e",
      "671f9bd6d1348708c15baf71",
      "671f9be9d1348708c15baf80",
      "671f9bfbd1348708c15baf8f",
      "671f9c0ad1348708c15baf9e",
      "672490f6d2ccc141bc53263d",
      "67249137d2ccc141bc532659",
    ],
  },
  {
    _id: "6718bf91bda1cf252d98ec44",
    naziv: "Veganska dijeta",
    komentar:
      "Sve veći broj ljudi prelazi na veganstvo zbog zdravstvenih, etičkih ili ekoloških razloga. Važno je ponuditi planove ishrane koji su potpuno bazirani na biljkama.",
    namirnice: [
      "671f9be9d1348708c15baf80",
      "671f9bfbd1348708c15baf8f",
      "671f9c0ad1348708c15baf9e",
      "671f9c34d1348708c15bafb1",
      "671f9c4ad1348708c15bafc0",
      "671f9c59d1348708c15bafcf",
      "671f9c73d1348708c15bafde",
      "671f9c80d1348708c15bafed",
      "671f9c9dd1348708c15bb000",
      "671f9cbcd1348708c15bb00f",
      "672490f6d2ccc141bc53263d",
      "67249137d2ccc141bc532659",
    ],
  },
];

//Imace 1
let code = {
  id: "aksdjlaks", //Generisan od baze
  naziv: "RO02BE",
  idUser: "dvg9syfd8stfd",
};
