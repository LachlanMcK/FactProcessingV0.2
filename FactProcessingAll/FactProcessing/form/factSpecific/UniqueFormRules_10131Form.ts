import * as myLog from '../../../myLog';
export const formMetaData = require("../../jsre/forms/oTH_PAYROLL_EVENT_CHILDForm.js");
const formDef = require("../../jsre/forms/oTH_PAYROLL_EVENT_CHILDMapping.js").oTH_PAYROLL_EVENT_CHILD;
export const FormType = '10131';
export const businessRulesLanguage = "JSRE";
export const wireFormat = "JSRE";

import { getFormDescription } from "./FormLineItemSchemaFromJSRE";
let formDescription = { schema: {}, byId: {}, byName: {} };

try { formDescription = require('./FormSubSchema_10131Form.json'); }
catch (error) {
    formDescription = getFormDescription(formDef, formMetaData);
    require('fs').writeFileSync('./FactProcessing/form/factSpecific/FormSubSchema_10131Form.json', JSON.stringify(formDescription));
}

export const lineItemsSchema_FormSpecific = formDescription.schema, formMetaDataById = formDescription.byId, formMetaDataByName = formDescription.byName;

myLog.debug("Additional " + FormType + " line items schema definition ");
myLog.log("Additional " + FormType + " line items schema definition ", JSON.stringify(lineItemsSchema_FormSpecific));

import { getFactSpecificStuff } from "./factSpecificPlugin";

export function addToFormSpecificIdentityCriteria(identityCriteria: any, req: any, res: any): object {
    identityCriteria["Payee Details.oTH_PAYEE_DTLS_StructuredGivenName"] = req.body[10932][16562]._value;
    identityCriteria["Payee Details.oTH_PAYEE_DTLS_StructuredFamilyName"] = req.body[10932][16561]._value;
    identityCriteria["Payee Details.oTH_PAYEE_DTLS_StructuredGeographicAddressPostcode"] = req.body[10932][16573]._value;
    identityCriteria["Payee Details.oTH_PAYEE_DTLS_IndividualBirthDate"] = req.body[10932][25445]._value;

    return identityCriteria;
}

export function confirmCanTakeIdentityFromPriorLodgment(FormTypeMung: string, req: any, foundForm: any, res: any): any {
    //check its OK for the new form to take its id from found form  
    //the following code is not actually needed as it is all in the find criteria
    let newForm = req.body;

    if (!newForm["10932"] || !foundForm["Payee Details"]) {
        newForm.subjectClient.MatchingStatus = "UnMatched";
        myLog.warn("(10131) confirmCanTakeIdentityFromPriorLodgment couldn't find section 10932 or Payee Details");
        return newForm;
    }

    try {
        if (newForm["10932"]["16562"]._value == foundForm["Payee Details"]["oTH_PAYEE_DTLS_StructuredGivenName"] &&
            newForm["10932"]["16561"]._value == foundForm["Payee Details"]["oTH_PAYEE_DTLS_StructuredFamilyName"] &&
            newForm["10932"]["16573"]._value == foundForm["Payee Details"]["oTH_PAYEE_DTLS_StructuredGeographicAddressPostcode"] &&
            newForm["10932"]["25445"]._value == foundForm["Payee Details"]["oTH_PAYEE_DTLS_IndividualBirthDate"].toISOString().substring(0, 10)) {

            newForm.subjectClient.ClientIdentifierType = foundForm.subjectClient.ClientIdentifierType;
            newForm.subjectClient.ClientIdentifierValue = foundForm.subjectClient.ClientIdentifierValue;
            newForm.subjectClient.MatchingStatus = foundForm.subjectClient.MatchingStatus;
            newForm.ClientInternalId = foundForm.ClientInternalId;
        } else
            newForm.subjectClient.MatchingStatus = "UnMatched";
    } catch (error) {
        myLog.error('Error Details: ' + error, newForm);
        //myLog.error(JSON.stringify(newForm));

        newForm.subjectClient.MatchingStatus = "UnMatched";
    }
    myLog.debug('(10131) confirmCanTakeIdentityFromPriorLodgment resulted in Matching Status : ' + newForm.subjectClient.MatchingStatus);

    return req;
}


export async function postPutPreReturnHook(formTypeMung: string, req: any, res: any) {
    myLog.debug("Will do form specific fiddling here");
    return;
}

