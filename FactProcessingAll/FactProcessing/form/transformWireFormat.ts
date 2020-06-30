import * as myLog from '../../myLog';
// the legacy JSRE "wire" format of a form has each section as a property of the form.
// This is stored in meaningful names as documented in Form Meta Data.
// This function turns the meaningful stored format back to the JSRE wire format
export function transformMeaningfulStorageToJSREWireFormat(form: any, fMetaDataByName: [[{
  sId: number;
  fId: string;
}]], formMetaDataById?: any) {
  function transform(form: any, fMetaDataByName: [[{
    sId: number;
    fId: string;
  }]], dataItem: any, sName: any, fUsage: any, fName: any, lookupName: any): boolean {
    if (fMetaDataByName[sName][lookupName]) {
      const { sId, fId } = (fMetaDataByName[sName][lookupName]);
      if (!form[sId])
        form[sId] = {};
      if (dataItem && dataItem.constructor === Array)
        form[sId][fId] = { _values: dataItem, _value: dataItem[0], index: 0 };
      else
        form[sId][fId] = { _value: dataItem };
      if (fUsage)
        delete form[sName][fUsage][fName];
      else
        delete form[sName][fName];
      return true;
    }
    else
      return false;
  }
  Object.keys(form).forEach((sName: any) => {
    if (sName !== "sIds" && fMetaDataByName[sName]) {
      Object.keys(form[sName]).forEach((fNameOrFUsage: any) => {
        let transformed = transform(form, fMetaDataByName, form[sName][fNameOrFUsage], sName, "", fNameOrFUsage, fNameOrFUsage);
        if (!transformed && form[sName][fNameOrFUsage])
          Object.keys(form[sName][fNameOrFUsage]).forEach((fName: any) => {
            transformed = transform(form, fMetaDataByName, form[sName][fNameOrFUsage][fName], sName, fNameOrFUsage, fName, fNameOrFUsage + "." + fName);
          });
        if (form[sName][fNameOrFUsage] && Object.keys(form[sName][fNameOrFUsage]).length == 0)
          delete form[sName][fNameOrFUsage];
        if (!transformed)
          myLog.warn("Couldnt find %s & %s in metadata, so no transformation done", sName, fNameOrFUsage);
      });
      if (Object.keys(form[sName]).length == 0)
        delete form[sName];
    }
  });
  myLog.debug(`form details after transformed to wire format: ${JSON.stringify(form).substr(0, 200)}...`);
  myLog.log(form);
  return form;
}
// the current legacy "wire" format of a form has each section as a property of the form.
// I couldn't figure out how to "type" that in mongoose.  So instead forms are stored with 
// an array of Sections.  This function converts the stored format of a form back to the public format.
export function transformLegacyStorageToWireFormat(form: any) {
  myLog.debug("Transform to Wire format");
  //delete form.kind;
  for (let i = 0; i < form.Sections.length; i++) {
    let thisSecId = form.Sections[i].SectionId;
    form[thisSecId] = {};
    for (let j = 0; j < form.Sections[i].LineItems.length; j++) {
      let thisFieldId = form.Sections[i].LineItems[j].FieldId;
      form[thisSecId][thisFieldId] = {
        index: form.Sections[i].LineItems[j].FieldIndex,
        _value: form.Sections[i].LineItems[j].Value
      };
    }
  }
  delete form.Sections;
  myLog.debug(`form details after transformed to wire format: ${JSON.stringify(form).substr(0, 200)}...`);
  myLog.log(form);
  return form;
}
export function transformFromLegacyJSREToExplicitStorageFormat(formLineItems: any, fMetaDataById: any) {
  Object.keys(formLineItems).forEach((sId: any) => {
    if (sId.length == 5) {
      Object.keys(formLineItems[sId]).forEach((fId: any) => {
        if (formLineItems[sId][fId].constructor.name == "FdfValue") {
          const sName = fMetaDataById[sId].sName, [fUsage, fName] = fMetaDataById[sId][fId];
          if (!formLineItems[sName])
            formLineItems[sName] = {};
          if (!fUsage)
            formLineItems[sName][fName] = (formLineItems[sId][fId]._values) ? formLineItems[sId][fId]._values : formLineItems[sId][fId]._value;
          else {
            if (!formLineItems[sName][fUsage])
              formLineItems[sName][fUsage] = {};
            formLineItems[sName][fUsage][fName] = (formLineItems[sId][fId]._values) ? formLineItems[sId][fId]._values : formLineItems[sId][fId]._value;
          }
          delete formLineItems[sId][fId];
        }
      });
      if (Object.keys(formLineItems[sId]).length == 0)
        delete formLineItems[sId];
    }
  });
  myLog.debug(`form details after transformed to explicit storage format: ${JSON.stringify(formLineItems).substr(0, 200)}...`);
  myLog.log(formLineItems);
}
export function transformFromLegacyJSREToStorageFormat_old(formLineItems: any, formMetaData: any, formDef: any) {
  formLineItems.Sections = [];
  for (let i = 0; i < formMetaData.sections.length; i++) {
    let thisSecId = formMetaData.sections[i].id;
    if (formLineItems[thisSecId]) {
      let newLineItems = [];
      for (let j = 0; j < (formMetaData.sections[i].fields || []).length; j++) {
        let thisFieldId = formMetaData.sections[i].fields[j].id;
        if (formLineItems[thisSecId][thisFieldId]) {
          const newLI = {
            FieldId: thisFieldId,
            FieldIndex: formLineItems[thisSecId][thisFieldId].index,
            Value: formLineItems[thisSecId][thisFieldId]._values ? formLineItems[thisSecId][thisFieldId]._values : formLineItems[thisSecId][thisFieldId]._value
          };
          newLineItems.push(newLI);
        }
      }
      let newSection = { SectionId: formMetaData.sections[i].id, LineItems: newLineItems };
      formLineItems.Sections.push(newSection);
      formLineItems[thisSecId] = null;
    }
  }
}
