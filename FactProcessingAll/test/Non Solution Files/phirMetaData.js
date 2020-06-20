const supplier1 = [
  ['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-17', '14', 'AN', 'M', 'Record identifier (=IDENTREGISTER1)', '6.2'],
  ['18-28', '11', 'N', 'M', 'Supplier Australian business number ', '6.3'],
  ['29-29', '1', 'A', 'M', 'Run type (=T or P)', '6.4'],
  ['30-37', '8', 'D', 'M', 'Financial year end date (DDMMCCYY)', '6.5'],
  ['38-38', '1', 'A', 'M', 'Data type (=M)', '6.6'],
  ['39-39', '1', 'A', 'M', 'Type of report (=I)', '6.7'],
  ['40-40', '1', 'A', 'M', 'Format of return media (=M)', '6.8'],
  ['41-50', '10', 'AN', 'M', 'ATO Report specification version number (=FMEDV003.0)', '6.9'],
  ['51-750', '700', 'A', 'S', 'Filler', '6.10']
]


const supplier2 = [
  ['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-17', '14', 'AN', 'M', 'Record identifier (=IDENTREGISTER2)', '6.11'],
  ['18-93', '76', 'AN', 'M', 'Supplier name', '6.12'],
  ['94-102', '9', 'N', 'M', 'Supplier number (=000000000)', '6.13'],
  ['103-140', '38', 'AN', 'M', 'Supplier contact name', '6.14'],
  ['141-155', '15', 'AN', 'M', 'Supplier contact phone number', '6.15'],
  ['156-170', '15', 'AN', 'O', 'Supplier facsimile number', '6.16'],
  ['171-750', '580', 'A', 'S', 'Filler', '6.10']
]

const supplier3 =
  [['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-17', '14', 'AN', 'M', 'Record identifier (=IDENTREGISTER3)', '6.17'],
  ['18-55', '38', 'AN', 'M', 'Supplier street address line 1', '6.18'],
  ['56-93', '38', 'AN', 'O', 'Supplier street address line 2', '6.18'],
  ['94-120', '27', 'AN', 'M', 'Supplier street address suburb, town or locality', '6.19'],
  ['121-123', '3', 'A', 'M', 'Supplier street address state or territory', '6.20'],
  ['124-127', '4', 'N', 'M', 'Supplier street address postcode', '6.21'],
  ['128-147', '20', 'AN', 'O', 'Supplier street address country', '6.22'],
  ['148-185', '38', 'AN', 'O', 'Supplier postal address line 1', '6.23'],
  ['186-223', '38', 'AN', 'O', 'Supplier postal address line 2', '6.23'],
  ['224-250', '27', 'AN', 'O', 'Supplier postal address suburb, town or locality', '6.24'],
  ['251-253', '3', 'A', 'O', 'Supplier postal address state or territory', '6.25'],
  ['254-257', '4', 'N', 'O', 'Supplier postal address postcode', '6.26'],
  ['258-277', '20', 'AN', 'O', 'Supplier postal address country', '6.27'],
  ['278-353', '76', 'AN', 'O', 'Supplier email address', '6.28'],
  ['354-750', '397', 'A', 'S', 'Filler', '6.10']
  ]