export async function decideWhatToPutInPrefill(formTypeMung: string, meaningfulNameForm: any): Promise<{ prefillLookup: Object, prefillInsert: Object, prefillUpdate: Object }[]> {
    myLog.debug("Will do form specific repliation here");

    const Lookup = {
        'FormType': "prefillIITR",
        "subjectClient.ClientIdentifierType": meaningfulNameForm.subjectClient.ClientIdentifierType,
        "subjectClient.ClientIdentifierValue": meaningfulNameForm.subjectClient.ClientIdentifierValue,
        'facts': {
            $elemMatch: { //find a facts element with the following property values
                'Payee Details.oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier': meaningfulNameForm["Payee Details"].oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier,
                'Payer Details.oTH_PAYER_DTLS_ClientExternalIdentifierTypeCode': meaningfulNameForm["Payer Details"].oTH_PAYER_DTLS_ClientExternalIdentifierTypeCode,
                'Payer Details.oTH_PAYER_DTLS_ClientExternalID': meaningfulNameForm["Payer Details"].oTH_PAYER_DTLS_ClientExternalID,
                'Payer Details.oTH_PAYER_DTLS_BusinessMangamentSoftwareIdentifier': meaningfulNameForm["Payer Details"].oTH_PAYER_DTLS_BusinessMangamentSoftwareIdentifier,
                'Payer Details.oTH_PAYER_DTLS_EmployerBranchCode': meaningfulNameForm["Payer Details"].oTH_PAYER_DTLS_EmployerBranchCode,
                'Payroll Event.oTH_PAYROLL_EVNT_FinancialYear': meaningfulNameForm["Payroll Event"].oTH_PAYROLL_EVNT_FinancialYear,
                'Payroll Event.oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate': { "$lte": meaningfulNameForm["Payroll Event"].oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate }
            }
        }
    };

    const Insert = {
        "FormType": "prefillIITR",
        "subjectClient.ClientIdentifierType": meaningfulNameForm.subjectClient.ClientIdentifierType,
        "subjectClient.ClientIdentifierValue": meaningfulNameForm.subjectClient.ClientIdentifierValue,
        "$setOnInsert": {
            TransactionId: Date.now(),
            createdAt: new Date(),
            updatedAt: new Date(),
            DT_Update: new Date().toLocaleDateString(),
            TM_Update: new Date().toLocaleTimeString()
        },
        "$push": { "facts": meaningfulNameForm }
    };

    const Update = {
        "FormType": "prefillIITR",
        "subjectClient.ClientIdentifierType": meaningfulNameForm.subjectClient.ClientIdentifierType,
        "subjectClient.ClientIdentifierValue": meaningfulNameForm.subjectClient.ClientIdentifierValue,
        "$set": {
            "facts.$": meaningfulNameForm,
            updatedAt: new Date(),
            DT_Update: new Date().toLocaleDateString(),
            TM_Update: new Date().toLocaleTimeString()
        }
    };

    return [{ prefillLookup: Lookup, prefillInsert: Insert, prefillUpdate: Update }];
}

import { lineItemsSchema_FormSpecific as bulkSchema } from './UniqueFormRules_bulkTransmissionForm'; //directly coupling to bulkTransmissionForm
export async function bulkTransmissionTracking(formTypeMung: string, req: any, res: any, meaningfulNameForm: any): Promise<{ lookupFilter: any, upsertBody: any, schema: any } | null> {
    if (!meaningfulNameForm.TransmissionDetails || !meaningfulNameForm.TransmissionDetails.TransmissionBET) return null;

    const Lookup = {
        TransactionId: meaningfulNameForm.TransmissionDetails.TransmissionBET,
        FormType: "bulkTransmission"
    };

    if (!meaningfulNameForm.TransmissionDetails.ClientIdentifierType) meaningfulNameForm.TransmissionDetails.ClientIdentifierType = "ABN";
    if (!meaningfulNameForm.TransmissionDetails.ClientIdentifierValue) myLog.warn("TransmissionDetails.ClientIdentifierValue should be present when TransmissionBET is used");
    if (!meaningfulNameForm.TransmissionDetails.ClientIdentifierValue) meaningfulNameForm.TransmissionDetails.ClientIdentifierValue = -1;
        
    const upsertBody = {
        $setOnInsert: {
            TransactionId: meaningfulNameForm.TransmissionDetails.TransmissionBET,
            "subjectClient.ClientIdentifierType": meaningfulNameForm.TransmissionDetails.ClientIdentifierType,
            "subjectClient.ClientIdentifierValue": meaningfulNameForm.TransmissionDetails.ClientIdentifierValue,
            //gee, looks like I've developed a bit of a stutter here!!  The reason I'm doing it is so the info on the control record looks like the info in the separate facts
            "TransmissionDetails.TransmissionBET": meaningfulNameForm.TransmissionDetails.TransmissionBET,
            "TransmissionDetails.ClientIdentifierType": meaningfulNameForm.TransmissionDetails.ClientIdentifierType,
            "TransmissionDetails.ClientIdentifierValue": meaningfulNameForm.TransmissionDetails.ClientIdentifierValue,
            createdAt: new Date()
        },
        $set: {
            updatedAt: new Date(),
            DT_Update: new Date().toLocaleDateString(),
            TM_Update: new Date().toLocaleTimeString()
        },
        $inc: {
            "TransmissionDetails.RecordCount": 1
        }
    };

    return { lookupFilter: Lookup, upsertBody: upsertBody, schema: bulkSchema };
}

