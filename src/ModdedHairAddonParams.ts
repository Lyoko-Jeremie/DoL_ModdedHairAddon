import {get, set, has, isString, isArray, every, isNil, isObject} from 'lodash';
import type {HairObject} from "./winDef";

export interface ModdedClothesHairParams {
    hair: string[];
}

export function checkParams(a: any): a is ModdedClothesHairParams {
    return a && a.hair && isArray(a.hair) && a.hair.every(isString);
}

function checkHairObject(c: any) {
    return isObject(c)
        && isString(get(c, 'name'))
        && isString(get(c, 'name_cap'))
        && isArray(get(c, 'type')) && every(get(c, 'type'), isString)
        && isArray(get(c, 'shop')) && every(get(c, 'shop'), isString)
        ;
}

export function checkHairItem(a: any): a is HairObject {
    return a && every(Object.keys(a), (k) => {
        const t = a[k];
        return t && isArray(t) && every(t, checkHairObject);
    });
}