const reporter =
  [['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-11', '8', 'AN', 'M', 'Record identifier (=RPENTITY) ', '6.29'],
  ['12-19', '8', 'A', 'M', 'Reporting entity (=PHI FUND)', '6.30'],
  ['20-22', '3', 'AN', 'M', 'Fund identity code', '6.31'],
  ['23-26', '4', 'N', 'M', 'Financial year (CCYY)', '6.32'],
  ['27-40', '14', 'DT', 'M', 'Date timestamp report created (=DDMMCCYYHHMMSS)', '6.33'],
  ['41-41', '1', 'A', 'M', 'Type of data indicator (=O, A or R )', '6.34'],
  ['42-121', '80', 'AN', 'M', 'Software product type', '6.35'],
  ['122-132', '11', 'N', 'M', 'Reporting entity Australian business number', '6.36'],
  ['133-208', '76', 'AN', 'M', 'Reporting entity name', '6.37'],
  ['209-284', '76', 'AN', 'O', 'Reporting entity trading name', '6.38'],
  ['285-322', '38', 'AN', 'M', 'Reporting entity contact name', '6.39'],
  ['323-337', '15', 'AN', 'M', 'Reporting entity contact phone number', '6.40'],
  ['338-352', '15', 'AN', 'O', 'Reporting entity facsimile number', '6.41'],
  ['353-428', '76', 'AN', 'O', 'Reporting entity email address', '6.42'],
  ['429-466', '38', 'AN', 'M', 'Reporting entity street address line 1', '6.43'],
  ['467-504', '38', 'AN', 'O', 'Reporting entity street address line 2', '6.43'],
  ['505-531', '27', 'AN', 'M', 'Reporting entity street address suburb, town or locality', '6.44'],
  ['532-534', '3', 'A', 'M', 'Reporting entity street address state or territory', '6.45'],
  ['535-538', '4', 'N', 'M', 'Reporting entity street address postcode', '6.46'],
  ['539-558', '20', 'AN', 'O', 'Reporting entity street address country', '6.47'],
  ['559-596', '38', 'AN', 'O', 'Reporting entity postal address line 1', '6.48'],
  ['597-634', '38', 'AN', 'O', 'Reporting entity postal address line 2', '6.48'],
  ['635-661', '27', 'AN', 'C', 'Reporting entity postal address suburb, town or locality', '6.49'],
  ['662-664', '3', 'A', 'C', 'Reporting entity postal address state or territory', '6.50'],
  ['665-668', '4', 'N', 'C', 'Reporting entity postal address postcode', '6.51'],
  ['669-688', '20', 'AN', 'C', 'Reporting entity postal address country', '6.52'],
  ['689-750', '62', 'A', 'S', 'Filler', '6.10']
  ]

const member =
  [['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-11', '8', 'AN', 'M', 'Record identifier (=MBRNTITY)', '6.53'],
  ['12-14', '3', 'AN', 'M', 'Fund identity code', '6.31'],
  ['15-29', '15', 'AN', 'M', 'Policy membership number', '6.54'],
  ['30-44', '15', 'AN', 'M', 'Unique personal identifier', '6.55'],
  ['45-74', '30', 'AN', 'M', 'Individual surname or family name', '6.56'],
  ['75-89', '15', 'AN', 'O', 'Individual first given name', '6.57'],
  ['90-104', '15', 'AN', 'O', 'Individual second given name', '6.58'],
  ['105-134', '30', 'AN', 'O', 'Previous individual surname or family name', '6.59'],
  ['135-142', '8', 'D', 'M', 'Individual date of birth (DDMMCCYY)', '6.60'],
  ['143-180', '38', 'AN', 'M', 'Individual address line 1', '6.61'],
  ['181-218', '38', 'AN', 'O', 'Individual address line 2', '6.61'],
  ['219-245', '27', 'AN', 'M', 'Individual address suburb, town or locality', '6.62'],
  ['246-248', '3', 'A', 'M', 'Individual address state or territory', '6.63'],
  ['249-252', '4', 'N', 'M', 'Individual address postcode', '6.64'],
  ['253-272', '20', 'AN', 'O', 'Individual address country', '6.65'],
  ['273-310', '38', 'AN', 'O', 'Previous individual address line 1', '6.66'],
  ['311-348', '38', 'AN', 'O', 'Previous individual address line 2', '6.66'],
  ['349-375', '27', 'AN', 'C', 'Previous individual address suburb, town or locality', '6.67'],
  ['376-378', '3', 'A', 'C', 'Previous individual address state or territory', '6.68'],
  ['379-382', '4', 'N', 'C', 'Previous individual address postcode', '6.69'],
  ['383-402', '20', 'AN', 'C', 'Previous individual address country', '6.70'],
  ['403-478', '76', 'AN', 'O', 'Individual email address', '6.71'],
  ['479-493', '15', 'AN', 'O', 'Individual mobile phone number', '6.72'],
  ['494-508', '15', 'AN', 'O', 'Individual contact phone number', '6.73'],
  ['509-750', '242', 'A', 'S', 'Filler', '6.10']
  ]

