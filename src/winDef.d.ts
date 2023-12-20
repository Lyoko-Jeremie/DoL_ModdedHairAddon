import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import type jQuery from "jquery/misc";

export interface HairItem {
    name: string,
    name_cap: string,
    variable: string,
    type: string[],
    shop: string[],
}

export type HairObject = { [key: string]: HairItem };

declare global {
    interface Window {
        modUtils: ModUtils;
        modSC2DataManager: SC2DataManager;

        jQuery: jQuery;

        addonModdedHairAddon: ModdedHairAddon;

        DOL: {
            // In pseudo-load order

            /**
             * This is a miniature application reporter app.  It helps get detailed error messages to devs.
             * See file {@link ./01-error/error.js} for more.
             */
            Errors: {} | any,
            /**
             * Registry of state schema, used for migrating DoL to new versions.
             * See {@link ./02-version/.init.js} for more.
             */
            Versions: {} | any,
            Perflog: {} | any,
            /**
             * General purpose call stack containing the widget names as they are called.
             */
            Stack: any[],

            // The following are patches to make javascript execution more consistent (see comment below).
            State,
            setup: {
                hairstyles: HairObject;
                hairTraits: string[];
            },
            Wikifier,
            Template,
        };
    }
}
