window.onload = async function () {
  const combo = document.querySelector('#combo');

  const today = document.querySelector('#today');
  let todayday = new Date();
  let dd = todayday.getDate();
  let mm = todayday.getMonth() + 1;
  let yyyy = todayday.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  todayday = yyyy + '-' + mm + '-' + dd;
  today.setAttribute('max', todayday);

  today.addEventListener('change', handleDate);

  const countries = await getCountries();

  const summary = await getSummary();
  document.querySelector('#actives').innerHTML = 'Atualização';
  document.querySelector('#confirmed').innerHTML = format(
    summary.Global.TotalConfirmed
  );
  document.querySelector('#death').innerHTML = format(
    summary.Global.TotalDeaths
  );
  document.querySelector('#recovered').innerHTML = format(
    summary.Global.TotalRecovered
  );
  const globalDate = new Date(summary.Global.Date);
  console.log(globalDate);
  document.querySelector('#active').innerHTML = `${String(
    globalDate.getDate()
  ).padStart(2, '0')}.${String(globalDate.getMonth() + 1).padStart(
    2,
    '0'
  )}.${globalDate.getFullYear()}  ${globalDate.getHours()}:${globalDate.getMinutes()}:${globalDate.getSeconds()}`;

  for (const country of countries) {
    const option = document.createElement('option');
    const textnode = document.createTextNode(country);
    option.appendChild(textnode);
    combo.appendChild(option);
  }

  combo.addEventListener('change', (e) => {
    countrySelected = e.target.value;
  });
};
var countrySelected = document.querySelector('#combo').value;
const getCountries = async () => {
  const res = await fetch('https://api.covid19api.com/countries');
  let countries = await res.json();
  countries = countries.map((country) => country.Country).sort();
  return countries;
};

const getSummary = async () => {
  const res = await fetch('https://api.covid19api.com/summary');
  let summary = await res.json();
  return summary;
};

const getCountryByNameAndDate = async (name, date) => {
  const res = await fetch(`https://api.covid19api.com/total/country/${name}`);
  let country = await res.json();

  const index = country.findIndex((data) => compareDates(data.Date, date));

  return country.slice(index - 2, index + 1);
};
const compareDates = (a, b) => new Date(a) - new Date(b) === 0;

const format = (number) =>
  new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(number);

const handleDate = async (e) => {
  let dateParts = e.target.value.split('-');
  dateParts = dateParts.map((date) => +date);
  console.log(dateParts);
  var d = new Date(dateParts);
  d.setUTCHours(0, 0, 0, 0);
  // prettier-ignore
  const countryData = await getCountryByNameAndDate(countrySelected, d.toISOString());
  document.querySelector('#confirmed').innerHTML = format(
    countryData[2].Confirmed
  );
  document.querySelector('#tconfirmed').innerHTML = `
      ${
        countryData[2].Confirmed - countryData[1].Confirmed >
        countryData[1].Confirmed - countryData[0].Confirmed
          ? '<i class="fas fa-arrow-up"></i>'
          : '<i class="fas fa-arrow-down"></i>'
      } Diário ${format(countryData[2].Confirmed - countryData[1].Confirmed)}`;
  document.querySelector('#death').innerHTML = format(countryData[2].Deaths);
  document.querySelector('#tdeath').innerHTML = `
      ${
        countryData[2].Deaths - countryData[1].Deaths >
        countryData[1].Deaths - countryData[0].Deaths
          ? '<i class="fas fa-arrow-up"></i>'
          : '<i class="fas fa-arrow-down"></i>'
      } Diário ${format(countryData[2].Deaths - countryData[1].Deaths)}`;
  document.querySelector('#recovered').innerHTML = format(
    countryData[2].Recovered
  );
  document.querySelector('#trecovered').innerHTML = `
      ${
        countryData[2].Recovered - countryData[1].Recovered >
        countryData[1].Recovered - countryData[0].Recovered
          ? '<i class="fas fa-arrow-up"></i>'
          : '<i class="fas fa-arrow-down"></i>'
      } Diário ${format(countryData[2].Recovered - countryData[1].Recovered)}`;

  document.querySelector('#active').innerHTML = format(countryData[2].Active);
  document.querySelector('#tactive').innerHTML = `
      ${
        countryData[2].Active - countryData[1].Active >
        countryData[1].Active - countryData[0].Active
          ? '<i class="fas fa-arrow-up"></i>'
          : '<i class="fas fa-arrow-down"></i>'
      } Diário ${format(countryData[2].Active - countryData[1].Active)}`;
};