const indivStatement =
  [['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-11', '8', 'AN', 'M', 'Record identifier (=INDIVSTM)', '6.74'],
  ['12-26', '15', 'AN', 'M', 'Policy membership number', '6.54'],
  ['27-41', '15', 'AN', 'M', 'Unique personal identifier', '6.55'],
  ['42-42', '1', 'A', 'M', 'Policy role (=A, D or N)', '6.75'],
  ['43-57', '15', 'AN', 'O', 'Unique personal identifier of other PHIIB 1', '6.76'],
  ['58-72', '15', 'AN', 'O', 'Unique personal identifier of other PHIIB 2', '6.77'],
  ['73-87', '15', 'AN', 'O', 'Unique personal identifier of other PHIIB 3', '6.78'],
  ['88-102', '15', 'AN', 'O', 'Unique personal identifier of other PHIIB 4', '6.79'],
  ['103-104', '2', 'N', 'C', 'Number of other additional PHIIBs', '6.80'],
  ['105-112', '8', 'N', 'M', 'Your premiums paid in the financial year(whole dollars)', '6.81'],
  ['113-120', '8', 'N', 'M', 'Your Australian Government rebate received (whole dollars)', '6.82'],
  ['121-128', '8', 'N', 'M', 'Your premiums eligible for Australian Government rebate (whole dollars)', '6.83'],
  ['129-130', '2', 'N', 'M', 'Benefit code', '6.84'],
  ['131-750', '620', 'A', 'S', 'Filler', '6.10']
  ]

const indivMLS =
  [['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-11', '8', 'AN', 'M', 'Record identifier (=INDIVMLS)', '6.85'],
  ['12-26', '15', 'AN', 'M', 'Policy membership number', '6.54'],
  ['27-41', '15', 'AN', 'M', 'Unique personal identifier', '6.55'],
  ['42-49', '8', 'D', 'M', 'Individual MLS record start date (DDMMCCYY)', '6.86'],
  ['50-57', '8', 'D', 'M', 'Individual MLS record end date (DDMMCCYY)', '6.87'],
  ['58-58', '1', 'A', 'M', 'Type of policy (=S, C, F or P)', '6.88'],
  ['59-59', '1', 'A', 'M', 'Policy role (=A or D)', '6.75'],
  ['60-750', '691', 'A', 'S', 'Filler', '6.10']
  ]

const fileTotal =
  [['1-3', '3', 'N', 'M', 'Record length (=750)', '6.1'],
  ['4-13', '10', 'AN', 'M', 'Record identifier (=FILE-TOTAL)', '6.89'],
  ['14-22', '9', 'N', 'M', 'Count of Individual identity data records', '6.90'],
  ['23-31', '9', 'N', 'M', 'Count of Individual statement data records', '6.91'],
  ['32-40', '9', 'N', 'M', 'Count of Individual MLS data records', '6.92'],
  ['41-49', '9', 'N', 'M', 'Count of total records', '6.93'],
  ['50-750', '701', 'A', 'S', 'Filler', '6.10']
  ]


const recordIdentifiers = [
  { start: 4, end: 17, rt: 'IDENTREGISTER1', def: supplier1 },
  { start: 4, end: 17, rt: 'IDENTREGISTER2', def: supplier2 },
  { start: 4, end: 17, rt: 'IDENTREGISTER3', def: supplier3 },
  { start: 4, end: 11, rt: 'RPENTITY', def: reporter },
  { start: 4, end: 11, rt: 'MBRNTITY', def: member },
  { start: 4, end: 11, rt: 'INDIVSTM', def: indivStatement },
  { start: 4, end: 11, rt: 'INDIVMLS', def: indivMLS },
  { start: 4, end: 13, rt: 'FILE-TOTAL', def: fileTotal }]


