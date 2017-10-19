function convertDate(date) {
  var month, day, year;

  month = date.substr(0, 2);
  day = date.substr(3, 2);
  year = date.substr(8, 2);

  switch (month) {
    case '01':
      month = 'JAN';
      break;
    case '02':
      month = 'FEB';
      break;
    case '03':
      month = 'MAR';
      break;
    case '04':
      month = 'APR';
      break;
    case '05':
      month = 'MAY';
      break;
    case '06':
      month = 'JUN';
      break;
    case '07':
      month = 'JUL';
      break;
    case '08':
      month = 'AUG';
      break;
    case '09':
      month = 'SEP';
      break;
    case '10':
      month = 'OCT';
      break;
    case '11':
      month = 'NOV';
      break;
    case '12':
      month = 'DEC';
      break;
  }

  if (dateRef.day === undefined) {
    dateRef = {
      day: `${day}`,
      month: `${month}`,
      year: `${year}`
    };
  }

  return `${day}-${month}-${year}`;
}

module.exports = convertDate;