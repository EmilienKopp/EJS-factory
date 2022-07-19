import EJSHtmlBuilder from "./lib/ejs-html-builder.js";

export default class EJSFactory {

    /**
     * List of available Block types
     * @type {string[]}
     * @memberof EJSFactory
     */
    blockTypes = ["paragraph", "header", "list", "image", "embed", "code", "quote", "table", "hr", "warning", "linkTool", "media", "attaches"];


    /**
     * Store the JSON string representing the blocks of the editor
     * @type {string}
     * @memberof EJSFactory
     */
    JSON;

    /**
     * Store the static HTML string representing the blocks of the editor
     * @type {string}
     * @memberof EJSFactory
     */
    HTML;

    /**
     * Container to receive the HTML string by default
     * @type {HTMLElement}
     * @memberof EJSFactory
     */
    container;

    /**
     * Map of CSS classes to be used by the EJS HTML builder
     * @type {object}
     * @memberof EJSFactory
     */
    CSSClasses = {};

    /**
     * Checks for the presence of the HTML string in the HTMLstring property
     * @type {boolean}
     * @memberof EJSFactory
     */
    hasJSON = () => { return this.JSONstring !== null || this.JSONstring !== undefined || this.JSONstring !== ""; }

    /**
     * Checks for the presence of the HTML string in the HTMLstring property
     * @type {boolean}
     * @memberof EJSFactory
     */
    hasHTML = () => { return this.HTMLstring !== null || this.HTMLstring !== undefined || this.HTMLstring !== ""; }

    /**
     * HTML Builder instance
     * @type {EJSHtmlBuilder}
     * @memberof EJSFactory
     */
    HTMLBuilder;

    /**
     * Constructor of the EJS class
     * @param {string | object} data JSON formatted string representing the blocks of the editor OR OutputData object from the editor 
     * @memberof EJSFactory
     */
    constructor (data = null) {
        if(data) {
            switch (typeof data) {
                case "string":
                    this.JSON = data;
                    break;
                case "object":
                    this.JSON = JSON.stringify(data);
                    break;
                default:
                    throw new Error("Invalid data type provided as source for the EJS factory");
            }
            this.HTMLBuilder = new EJSHtmlBuilder(this.JSON);
        }
    }

    /**
     * Sets the JSONstring property to the given value (can be a JSON string or an OutputData object).
     * @param {string | object} data
     * @returns {EJSFactory} Instance of the EJSFactory class to allow chaining. 
     */
    from(data) {
        switch (typeof data) {
            case "string":
                this.JSON = data;
                break;
            case "object":
                this.JSON = JSON.stringify(data);
                break;
            default:
                throw new TypeError("Invalid data type provided as source for the EJS factory");
        }

        this.HTMLBuilder = new EJSHtmlBuilder(this.JSON);
        return this;
    }

    /**
     * Sets the default container to be used by the EJS HTML builder to receive the constructed HTML
     * @param {Element} target HTML element to render the HTML content
     */
    to(target) {
        this.container = target;
    }

    /**
     * Internally build the HTML string from the JSONstring property, using the JSON property and the container property
     * @returns {void}
     * @memberof EJSFactory
     */
    render() {
        if (this.hasJSON) { 
            this.HTMLBuilder = new EJSHtmlBuilder(this.JSON);
            this.HTML = this.HTMLBuilder.build(this.container);
        }
    }

    /**
     * Builds the HTML string from the JSON string into an HTML element
     * @param {object} from JSON object to be converted to HTML
     * @param {Element} to HTML element to render the HTML content 
     */
    render(from, to) {
        this.JSON = from;
        this.container = to;

        this.build();
    }

    /**
     * Clear the JSON and HTML strings
     * @returns {void}
     * @memberof EJSFactory
     */
    reset() {
        this.HTML = "";
        this.JSON = "";
    }

    /**
     * Statically take the JSON representation of the editor and render static HTML with it in a given HTML element
     * @static
     * @param {string} data JSON formatted string
     * @param {HTMLElement | string} element HTML element to render the HTML content or its ID
     * @returns {string} HTML content
     * @memberof EJSFactory
     */
    static renderHTML(json, target) {
        switch (typeof target) {
            case "string":
                target = document.getElementById(target);
                break;
            case "HTMLElement":
                break;
            default:
                throw new TypeError("Invalid target element.");
        }
        HTMLBuilder= new EJSHtmlBuilder(json);
        HTMLBuilder.build(target);
    }

    /**
     * Checks for the presence of the JSON string in the JSON property
     * @returns {boolean} True if the JSON string is set, false otherwise
     * @memberof EJSFactory
     */
    hasJSON() {
        return this.JSONstring != null && this.JSONstring != undefined && this.JSONstring != "";
    }

    /**
     * Checks for the presence of the HTML string in the HTML property
     * @returns {boolean} True if the HTML string is set, false otherwise
     * @memberof EJSFactory
     */
    hasHTML() {
        return this.HTMLstring != null && this.HTMLstring != undefined && this.HTMLstring != "";
    }

    /**
     * Check the compatibilty of the blocksType list with the available block types by iterating through the editorconfig object's "tools" property
     * @param {object} editorconfig
     * @returns {boolean} True if the list of block types is compatible with the editorconfig object's "tools" property, false otherwise
     * @memberof EJSFactory
     */
    checkBlockTypes(editorconfig) {
        if (editorconfig.tools) {
            for (let i = 0; i < editorconfig.tools.length; i++) {
                if (this.blockTypes.indexOf( Object.keys(editorconfig.tools[i])[0] ) === -1) {
                    return false;
                }
            }
        }
        return true;
    }
}