const fieldNames =
{
  '6.56': { field: 'Surname', container: ['member', 'name'] },
  '6.57': { field: 'Givenname', container: ['member', 'name'] },
  '6.58': { field: 'Othergivennames', container: ['member', 'name'] },
  '6.59': { field: 'Previoussurname', container: ['member', 'name'] },
  '6.60': { field: 'Dateofbirth', container: ['member'] },
  '6.61': { field: 'Residentialaddressline1', container: ['member', 'residential', 'address'] },
  '6.62': { field: 'Residentialsuburb/town', container: ['member', 'residential', 'address'] },
  '6.63': { field: 'Residentialstate/territory', container: ['member', 'residential', 'address'] },
  '6.64': { field: 'Residentialpostcode', container: ['member', 'residential', 'address'] },
  '6.65': { field: 'Residentialcountry', container: ['member', 'residential', 'address'] },
  '6.66': { field: 'Previousaddressline1', container: ['member', 'previous', 'address'] },
  '6.67': { field: 'Previoussuburb/town', container: ['member', 'previous', 'address'] },
  '6.68': { field: 'Previousstate/territory', container: ['member', 'previous', 'address'] },
  '6.69': { field: 'Previouspostcode', container: ['member', 'previous', 'address'] },
  '6.70': { field: 'Previouscountry', container: ['member', 'previous', 'address'] },
  '6.31': { field: 'Fundidentitycode', container: ['policy'] },
  '6.54': { field: 'Policymembershipnumber', container: ['policy'] },
  '6.55': { field: 'Uniquepersonalidentifier', container: ['policy'] },
  '6.86': { field: 'IndividualMLSrecordstartdate', container: ['mls'] },
  '6.87': { field: 'IndividualMLSrecordenddate', container: ['mls'] },
  '6.88': { field: 'Typeofpolicy', container: ['policy'] },
  '6.75': { field: 'MLSPolicyrole', container: ['policy'] },
  '6.75': { field: 'Statementpolicyrole', container: ['statement'] },
  '6.76': { field: 'UniquepersonalidentifierofotherPHIIB1', container: ['statement'] },
  '6.77': { field: 'UniquepersonalidentifierofotherPHIIB2', container: ['statement'] },
  '6.78': { field: 'UniquepersonalidentifierofotherPHIIB3', container: ['statement'] },
  '6.79': { field: 'UniquepersonalidentifierofotherPHIIB4', container: ['statement'] },
  '6.80': { field: 'NumberofotheradditionalPHIIBs', container: ['statement'] },
  '6.81': { field: 'Rebatablecomponent', container: ['statement'] },
  '6.82': { field: 'AustralianGovernmentrebatereceived', container: ['statement'] },
  '6.82': { field: 'Shareoftotalcostofpolicy', container: ['statement'] },
  '6.84': { field: 'Benefitcode', container: ['statement'] },
  '6.1':  { field: 'RecordLength', container: [] },
  '6.29': { field: 'RecordIdentifier', container: [] },
  '6.53': { field: 'RecordIdentifier', container: [] },
  '6.71': { field: 'Email', container: ['member', 'contact'] },
  '6.72': { field: 'MobilePhone', container: ['member', 'contact'] },
  '6.73': { field: 'IndividualContactPhoneNumber', container: ['member', 'contact'] },
  '6.74': { field: 'RecordIdentifier', container: ['member', 'contact'] },
  '6.85': { field: 'RecordIdentifer', container: [] },
  '6.28': { field: 'Suppliercontactemailaddress', container: ['supplier', 'contact'] },
  '6.18': { field: 'Supplieraddressline1', container: ['supplier', 'address'] },
  '6.19': { field: 'Suppliersuburb/town', container: ['supplier', 'address'] },
  '6.20': { field: 'Supplierstate/territory', container: ['supplier', 'address'] },
  '6.21': { field: 'Supplierpostcode', container: ['supplier', 'address'] },
  '6.22': { field: 'Suppliercountry', container: ['supplier', 'address'] },
  '6.23': { field: 'Supplierpostaladdressline1', container: ['supplier', 'postal', 'address'] },
  '6.24': { field: 'Supplierpostalsuburb/town', container: ['supplier', 'postal', 'address'] },
  '6.25': { field: 'Supplierpostalstate/territory', container: ['supplier', 'postal', 'address'] },
  '6.26': { field: 'Supplierpostalpostcode', container: ['supplier', 'postal', 'address'] },
  '6.27': { field: 'Supplierpostalcountry', container: ['supplier', 'postal', 'address'] },
  '6.90': { field: 'Countofindividualidentityrecords', container: ['report'] },
  '6.91': { field: 'Countofindividualstatementrecords', container: ['report'] },
  '6.92': { field: 'CountofindividualMLSrecords', container: ['report'] },
  '6.93': { field: 'Countoftotalrecords', container: ['report'] },
  '6.9': { field: 'ATOreportspecificationversionnumber', container: ['report'] },
  '6.33': { field: 'Datetimestampreportcreated', container: ['report'] },
  '6.6': { field: 'Typeofdata', container: ['report'] },
  '6.35': { field: 'Softwareproducttype', container: ['report'] },
  '6.2': { field: 'RecordIdentifier', container: [] },
  '6.3': { field: 'SupplierABN', container: ['supplier'] },
  '6.4': { field: 'RunType', container: ['report'] },
  '6.5': { field: 'FinancialYearEndDate', container: ['report'] },
  '6.7': { field: 'TypeOfReport', container: ['report'] },
  '6.8': { field: 'FormatOfReturnMedia', container: ['report'] },
  '6.11': { field: 'RecordIdentifier', container: [] },
  '6.12': { field: 'SupplierName', container: ['supplier'] },
  '6.13': { field: 'SupplierNumber', container: ['supplier'] },
  '6.14': { field: 'SupplierContactName', container: ['supplier', 'contact'] },
  '6.15': { field: 'SupplierContactPhoneNumber', container: ['supplier', 'contact'] },
  '6.16': { field: 'SupplierFacsimileNumber', container: ['supplier', 'contact'] },
  '6.17': { field: 'RecordIdentifier', container: [] },
  '6.37': { field: 'TypeOfData', container: [] },
  '6.36': { field: 'ReporterABN', container: ['reporter'] },
  '6.37': { field: 'ReporterName', container: ['reporter'] },
  '6.38': { field: 'ReporterTradingName', container: ['reporter'] },
  '6.39': { field: 'ReporterContactName', container: ['reporter', 'contact'] },
  '6.40': { field: 'ReporterContactNumber', container: ['reporter', 'contact'] },
  '6.41': { field: 'ReporterFacsimileNumber', container: ['reporter', 'contact'] },
  '6.42': { field: 'ReporterEmailAddress', container: ['reporter', 'contact'] },
  '6.43': { field: 'ReporterAddressLine1', container: ['reporter', 'address'] },
  '6.44': { field: 'ReporterSuburb/Town', container: ['reporter', 'address'] },
  '6.45': { field: 'ReporterSate/Territory', container: ['reporter', 'address'] },
  '6.46': { field: 'ReporterPostCode', container: ['reporter', 'address'] },
  '6.47': { field: 'ReporterCountry', container: ['reporter', 'address'] },
  '6.48': { field: 'ReporterPostalPostalAddressLine1', container: ['reporter', 'postal', 'address'] },
  '6.49': { field: 'ReporterPostalSuburb/Town', container: ['reporter', 'postal', 'address'] },
  '6.50': { field: 'ReporterPostalSate/Territory', container: ['reporter', 'postal', 'address'] },
  '6.51': { field: 'ReporterPostalPostCode', container: ['reporter', 'postal', 'address'] },
  '6.52': { field: 'ReporterPostalCountry', container: ['reporter', 'postal', 'address'] },
  '6.89': { field: 'RecordIdentifier', container: [] }
}

const metaData = module.exports = recordIdentifiers;

metaData.supplier1=supplier1;
metaData.supplier2=supplier2;
metaData.supplier3=supplier3;
metaData.reporter=reporter;
metaData.member=member;
metaData.indivStatement;
metaData.indivMLS=indivMLS;
metaData.fileTotal=fileTotal;
metaData.recordIdentifiers=recordIdentifiers;

metaData.fieldNames=fieldNames;