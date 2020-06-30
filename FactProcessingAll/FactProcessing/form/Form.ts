//import  mongoose from "mongoose";
//import * as mongoose  from "mongoose";
import * as myLog from '../../myLog';
import mongoose = require('mongoose');  //https://stackoverflow.com/questions/34482136/mongoose-the-typescript-way

// define the shape of the Line Items part of Forms
const LineItemDef = {
  FieldId: String,
  FieldIndex: Number,
  Value: Object
}

let LineItemsSchema = new mongoose.Schema(LineItemDef);

// define the shape of the sections part of Forms
// sections are made up of Line Items
const SectionDef = {
  SectionId: String,
  SectionName: String,
  LineItems: [LineItemsSchema]
}

let SectionSchema = new mongoose.Schema(SectionDef);

// define the shape of Forms
// Forms are made up of Sections which are made up of Line Items
export const FormDef = {
  ClientInternalId: {
    type: Number,
    required: false
  },
  AccountSequenceNumber: Number,
  RoleTypeCode: Number,
  PeriodStartDt: Date,
  FormType: {
    type: String,
    required: true
  },
  TransactionId: {
    type: Number,
    required: true
  },
  workItemId: String,
  Sections: [SectionSchema],
  createdAt: Date,
  updatedAt: Date,
  DT_Update: String,
  TM_Update: String,
  subjectClient: {
    ClientIdentifierType: String,
    ClientIdentifierValue: Number,
    MatchingStatus: String
  },
  ProcessingStatusCd: Number, //a code statement indicating where processing of this entry is up to
  ErrorCd: String, //if record is kept with errors, this is the error code
  TransmissionDetails: { //when there is a TransmissionBET, there should be a Supplier who was the source of the transmission
    ClientIdentifierType: String,
    ClientIdentifierValue: Number,
    TransmissionBET: Number,  //this is a bet number allocated to files so can cancel all record in a file
    TransmissionReference: Number,  //this is the record/position number in a file so when send error messages can references where it came from
    ThreadId: Number, // If we shard the bulk processing of facts, we may want to count by shard
    RecordCount: Number
  }  
}

let FormSchema = new mongoose.Schema(FormDef, { discriminatorKey: 'kind' });

//This is the default
const FormCollectionDetails = {
  collection: 'Forms',
  versionKey: false
}

export function setFootprintProperties(form: any, updateOnlyFlag?: Boolean) {
  const now: Date = new Date();
  if ((form.DT_Update || form.TM_Update) && !(form.updatedAt)) throw "updatedAt must exist if DT/TM_Updated fields are populated"
  if (!form.createdAt && !(updateOnlyFlag)) {
    //arguably don't need a createdAt field as it can be obtained from _id  https://docs.mongodb.com/manual/reference/method/ObjectId.getTimestamp/
    // form.createdAt = now;
    //should only set the createdAt when creating.  This feature should only matter if they forget to return the createdAt field on an update.
    //but if they do forget that, what else are they forgetting??
    form["$setOnInsert"] = { createdAt: now }
  }
  form.updatedAt = now;
  //todo: investigate making this virtual
  form.DT_Update = now.toLocaleDateString();
  form.TM_Update = now.toLocaleTimeString();
  return form;
}

FormSchema.index({ TransactionId: 1 }, { unique: true, name: "primary" });
FormSchema.index({ "subjectClient.ClientIdentifierValue": 1, "subjectClient.ClientIdentifierType": 1, "AccountSequenceNumber": 1, "RoleTypeCode": 1 }, { unique: false, name: "Carpat" });

FormSchema.index({ "subjectClient.ClientIdentifierValue": 1, "subjectClient.ClientIdentifierType": 1, "formType": 1 }, { unique: false, name: "clientExtIdByForm" });
FormSchema.index({ ClientInternalId: 1, formType: 1 }, { sparse: true, name: "clientIntIdByForm" });
FormSchema.index({ workItemId: 1 }, { sparse: true });

//todo: this is fine for dev but need to tidy this up
FormSchema.set('autoIndex', true);
//FormSchema.set('autoIndex', false);

export const BaseForm: mongoose.Model<mongoose.Document> = mongoose.model('Form', FormSchema);

let mongooseModels: any = {};
export function Form(formType?: string, formSpecificLineItemSchema?: mongoose.Schema): mongoose.Model<mongoose.Document> {
  if (!formType) return BaseForm;

  if (!mongooseModels[formType]) {
    mongooseModels[formType] = BaseForm.discriminator(formType, new mongoose.Schema(formSpecificLineItemSchema));
    myLog.debug("Additional " + formType + " line items schema definition ");
    myLog.log("Discriminated schema for: " + formType, formSpecificLineItemSchema);
  }

  myLog.debug("Returning discriminated schema for:" + formType);
  return mongooseModels[formType];
}

export const HistorySchema = new mongoose.Schema({
  TransactionId: {
    type: Number,
    required: true
  },
  DT_Update: String,
  TM_Update: String,
  history: {}
}, { versionKey: false });
HistorySchema.index({ TransactionId: 1, DT_Update: 1, TM_Update: 1 }, { unique: true, name: "primary" });
export const HistoryForm: mongoose.Model<mongoose.Document> = mongoose.model('FormHistory', HistorySchema);

// export const PreFillSchema = new mongoose.Schema({
//   TransactionId: {
//     type: Number,
//     required: true
//   },
//   FormType: {
//     type: String,
//     required: true
//   },
//   subjectClient: {
//     ClientIdentifierType: String,
//     ClientIdentifierValue: Number
//   },
//   createdAt: Date,
//   updatedAt: Date,
//   DT_Update: String,
//   TM_Update: String,
//   facts: [mongoose.Schema.Types.Mixed]
// }, { versionKey: false });
// //PreFillSchema.index({ TransactionId: 1, FormType: 1 }, { unique: true, name: "primary" });
// export const PreFillForm: mongoose.Model<mongoose.Document> = mongoose.model('prefillIITR', PreFillSchema);

export const PreFillSchema2 = new mongoose.Schema({
  facts: [mongoose.Schema.Types.Mixed]
}, { versionKey: false });

//todo: take out of facts collection
//      got to confess, I only did this because I could and it tickled my fancy to do so.  Saved me having to write separate Get/Delete (for testing)
//      but prefill structure doesn't really look like fact structure, so I shouldn't do this.
export const PreFillForm: mongoose.Model<mongoose.Document> = BaseForm.discriminator('prefillIITRForm', new mongoose.Schema({ facts: [] }));
mongooseModels['prefillIITRForm'] = PreFillForm;