//I've only done a 1/2 assed job of doing this mapping.  Good enough to check the code works.  
//Todo: Need to to make this mapping correct.
export function transformFromSBR(f: any) {
    if (!f.PAYEVNTEMP) return "Failed to transform: Not a payroll event";

    try {
        let sbrForm = f.PAYEVNTEMP;
        let newForm: any = {};
        newForm[10931] = {};
        newForm.Transmission = {};
        newForm.DT_Update = sbrForm.Transmission[0].TransmissionD[0];
        newForm.TM_Update = sbrForm.Transmission[0].TransmissionT[0];
        newForm.updatedAt = new Date(newForm.DT_Update + ":" + newForm.TM_Update);

        newForm.Transmission.BetNumber = sbrForm.Transmission[0].BusinessEventTrackingN[0];
        newForm.Transmission.RecordNumber = sbrForm.Transmission[0].TransmissionRecordN[0];
        newForm.Transmission.BMSId = sbrForm.Transmission[0].SoftwareInformation[0].BusinessManagementSystemId[0];

        newForm.Payer = {};
        newForm.Payer.ClientExternalIdentiferType = sbrForm.Payer[0].ClientExternalIdentiferType[0];
        newForm.Payer.ClientExternalIdentiferValue = sbrForm.Payer[0].ClientExternalIdentiferValue[0];
        newForm.Payer.ClientInternalIdentifier = sbrForm.Payer[0].ClientInternalIdentifier[0];

        newForm.Payer.OrganisationalDetails = {};
        newForm.Payer.OrganisationalDetails.OrganisationNameT = sbrForm.Payer[0].OrganisationalDetails[0].OrganisationNameT[0];
        newForm.Payer.OrganisationalDetails.OrganisatioalBranchC = sbrForm.Payer[0].OrganisationalDetails[0].OrganisatioalBranchC[0];

        newForm[10931][16556] = sbrForm.Payer[0].ClientExternalIdentiferValue[0]//"oTH_PAYER_DTLS_ClientExternalID"
        newForm[10931][14930] = sbrForm.Payer[0].ClientExternalIdentiferType[0] //oTH_PAYER_DTLS_ClientExternalIdentifierTypeCode";
        newForm[10931][16557] = sbrForm.Payer[0].OrganisationalDetails[0].OrganisationNameT[0]; //oTH_PAYER_DTLS_UnstructuredFullName";
        newForm[10931][23930] = "" //oTH_PAYER_DTLS_DerivedClientIdentifierAustralianBusinessNumber";
        newForm[10931][23951] = "" //oTH_PAYER_DTLS_DerivedUnstructuredFullName";
        newForm[10931][15431] = sbrForm.Transmission[0].SoftwareInformation[0].BusinessManagementSystemId[0] //oTH_PAYER_DTLS_BusinessMangamentSoftwareIdentifier";
        newForm[10931][18449] = sbrForm.Payer[0].OrganisationalDetails[0].OrganisatioalBranchC[0] //oTH_PAYER_DTLS_EmployerBranchCode";
        newForm[10931][20472] = "" //oTH_PAYER_DTLS_DerivedClientBranchNumber";

        newForm[10932] = {}
        newForm[10932][16558] = sbrForm.Payee[0].Identifiers[0].EmploymentPayrollNumberId[0]; //oTH_PAYEE_DTLS_CurrentPayerPayeeRelationshipPayeePayrollIdentifier";
        newForm[10932][25443] = sbrForm.Payee[0].EmployerConditions[0].EmploymentStartD[0]; //oTH_PAYEE_DTLS_PayerPayeeRelationshipCommencementDate";
        newForm[10932][25242] = sbrForm.Payee[0].EmployerConditions[0].EmploymentEndD[0]; //oTH_PAYEE_DTLS_PayerPayeeRelationshipCessationDate";
        newForm[10932][16560] = sbrForm.Payee[0].Identifiers[0].TaxFileNumberId[0]; //oTH_PAYEE_DTLS_ClientIdentifierTaxFileNumber";
        newForm[10932][25444] = sbrForm.Payee[0].Identifiers[0].AustralianBusinessNumberId[0]; //oTH_PAYEE_DTLS_ContractorClientIdentifierAustralianBusinessNumber";
        newForm[10932][16561] = sbrForm.Payee[0].PersonNameDetails[0].FamilyNameT[0]; //oTH_PAYEE_DTLS_StructuredFamilyName";
        newForm[10932][16562] = sbrForm.Payee[0].PersonNameDetails[0].GivenNameT[0]; //oTH_PAYEE_DTLS_StructuredGivenName";
        newForm[10932][16565] = sbrForm.Payee[0].PersonNameDetails[0].OtherGivenNameT[0]; //oTH_PAYEE_DTLS_StructuredOtherGivenName";
        newForm[10932][25445] = sbrForm.Payee[0].PersonDemographicDetailsBirth[0].Y[0] + "-" +
            ("0" + sbrForm.Payee[0].PersonDemographicDetailsBirth[0].M[0]).substr(-2, 2) + "-" +
            ("0" + sbrForm.Payee[0].PersonDemographicDetailsBirth[0].Dm[0]).substr(-2, 2) //oTH_PAYEE_DTLS_IndividualBirthDate";
        newForm[10932][16567] = sbrForm.Payee[0].AddressDetails[0].Line1T[0]; //oTH_PAYEE_DTLS_UnstructuredGeographicAddressLine1";
        newForm[10932][16568] = sbrForm.Payee[0].AddressDetails[0].Line2T[0]; //oTH_PAYEE_DTLS_UnstructuredGeographicAddressLine2";
        newForm[10932][16571] = sbrForm.Payee[0].AddressDetails[0].LocalityNameT[0]; //oTH_PAYEE_DTLS_StructuredGeographicAddressLocalityName";
        newForm[10932][16572] = sbrForm.Payee[0].AddressDetails[0].StateOrTerritoryC[0]; //oTH_PAYEE_DTLS_StructuredGeographicAddressStateCode";
        newForm[10932][16573] = sbrForm.Payee[0].AddressDetails[0].PostcodeT[0]; //oTH_PAYEE_DTLS_StructuredGeographicAddressPostcode";
        newForm[10932][16574] = sbrForm.Payee[0].AddressDetails[0].CountryC[0]; //oTH_PAYEE_DTLS_CountryCode";
        newForm[10932][25446] = sbrForm.Payee[0].ElectronicContact[0].ElectronicMailAddressT[0]; //oTH_PAYEE_DTLS_PayeeInternetEmailAddress";
        newForm[10932][25447] = sbrForm.Payee[0].ElectronicContact[0].TelephoneMinimalN[0]; //oTH_PAYEE_DTLS_PayeeTelephoneNumber";

        newForm[10933] = {};
        newForm[10933][16580] = sbrForm.Payee[0].PayrollPeriod[0].StartD[0]; //oTH_PAYROLL_EVNT_PayrollEventPeriodStartDate";
        newForm[10933][16582] = sbrForm.Payee[0].PayrollPeriod[0].EndD[0]; //oTH_PAYROLL_EVNT_PayrollEventPeriodEndDate";
        newForm[10933][18450] = "" //oTH_PAYROLL_EVNT_FinancialYear";
        newForm[10933][16585] = new Date().toISOString().split('T')[0] //oTH_PAYROLL_EVNT_LodgmentDate";
        newForm[10933][16710] = "" //oTH_PAYROLL_EVNT_PaymentDate";
        newForm[10933][25451] = "" //oTH_PAYROLL_EVNT_PayrollMessageTimestampSourceDatetime";
        newForm[10933][25452] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationPayrollEventFinalI[0]; //oTH_PAYROLL_EVNT_PayrollEventFinalIndicator";

        newForm[10936] = {};
        newForm[10936][15470] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].IndividualNonBusinessExemptForeignEmploymentIncomeA[0] //oTH_WAGE_AND_TAX_ITEM_PayeeForeignIncomeExemptAmount";
        newForm[10936][15488] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].IndividualNonBusinessCommunityDevelopmentEmploymentProjectA[0]; //oTH_WAGE_AND_TAX_ITEM_PayeeIncomeCommunityDevelopmentEmploymentProjectAmount";

        let count = 0;
        sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection.map((r: any) => {
            if (count == 0) {
                newForm[10936][15453] = []
                newForm[10936][25453] = []
                newForm[10936][25454] = []
                newForm[10936][15489] = []
                newForm[10936][15496] = []
            }
            newForm[10936][15453][count] = r.Remuneration[0].EmploymentTerminationPaymentCollection[0].EmploymentTerminationPayment[0].IncomeTaxPayAsYouGoWithholdingTypeC[0]; //oTH_WAGE_AND_TAX_ITEM_SectionGroup5", "oTH_WAGE_AND_TAX_ITEM_EmploymentTerminationPaymentTypeCode";
            newForm[10936][25453][count] = r.Remuneration[0].EmploymentTerminationPaymentCollection[0].EmploymentTerminationPayment[0].IncomeD[0]; //oTH_WAGE_AND_TAX_ITEM_SectionGroup5", "oTH_WAGE_AND_TAX_ITEM_EmploymentTerminationPaymentPaymentDate";
            newForm[10936][25454][count] = r.Remuneration[0].EmploymentTerminationPaymentCollection[0].EmploymentTerminationPayment[0].IncomePayAsYouGoWithholdingA[0]; //oTH_WAGE_AND_TAX_ITEM_SectionGroup5", "oTH_WAGE_AND_TAX_ITEM_EmploymentTerminationPaymentTaxWithheldTotalAmount";
            newForm[10936][15489][count] = r.Remuneration[0].EmploymentTerminationPaymentCollection[0].EmploymentTerminationPayment[0].IncomeTaxFreeA[0]; //oTH_WAGE_AND_TAX_ITEM_SectionGroup5", "oTH_WAGE_AND_TAX_ITEM_EmploymentTerminationPaymentTaxFreeAmount";
            newForm[10936][15496][count] = r.Remuneration[0].EmploymentTerminationPaymentCollection[0].EmploymentTerminationPayment[0].IncomeTaxableA[0]; //oTH_WAGE_AND_TAX_ITEM_SectionGroup5", "oTH_WAGE_AND_TAX_ITEM_EmploymentTerminationPaymentTaxableComponentAmount";
            count++
        })

        newForm[10936][16787] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].LumpSumCollection[0].LumpSum[0].TypeC[0]; //oTH_WAGE_AND_TAX_ITEM_PayeeAnnualLongServiceLeaveUnusedLumpSumACode";
        newForm[10936][15499] = ['R', 'W', 'T'].includes(sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].LumpSumCollection[0].LumpSum[0].TypeC[0]) ? sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].LumpSumCollection[0].LumpSum[0].PaymentsA[0] : 0 //oTH_WAGE_AND_TAX_ITEM_PayeeAnnualLongServiceLeaveUnusedLumpSumAAmount";
        newForm[10936][15501] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].LumpSumCollection[0].LumpSum[0].TypeC[0] == 'B' ? sbrForm.Payee[0].PayrollPeriod[0].LumpSumCollection[0].LumpSum[0].PaympaidentsA[0] : 0 //oTH_WAGE_AND_TAX_ITEM_PayeeAnnualLongServiceLeaveUnusedLumpSumBAmount";
        newForm[10936][15508] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].LumpSumCollection[0].LumpSum[0].TypeC[0] == 'D' ? sbrForm.Payee[0].PayrollPeriod[0].LumpSumCollection[0].LumpSum[0].PaymentsA[0] : 0 //oTH_WAGE_AND_TAX_ITEM_PayeeAnnualLongServiceLeaveUnusedLumpSumDAmount";
        newForm[10936][15510] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].LumpSumCollection[0].LumpSum[0].TypeC[0] == 'E' ? sbrForm.Payee[0].PayrollPeriod[0].LumpSumCollection[0].LumpSum[0].PaymentsA[0] : 0 //oTH_WAGE_AND_TAX_ITEM_PayeeAnnualLongServiceLeaveUnusedLumpSumEAmount";
        newForm[10936][15454] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].GrossA[0] //oTH_WAGE_AND_TAX_ITEM_PayeeYearToDateIncomeGrossAmount";
        newForm[10936][25455] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].IndividualNonBusinessExemptForeignEmploymentIncomeA[0]; //oTH_WAGE_AND_TAX_ITEM_PayeeForeignIncomeEmploymentGrossAmount";
        newForm[10936][25456] = 0 //oTH_WAGE_AND_TAX_ITEM_PayeeForeignIncomeEmploymentJointPetroleumDevelopmentAreaGrossAmount";
        newForm[10936][15456] = 0//oTH_WAGE_AND_TAX_ITEM_PayeeIncomeLabourHireArrangementGrossAmount";
        newForm[10936][15518] = 0 //oTH_WAGE_AND_TAX_ITEM_PayeeIncomeVoluntaryAgreementGrossAmount";
        newForm[10936][25457] = 0 //oTH_WAGE_AND_TAX_ITEM_PayeeIncomeOtherAmount";
        newForm[10936][27454] = 0 //oTH_WAGE_AND_TAX_ITEM_PayeeIncomeWorkingHolidayMakerYearToDateGrossAmount";
        newForm[10936][25458] = sbrForm.Payee[0].PayrollPeriod[0].IncomeFringeBenefitsReportableCollection[0].IncomeFringeBenefitsReportable[0].FringeBenefitsReportableExemptionC[0] == 'T' ? sbrForm.Payee[0].PayrollPeriod[0].IncomeFringeBenefitsReportableCollection[0].IncomeFringeBenefitsReportable[0].A[0] : 0 //oTH_WAGE_AND_TAX_ITEM_PayeeFringeBenefitsReportableTaxableAmount";
        newForm[10936][25459] = sbrForm.Payee[0].PayrollPeriod[0].IncomeFringeBenefitsReportableCollection[0].IncomeFringeBenefitsReportable[0].FringeBenefitsReportableExemptionC[0] !== 'T' ? sbrForm.Payee[0].PayrollPeriod[0].IncomeFringeBenefitsReportableCollection[0].IncomeFringeBenefitsReportable[0].A[0] : 0 //oTH_WAGE_AND_TAX_ITEM_PayeeFringeBenefitsReportableExemptAmount";
        newForm[10936][16820] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].IncomeTaxPayAsYouGoWithholdingTaxWithheldA[0]; //oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingYearToDateWithheldAmount";
        newForm[10936][25460] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].IncomeTaxForeignWithholdingA[0]; //oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingForeignEmploymentIncomeTotalAmount";
        newForm[10936][25461] = 0 //oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingForeignEmploymentIncomeJointPetroleumDevelopmentAreaTotalAmount";
        newForm[10936][25462] = 0 //oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingLabourHireTotalAmount";
        newForm[10936][25463] = 0 //oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingVoluntaryAgreementTotalAmount";
        newForm[10936][25464] = 0//oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingOtherSpecifiedTotalAmount";
        newForm[10936][27455] = 0 //oTH_WAGE_AND_TAX_ITEM_PayAsYouGoWithholdingWorkingHolidayMakerYearToDateTotalAmount";
        newForm[10936][15523] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].IncomeTaxForeignWithholdingA[0]; //oTH_WAGE_AND_TAX_ITEM_YearToDateForeignIncomeEmploymentTaxCreditWithheldAmount";
        newForm[10936][27456] = 0 //oTH_WAGE_AND_TAX_ITEM_JointPetroleumDevelopmentAreaForeignIncomeEmploymentTaxPaidYearToDateAmount";
        newForm[10936][26716] = sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].GrossA[0]; //oTH_WAGE_AND_TAX_ITEM_PaymentSummaryTotalGrossPaymentAmount";
        newForm[10936][26717] = 0 //oTH_WAGE_AND_TAX_ITEM_TaxWithheldTotalAmount";

        newForm[10939] = {};
        count = 0;
        sbrForm.Payee[0].PayrollPeriod[0].DeductionCollection.map((d: any) => {
            if (count == 0) {
                newForm[10939][16825] = []
                newForm[10939][16833] = []
            }
            newForm[10939][16825][count] = d.Deduction[0].RemunerationTypeC[0]; //oTH_DEDUCTION_ITEM_SectionGroup3", "oTH_DEDUCTION_ITEM_IndividualDeductionTypeCode";
            newForm[10939][16833][count] = d.Deduction[0].RemunerationA[0]; //oTH_DEDUCTION_ITEM_SectionGroup3", "oTH_DEDUCTION_ITEM_IndividualDeductionYearToDateAmount";
            count++
        })

        count = 0;
        newForm[10939] = {};
        sbrForm.Payee[0].PayrollPeriod[0].RemunerationCollection[0].Remuneration[0].AllowanceCollection.map((a: any) => {
            if (count == 0) {
                newForm[10939][16835] = []
                newForm[10939][15524] = []
                newForm[10939][16841] = []
            }
            newForm[10939][16835][count] = a.Allowance[0].TypeC[0]; //oTH_ALLOWANCE_ITEM_SectionGroup4", "oTH_ALLOWANCE_ITEM_AllowanceIncomeTypeCode";
            newForm[10939][15524][count] = a.Allowance[0].OtherAllowanceTypeDe[0]; //oTH_ALLOWANCE_ITEM_SectionGroup4", "oTH_ALLOWANCE_ITEM_AllowanceIncomeTypeOtherDescriptionText";
            newForm[10939][16841][count] = a.Allowance[0].EmploymentAllowancesA[0]; //oTH_ALLOWANCE_ITEM_SectionGroup4", "oTH_ALLOWANCE_ITEM_AllowanceIncomeYearToDateAmount";
        })

        newForm[10941] = {};
        newForm[10941][25465] = 0 //oTH_ALLOWANCE_ITEM_AllowanceIncomeTotalAmount";

        newForm[10943] = {};
        newForm[10943][15525] = sbrForm.Payee[0].PayrollPeriod[0].SuperannuationContributionCollection[0].SuperannuationContribution[0].EmployerContributionsYearToDateA[0]; //oTH_SUPER_ENTITLEMENT_YearToDateSuperannuationGuaranteeEmployerContributionAmount";
        newForm[10943][15521] = 0 //oTH_SUPER_ENTITLEMENT_YearToDateSuperannuationGuaranteeOrdinaryTimeEarningsAmount";
        newForm[10943][25466] = 0 //oTH_SUPER_ENTITLEMENT_EmployerSuperannuationContributionReportableAmount";

        newForm[11303] = {};
        newForm[11303][25467] = sbrForm.Payee[0].EmployerConditions[0].PaymentBasisC[0]; //oTH_TFN_DECLARATION_PayerPayeeRelationshipPaymentBasisCode";
        newForm[11303][25468] = "" //oTH_TFN_DECLARATION_PayeeClientResidentStatusCode";
        newForm[11303][25469] = "" //oTH_TFN_DECLARATION_PayerPayeeRelationshipTaxFreeThresholdClaimedIndicator";
        newForm[11303][28130] = "" //oTH_TFN_DECLARATION_PayerPayeeRelationshipStudyandTrainingLoanRepaymentClaimedIndicator";
        newForm[11303][25476] = "" //oTH_TFN_DECLARATION_PayerPayeeRelationshipStudentFinancialSupplementDebtClaimedIndicator";
        newForm[11303][25478] = "" //oTH_TFN_DECLARATION_PayeeDeclarationIndicator";
        newForm[11303][25479] = "" //oTH_TFN_DECLARATION_PayeeDeclarationDate";
        newForm[11303][28352] = "" //oTH_TFN_DECLARATION_PayerPayeeRelationshipTerminatedIndicator" 
        //Don't know where to map:
        // Payee.EmployerConditions.TaxTreatmentC
        // Payee.EmployerConditions.TaxOffsetClaimTotalA
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.IncomeStreamTypeC
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.AddressDetailsCountryC
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.OvertimePaymentA
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.GrossBonusesAndCommissionsA
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.GrossDirectorsFeesA
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.IndividualNonBusinessCommunityDevelopmentEmploymentProjectA
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.SalarySacrificeCollection.SalarySacrifice.TypeC
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.SalarySacrificeCollection.SalarySacrifice.PaymentA
        // Payee.PayrollPeriod.RemunerationCollection.Remuneration.SuperannuationContributionCollection.SuperannuationContribution.EntitlementTypeC
        return newForm;

    } catch (err) {
        return " " + err;
    }
}