import xlsx from 'xlsx';

function readExcel(filePath, sheetName) {
  // Load the Excel file
  const workbook = xlsx.readFile(filePath);
  // Get the specified sheet
  const sheet = workbook.Sheets[sheetName];
  // Convert the sheet to JSON
  const data = xlsx.utils.sheet_to_json(sheet);
  return data;
}

const excelData = readExcel('Whatsapp Numbers.xlsx', 'Sheet1');
console.log(excelData);

export default readExcel;
