import * as myLog from '../../myLog';
myLog.debug("Need to implement secure coding checks");

import * as express from 'express';
import {regExs} from './secureCodingRegExes';

//this module checks the input form is reasonably clean, no XSS/ SQL Injections
//- it does this by applying regEx expressions to any string form line items to check it doesn't contain unsavory characters or strings
//
export const doCleanInputCheck = function (req: express.Request, res: express.Response, next: express.NextFunction) {
    myLog.debug('Checking that body is squeaky cleana');
    // let result: boolean = false;
    // var frm: string = req.body.FormTypeMung;
    // req.body.Sections.forEach((section:any) => {
    //     section.LineItems.forEach((lineItem:any) => {
    //         const reString: string = regExs[frm][<number>section.SectionId][<number>lineItem.FieldId];
    //         if (reString) {
    //             result = new RegExp(reString).test(<string> lineItem.FieldValue);
    //             if (!result) 
    //                 next(new Error("Invalid input in field" + section.SectionId + " " + lineItem.FieldId));
    //         }
    //     })
    // });
    next();
};