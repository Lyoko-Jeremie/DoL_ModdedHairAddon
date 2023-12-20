import type {AddonPluginHookPointEx} from "../../../dist-BeforeSC2/AddonPlugin";
import type {LifeTimeCircleHook, LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {ModBootJsonAddonPlugin, ModInfo} from "../../../dist-BeforeSC2/ModLoader";
import type {ModZipReader} from "../../../dist-BeforeSC2/ModZipReader";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import JSZip from "jszip";
import * as JSON5 from "json5";
import {get, set, has, isString, isArray, every, isNil, cloneDeep, clone} from 'lodash';
import {checkHairItem, checkParams} from "./ModdedHairAddonParams";
import {HairObject} from "./winDef";

export class ModdedHairAddon implements LifeTimeCircleHook, AddonPluginHookPointEx {
    logger: LogWrapper;

    isInit = false;

    constructor(
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.logger = gModUtils.getLogger();
        this.gSC2DataManager.getModLoadController().addLifeTimeCircleHook('ModdedHairAddon', this);
        this.gModUtils.getAddonPluginManager().registerAddonPlugin(
            'ModdedHairAddon',
            'ModdedHairAddon',
            this,
        );
        // we must init it in first passage init
        this.gSC2DataManager.getSc2EventTracer().addCallback({
            whenSC2PassageInit: () => {
                if (this.isInit) {
                    return;
                }
                this.isInit = true;
                this.init();
            },
        });
    }

    hairData: Map<string, HairObject> = new Map<string, HairObject>();

    async registerMod(addonName: string, mod: ModInfo, modZip: ModZipReader) {
        if (!mod) {
            console.error('registerMod() (!mod)', [addonName, mod]);
            this.logger.error(`registerMod() (!mod): addon[${addonName}] mod[${mod}]`);
            return;
        }
        const pp = mod.bootJson.addonPlugin?.find((T: ModBootJsonAddonPlugin) => {
            return T.modName === 'ModdedHairAddon'
                && T.addonName === 'ModdedHairAddon';
        })?.params;
        if (!checkParams(pp)) {
            console.error('[ModdedHairAddon] registerMod() ParamsInvalid', [addonName, mod, pp]);
            this.logger.error(`[ModdedHairAddon] registerMod() ParamsInvalid: addon[${addonName}]`);
            return;
        }
        let ff: HairObject = {};
        for (const ft of pp.hair) {
            const data = await modZip.zip.file(ft)?.async('string');
            if (isNil(data)) {
                console.error('[ModdedHairAddon] registerMod() hair data file not found', [addonName, mod, pp, ft]);
                this.logger.error(`[ModdedHairAddon] registerMod() hair data file not found: addon[${addonName}] file[${ft}]`);
                return;
            }
            if (!data) {
                console.error('[ModdedHairAddon] registerMod() hair data file empty', [addonName, mod, pp, ft]);
                this.logger.error(`[ModdedHairAddon] registerMod() hair data file empty: addon[${addonName}] file[${ft}]`);
                return;
            }
            try {
                const f = JSON5.parse(data);
                if (!checkHairItem(f)) {
                    console.error('[ModdedHairAddon] registerMod() hair data invalid', [addonName, mod, pp, ft, data, f]);
                    this.logger.error(`[ModdedHairAddon] registerMod() hair data invalid: addon[${addonName}] file[${ft}]`);
                    return;
                }
                ff = mergeHairObject(ff, f, mod.name, this.logger);
            } catch (e) {
                console.error('[ModdedHairAddon] registerMod() hair data invalid', [addonName, mod, pp, ft]);
                this.logger.error(`[ModdedHairAddon] registerMod() hair data invalid: addon[${addonName}] file[${ft}]`);
                return;
            }
        }
        if (this.hairData.has(mod.name)) {
            console.warn('[ModdedHairAddon] registerMod() hair data already exists', [addonName, mod, pp]);
            this.logger.warn(`[ModdedHairAddon] registerMod() hair data already exists: addon[${addonName}]`);
        }
        this.hairData.set(mod.name, ff);
    }

    async exportDataZip(zip: JSZip): Promise<JSZip> {
        zip.file(`ModdedHairAddon/setup/hairstyles`, JSON.stringify(get(window.DOL.setup, 'hairstyles'), undefined, 2));
        zip.file(`ModdedHairAddon/setup/hairTraits`, JSON.stringify(get(window.DOL.setup, 'hairTraits'), undefined, 2));
        return zip;
    }

    init() {
        if (!has(window, 'DOL.setup.hairstyles')) {
            console.error('[ModdedHairAddon] window.DOL.setup.hairstyles not found');
            this.logger.error(`[ModdedHairAddon] window.DOL.setup.hairstyles not found`);
            return;
        }
        if (!has(window, 'DOL.setup.hairTraits')) {
            console.error('[ModdedHairAddon] window.DOL.setup.hairTraits not found');
            this.logger.error(`[ModdedHairAddon] window.DOL.setup.hairTraits not found`);
            return;
        }
        console.log('[ModdedHairAddon] init() hair start', [
            cloneDeep(get(window.DOL.setup, 'hairstyles')),
            cloneDeep(get(window.DOL.setup, 'hairTraits')),
        ]);
        try {
            for (const [k, v] of this.hairData) {
                console.log('[ModdedHairAddon] init() hair merge', [k, v]);
                appendHairObject(get(window.DOL.setup, 'hairstyles'), v, this.logger);
            }
        } catch (e) {
            console.error('[ModdedHairAddon] init() hairstyles error', [e]);
            this.logger.error(`[ModdedHairAddon] init() hairstyles error: ${e}`);
        }
        try {
            const setup = window.DOL.setup;
            set(window.DOL.setup, 'hairTraits',
                // this line come from DoL Game 0.4.4.5 game/04-Variables/hair-styles.twee
                // <<set setup.hairTraits = [...new Set(Object.keys(setup.hairstyles).flatMap(x => setup.hairstyles[x]).flatMap(x => x.type))]>>
                [...new Set(Object.keys(setup.hairstyles).flatMap(x => setup.hairstyles[x]).flatMap(x => x.type))]
            );
        } catch (e) {
            console.error('[ModdedHairAddon] init() hairTraits error', [e]);
            this.logger.error(`[ModdedHairAddon] init() hairTraits error: ${e}`);
        }
        console.log('[ModdedHairAddon] init() hair end', [
            cloneDeep(get(window.DOL.setup, 'hairstyles')),
            cloneDeep(get(window.DOL.setup, 'hairTraits')),
        ]);
        this.logger.log(`[ModdedHairAddon] init() hair end`);
    }
}

/**
 * Merge feats object o and b, create new one. check same key and error it.
 */
export function mergeHairObject(b: HairObject, o: HairObject, modName: string, logger: LogWrapper) {
    const out = cloneDeep(b);
    for (const k in o) {
        if (has(b, k)) {
            const hairsB = out[k];
            const hairsO = o[k];
            for (const h of hairsO) {
                const nn = hairsB.find((T) => T.name === h.name);
                if (nn) {
                    console.warn(`[ModdedHairAddon] mergeHairObject() key already exists, will be overwrite. `, [k, cloneDeep(nn), cloneDeep(hairsB), cloneDeep(hairsO), cloneDeep(h)]);
                    logger.warn(`[ModdedHairAddon] mergeHairObject() key already exists, will be overwrite: [${k}] [${nn.name}]`);
                }
                hairsB.push(h);
            }
        } else {
            set(out, k, get(o, k));
        }
    }
    return out;
}

export function appendHairObject(b: HairObject, o: HairObject, logger: LogWrapper) {
    for (const k in o) {
        if (has(b, k)) {
            const hairsB = b[k];
            const hairsO = o[k];
            for (const h of hairsO) {
                const nn = hairsB.find((T) => T.name === h.name);
                if (nn) {
                    console.warn(`[ModdedHairAddon] appendHairObject() key already exists, will be overwrite. `, [k, cloneDeep(nn), cloneDeep(hairsB), cloneDeep(hairsO), cloneDeep(h)]);
                    logger.warn(`[ModdedHairAddon] appendHairObject() key already exists, will be overwrite: [${k}] [${nn.name}]`);
                }
                hairsB.push(h);
            }
        } else {
            set(b, k, get(o, k));
        }
    }
}
