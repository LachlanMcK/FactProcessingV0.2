/** This file contains a function to turn JSRE produced meta-data into schema meta-data for mongoose
*/


// export function formMetaDataxChangedDirection(formDef: any, formMetaData: any) {
//     let myMapId: any = {}, myMapName: any = {};
//     Object.keys(formDef.sections).forEach((sId) => {
//         let sName: any = myMapId[sId] = { sName: formDef.sections[sId] };
//         let a = (myMapName[sName] || []).push(sId);
//         myMapName[sName] = { sIds: a };
//     });
//     formDef.fields.forEach((f: any) => {
//         let [sId, fId, fUsg, fName] = [...f];
//         if (!myMapId[sId]) {
//             myMapId[sId] = { sName: sId };
//             myMapName[sId] = { sIds: [sId] };
//         }
//         let fldName = fUsg ? (fUsg + ".") : "" + fName;
//         let sName = myMapId[sId].sName;
//         myMapName[sName][fldName] = { sId: sId, fId: fId }
//         myMapId[sId][fId] = { sName: sName, fName: fldName }
//     });
// }


import * as mongoose from "mongoose";
/**
 * 
 * This function inputs two meta-data javascript files produced by the JSRE and outputs mongoose schema defintion
 * 
 * @param formDef - this takes the JSRE program <jsre-form-name>form.js 
 *                  this meta-data file contains the mapping of formlineitem ids to their domain types
 * @param formMetaData  - this takes the <jsre-form-name> object in the JSRE program <jsre-form-name>mapping.js
 * @returns - an object that contains:
 *              schema - the mongoose schema
 *              byId - a lookup object to map Section/Field Ids to meaningful section names/ field usage & names
 *              byName - a lookup object to map meaningful field names to section/field ids
 */
export function getFormDescription(formDef: any, formMetaData: any): { schema: mongoose.Schema, byId: any, byName: any } {

    const formsTypesToMongooseTypes: any = {
        'C': 'String', //char
        'I': 'String', //indicator
        'D': 'Date',   //date
        'Y': 'Number', //year
        'Q': 'Number', //small integer
        'A': 'Number', //decimal
        'N': 'Number', //u_decimal
        'X': 'Number', //num_char
        'U': 'Number', //integer
        'M': 'Number' //u_integer
    }

    let fDef_Schema: any = {};
    let fDef_byId: any = {};
    let fDef_Name: any = {};
    let sId: number, fId: number;
    let sName: string, fUsageName: string, fName: string, fldName: number | string;

    function newSection(sId: any, sName: any) {
        fDef_byId[sId] = { sName: sName };
        if (fDef_Name[sName])
            fDef_Name[sName].sIds.push(sId);
        else {
            fDef_Name[sName] = {};
            fDef_Name[sName].sIds = [sId];
        }
        return {}; //for some reason can't have alias here sId != sName ? { alias: fDef_Name[sName].sIds[0] } : {} //return the first section id as the alias where a name is supplied
    }

    function newField(sId: number, sName: number | string, fId: string, fUsageName: string, fName: number | string): number | string {
        let fldName = fName;
        if (fUsageName) {
            if (!fDef_Schema[sName][fUsageName])
                fDef_Schema[sName][fUsageName] = {};
            fldName = (fUsageName ? (fUsageName + ".") : "") + fName;
            fDef_Schema[sName][fUsageName][fName] = { alias: fId };
        }
        else
            fDef_Schema[sName][fName] = fId == fName ? {} : { alias: fId };

        fDef_Name[sName][fldName] = { sId: sId, fId: fId };
        fDef_byId[sId][fId] = [fUsageName, fName];
        return fldName;
    }

    Object.keys(formDef.sections).forEach((sId: any) => fDef_Schema[formDef.sections[sId]] = newSection(sId, formDef.sections[sId]));

    formDef.fields.forEach((f: any) => {
        [sId, fId, fUsageName, fName] = f;
        sName = formDef.sections[sId];

        if (!fDef_Name[sName])
            fDef_Schema[sName] = newSection(sId, sName); //shouldn't be the case but coudld possibly find new section

        fldName = newField(sId, sName, fId+ "" , fUsageName, fName)
    });


    formMetaData.sections.forEach((s: any) => {
        if (!fDef_byId[s.id])
            fDef_Schema[s.id] = newSection(s.id, s.id); //don't need an alias here

        const sName = fDef_byId[s.id].sName

        if (s.fields)
            s.fields.forEach((f: any) => {
                if (f.id == "id" || f.id == "fields" || f.id == "validateRules" || f.id == "updateRules") { }
                else {


                    if (!fDef_byId[s.id][f.id])
                        fldName = newField(s.id, sName, f.id, "", f.id); //discovered a new field not in formDef, so usage = "" and name will be the id

                    [fUsageName, fName] = fDef_byId[s.id][f.id];

                    let field: any;
                    if (fUsageName == "") field = fDef_Schema[sName][fName]; else field = fDef_Schema[sName][fUsageName][fName];
                    field.type = formsTypesToMongooseTypes[f.type];

                    if (f.groupId) {
                        field.type = [];
                        field.type.push(formsTypesToMongooseTypes[f.type]);
                        fDef_byId[s.id][f.id].groupId = f.groupId
                    }

                    console.assert(field.type, JSON.stringify(f));
                    if (f.maxLength) fDef_byId[s.id][f.id].maxLength = field.maxlength = f.maxLength;

                    console.log(field.type, JSON.stringify(f));
                }
            })
    });

    return { schema: fDef_Schema, byId: fDef_byId, byName: fDef_Name };
}