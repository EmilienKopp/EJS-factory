
import { SmartLogger } from "../utils/streamline.js";

/** DEBUG **/
const LOG_LEVEL = 0;
const TIMERS = false;

/** Logger Object **/
const Logger = new SmartLogger(LOG_LEVEL, TIMERS);

export default class HtmlBricks {

    /**
     * Array of bricks representing the structure of the HTML document
     * @type {Array}
     * @memberof HtmlBricks
     */
    static stack = [];

    /**
     * Root element of the tree
     * @type {HtmlBrick}
     * @memberof HtmlBricks
     */
    root;

    /**
     * Underlying HTML Element
     * @type {Element}
     * @memberof HtmlBricks
     */
    htmlelement;

    /**
     * Child bricks
     * @type {HtmlBricks[]}
     * @memberof HtmlBricks
     */
    over;

    /**
     * Parent brick
     * @type {HtmlBricks}
     * @memberof HtmlBricks
     */
    under;

    /**
     * ID attribute of the brick
     * @type {string}
     * @memberof HtmlBricks
     */
    brickID;

    /**
     * ID of the HTML Element
     * @type {string}
     * @memberof HtmlBricks
     */
    elementID;

    /**
     * Array of classes
     * @type {string[]}
     * @memberof HtmlBricks
     */
    classes;

    /**
     * Position the brick in the tree
     * @type {number} index Index of the brick in the stack
     * @memberof HtmlBricks
     */
    position;

    /**
     * Nesting level of the brick
     * @type {number}
     * @memberof HtmlBricks
     */
    nestingLevel = 0;

    /**
     * Type of the element (block)
     * @type {string}
     * @memberof HtmlBricks
     */
    type;

    /**
     * Category of the template
     * @type {string}
     * @memberof HtmlBricks
     */
    category;

    /**
     * HTML Attributes of the brick as an array
     * @type {Array}
     * @memberof HtmlBricks
     */
    attributes;

    /**
     * Tags of the brick (which HTML element(s) it represents)
     * @type {string}
     * @memberof HtmlBricks
     */
    tag;

    /**
     * Check if the current brick has nested elements
     * @type {boolean}
     * @memberof HtmlBricks
     */
    hasNested = () => { return HtmlBricks.hasNested(this); }

    /**
     * The nested element of the brick
     * @type {HtmlBricks}
     * @memberof HtmlBricks
     */
    nested = () => { return new HtmlBricks( HtmlBricks.template[this.type].nested ); }


    /**
     * Creates an instance of HtmlBricks from a block object or a tag name
     * @param {object | string} from Block object or tag name
     */
    constructor() {
        // ...
    }


    /**------------------------------------------------------------------------------------------/
     * Member functions
     *------------------------------------------------------------------------------------------*/

    /**
     * Define parent brick
     * @param {HtmlBrick} parentBrick
     * @returns {HtmlBricks}
     * @memberof HtmlBricks
     * @example new HtmlBricks().from('div').on(HtmlBricks.root).lay(); // create a simple 'div' brick and append it to the root
     */
    on(parentBrick){
        this.under = parentBrick;
        if(!parentBrick.over) parentBrick.over = [];
        parentBrick.over.push(this);
        this.nestingLevel = parentBrick.nestingLevel + 1;
        return this;
    }

    /**
     * Create a brick from a block object (editor block) 
     * @param {object} block Block object to create the brick from
     * @returns {HtmlBricks}
     * @memberof HtmlBricks
     * @example new HtmlBricks().fromBlock(linkTool).on(HtmlBricks.root).lay(); // create a brick from a linkTool block object and append it to the root
     */
    fromBlock(block) {
        this.category = 'block';
        this.brickID = block.id;
        this.type = block.type;
        let templateElement = HtmlBricks.template.blocks[this.type];
        if(templateElement) {
            if (block.type === 'header'
            && block.data.level
            && block.data.level >= 1) {
                this.tag = templateElement.tag + block.data.level;
            } else if (block.type === 'list') {
                let listType = block.data.style == 'ordered' ? 'ol' : 'ul';
                this.tag = listType;
            } else {
                if (templateElement.nestable ) {
                    if (templateElement.tag[this.under.type]) {
                        this.tag = templateElement.tag[this.under.type];
                    } else {
                        this.tag = templateElement.tag['default'];
                    }
                } else {
                    this.tag = templateElement.tag;
                }
            }
        }
        this.htmlelement = document.createElement(this.tag);
        /** Set the classes from the template **/
        if(templateElement) {
            this.classes = templateElement.classes['default'];
            if(this.classes) {
                this.htmlelement.classList.add(...this.classes);
            }

            this.attributes = templateElement.attributes['default'];
            if(this.attributes) {
                this.attributes.forEach(attribute => {
                    this.htmlelement.setAttribute(attribute.name, attribute.value);
                });
            }
        }
        
        return this;
    }

    /**
     * Create a brick from an HTML tag name
     * @param {string} tag Tag name of the brick
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example HtmlBricks.fromTag('div').on(HtmlBricks.root).lay(); // create a div and append it to the root
     */
    fromTag(tag) {
        this.category = 'tag';
        this.tag = tag;
        this.type = tag;
        this.htmlelement = document.createElement(this.tag);
        
        this.classes = HtmlBricks.template.tags[this.tag].classes['default'];
        if(this.classes) {
            this.htmlelement.classList.add(...this.classes);
        }
        return this;
    }

    /**
     * Create a brick from an attribute of an EditorJS block that needs it's own HTML element
     * @param {string} property Property name of an attribute of an EditorJS block
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().fromProperty('description').on(blockquoteBrick) // creates a brick from the title attribute of a 'blockquote' EditorJS block and append it
     */
    fromProperty(property) {
        this.category = 'property';
        this.type = property;
        let parentBrick = this.under;
        let tag = HtmlBricks.template.properties[property].tags[parentBrick.type]
        if(tag) {
            this.tag = tag;
        } else {
            this.tag = HtmlBricks.template.properties[property].tags['default'];
        }

        this.htmlelement = document.createElement(this.tag);

        if (HtmlBricks.template.properties[property].classes[parentBrick.type]) {
            this.classes = HtmlBricks.template.properties[property].classes[parentBrick.type];
        } else {
            this.classes = HtmlBricks.template.properties[property].classes['default'];
        }

        if (HtmlBricks.template.properties[property].attributes[parentBrick.type]) {
            this.attributes = HtmlBricks.template.properties[property].attributes[parentBrick.type];
        } else {
            this.attributes = HtmlBricks.template.properties[property].attributes['default'];
        }

        this.attributes.forEach(attribute => {
            this.htmlelement.setAttribute(attribute.name, attribute.value);
        });

        if(this.classes) {
            this.htmlelement.classList.add(...this.classes);
        }
        return this;
    }

    /**
     * Create a brick from an existing HTML Element
     * @param {HTMLElement} element HTML Element to create the brick from
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().fromElement(document.createElement('div')).on(blockquoteBrick) // creates a brick from a div element inside a blockquote EditorJS block
     */
    fromElement(htmlElement) {
        this.htmlelement = htmlElement;
        return this;
    }

    /**
     * Set the brick as the root element of the HTML to be constructed
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().from('div').asRoot() // create a simple 'div' brick set it as the root for all bricks created from now on
     */
    asRoot() {
        this.under = null;
        this.type = 'root';
        this.over = [];
        this.position = 0;
        this.nestingLevel = 0;
        //HtmlBricks.stack[this.position] = this;
        return this;
    }

    /**
     * Append the brick to the parent brick set by the last call to .on(brick)
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().from('div').on(blockquoteBrick).lay() // create a simple 'div' brick and append it to the blockquote brick
     */
    lay() {
        if(this.under) {
            this.under.htmlelement.appendChild(this.htmlelement);
        } else {
            throw ReferenceError('No parent brick set for this brick. Consider setting this.under to the parent brick or call .on() to set the parent brick');
        }
        return this;
    }

    /**
     * Set classes for the brick to be constructed with.
     * @param {string[]} classesArray Array of classes to add to the brick
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().from('div').withClasses(['class1', 'class2']) // create a simple 'div' brick and add classes 'class1' and 'class2'
     */
    withClasses(classesArray) {
        if(classesArray) {
            this.classes = classesArray;
            this.htmlelement.classList.add(...classesArray);
        }
        return this;
    }

    /**
     * Set HTML attributes like src, href, etc. for the brick to be constructed with.
     * @param {object[]} htmlAttributes Array of {name: string, value: string} objects to add to the brick
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().from('div').withAttributes([{name: 'src', value: 'https://example.com'}]) // create a simple 'div' brick and add an attribute 'src' with value 'https://example.com'
     */
    withAttributes(htmlAttributes) {
        
        if(htmlAttributes) {
            if(this.attributes == undefined || this.attributes.length == 0) {
                this.attributes = htmlAttributes;
            }
            else {
                htmlAttributes.forEach(attribute => {
                    if(!this.attributes.find(a => a.name == attribute.name)) {
                        this.attributes.push(attribute);
                    }
                });
            }
        }
        if(this.attributes) {
            this.attributes.forEach(attribute => {
                this.htmlelement.setAttribute(attribute.name, attribute.value);
            });
        }
        return this;
    }

    /**
     * Set the innerHTML of the brick's HTML element (htmlelement property)
     * @param {string} innerhtml HTML string to set as the innerHTML of the brick
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().fromTag('div').withInnerHTML('<p>Hello World</p>') 
     * // create a simple 'div' brick and set the innerHTML to '<p>Hello World</p>'
     */
    withHTML(innerhtml) {
        this.htmlelement.innerHTML = innerhtml;
        return this;
    }

    /**
     * Set the textContent of the brick's HTML element (htmlelement property)
     * @param {string} text Text to set as the text content of the brick's HTML element
     * @returns {HtmlBricks} return brick for chaining
     * @memberof HtmlBricks
     * @example new HtmlBricks().fromBlock('paragraph').withText('Hello World')
     * // Create a brick from an EditorJS 'paragraph' block and set the text content to 'Hello World'
     */
    withText(text) {
        this.htmlelement.textContent = text;
        return this;
    }

    /**
     * Set an ID for the brick object
     * @param {string} brickID  Identifier for the brick 
     * @returns {string} the brickID to allow to call .identify() as both getter and setter
     */
    identify(brickID = null) {
        if(brickID) {
            this.brickID = brickID;
            return this;
        }
        return this.brickID;
    }

    /**------------------------------------------------------------------------------------------/
     * Static methods
     *------------------------------------------------------------------------------------------*/


    /**
     * Set a new templating object for the bricks to be constructed with.
     * 
     * @param {object} templateObject Object defining the brick template
     * @returns {void}
     * @memberof HtmlBricks
     * @example HtmlBricks.setTemplate(TemplateObject) // set the brick template
     * @warning This method is static and should be called before creating any bricks.
     * @warning Refer to the default template object for more information on the structure of the template object.
     * @notice The template object must be an object with the following structure:
     * {
     *    blocks : {
     *       block1 : {
     *         tags : 'tagName',
     *         classes : { 'default': ['class1','class2'] }
     *         attributes : { 'default': [{name: 'src', value: 'https://example.com'}] }
     *       },
     *    },
     *    properties: {
     *       propertyName: {
     *         tags: {'parentBrickType': 'tagName', 'default': 'tagName', ... },
     *         classes: { 'default': ['class1','class2'], 'parentBrickType': ['class1','class2',...] },
     *         attributes: { 'default': [{name: 'src', value: 'https://example.com'}], 'parentBrickType': [{name: 'src', value: 'https://example.com'}] }
     *       },
     *   },
     *   tags: {
     *     tagName: {
     *        tags: {'parentBrickType': 'tagName', 'default': 'tagName', ... },
     *        classes: { 'default': ['class1','class2'], 'parentBrickType': ['class1','class2',...] },
     *        attributes: { 'default': [{name: 'src', value: 'https://example.com'}], 'parentBrickType': [{name: 'src', value: 'https://example.com'}] 
     *      },
     *   },
     */
    static retemplate (templateObject) {
        HtmlBricks.template = templateObject;
    }


    /**
     * Define a new template for bricks that are constructed from EditorJS Blocks.
     * @param {string} blockName Block name to redefine the template for
     * @param {string} attributeName Attribute name to redefine the template (i.e. 'tags', 'classes', 'attributes')
     * @param {string | object | {string:string} } newValue new value for the template attribute
     */
    static redefineBlock (blockName, attributeName, newValue) {
        HtmlBricks.template[blockName][attributeName] = newValue;
    }

    /**
     * Define a new template for bricks that are constructed from EditorJS Blocks.
     * @param {string} propertyName Name of the property template to set (underlying property of an EditorJS block, i.e. 'type', 'data', 'title', ... )
     * @param {string} attributeName Attribute name to redefine the template (i.e. 'tags', 'classes', 'attributes') 
     * @param {string | object | {string:string} } newValue new value for the template attribute 
     */
    static redefineProperty (propertyName, attributeName, newValue) {
        HtmlBricks.template.properties[propertyName][attributeName] = newValue;
    }

    /**
     * Define a new template for bricks that are constructed from a simple tag
     * @param {string} tagName Name of the tag template to set
     * @param {string} attributeName Attribute name to redefine the template (i.e. 'tags', 'classes', 'attributes')
     * @param {string | object | {string:string} } newValue new value for the template attribute
     */
    static redefineTag (tagName, attributeName, newValue) {
        HtmlBricks.template.tags[tagName][attributeName] = newValue;
    }

    /**
     * Set the 'default' class(es) to be used for a brick type
     * @param {string} category Category of brick (i.e. 'block', 'property', 'tag')
     * @param {string} name Name of the brick type (i.e. 'linkTool', 'imageTool', 'text', 'description', 'div' ... )
     * @param {string | string[]} classNames Class(es) to set as default for the brick type
     * @returns {void}
     * @memberof HtmlBricks
     * @example HtmlBricks.setDefaultClass('div', ['my-class1','my-class2']) // set the 'default' class for the 'div' brick type to 'my-class1' and 'my-class2'
     */
    static setDefaultClasses(category, name, classesArray) {
        HtmlBricks.template[category][name].classes['default'] = classesArray;
    }

    /**
     * Set the classes for a brick of category 'property' to be used when that property is a child of a given parent brick type
     * @param {string} propertyName Name of the property template to set (underlying property of an EditorJS block, i.e. 'type', 'data', 'title', ... )
     * @param {string} parentName Name of the parent brick type (i.e. 'linkTool', 'imageTool', 'paragraph', ...)
     * @param {string[]} classesArray Array of classes to set for the property
     * @returns {void}
     * @memberof HtmlBricks
     * @example HtmlBricks.setPropertyClasses('title', 'imageTool', ['my-class1','my-class2']) 
     * // set the classes for the 'title' property when it is a child of the 'imageTool' brick type
     */
    static setPropertyNestedClasses(propertyName, parentName, classesArray) {
        HtmlBricks.template.properties[propertyName].classes[parentName] = classesArray;
    }

    /**
     * Find a brick in the HTMLBricks 'stack' array by its ID
     * @param {string} searchID ID of the brick to search for
     * @returns {HtmlBricks} HtmlBricks object with the givenID
     * @memberof HtmlBricks
     * @example HtmlBricks.findByID('my-brick-id') // find the brick with the ID 'my-brick-id'
     */
    static find(searchID) {
        try {
            return HtmlBricks.stack.find(brick => brick.brickID === searchID);
        } catch (e) {
            console.error('No brick with ID ' + searchID + ' found');
            return null;
        }
    }

    /**
     * Creates an HTMLBrick from a block object or a string representing an HTML tag and append it to another brick
     * @param {object | string} block Block object or string representing a block property or an HTML tag
     * @param {HtmlBricks} receiver Brick to which the element will be appended
     * @returns {HtmlBricks} The brick representing the element, to allow chaining
     * @memberof HtmlBricks
     * @warning Classes and attributes will have to be set separately
     * @example HtmlBricks.lay(codeBlock, HtmlBricks.find('my-brick-id')) // lay the code block within the brick with the ID 'my-brick-id'
     */
    static lay(block, receiver = null) {
        var brick = new HtmlBricks();
        switch (typeof block) {
            case 'string':
                if (HtmlBricks.template['tags'][block]) {
                    brick.fromTag(block);
                }
                else if (HtmlBricks.template['properties'][block]) {
                    brick.fromProperty(block);
                }
                else {
                    console.error('No template for tag or property ' + block);
                }
                break;
            case 'object':
                if(HtmlBricks.template['blocks'][block]) {
                    brick.fromBlock(block);
                }
                else {
                    console.error('No template for block ' + block);
                }
                break;
            default:
                console.error('Invalid block type');
                break;
        }
        if(receiver == null) {
            console.warn('No receiver brick specified, the brick has not be appended to any other brick.');
            return brick;
        }
        receiver.htmlelement.appendChild(brick.htmlelement);
        receiver.over = brick;
        brick.under = receiver;
        HtmlBricks.stack.push(brick);
        return brick;
    }

    /**
     * Static property defining the template object for bricks that are constructed from EditorJS Blocks
     * @static
     * @memberof HtmlBricks
     * @example HtmlBricks.template.blocks['linkTool'] // returns the template object for the 'linkTool' block
     * @example HtmlBricks.template['properties']['title'].classes // returns the classes list from the template for the 'title' property
     * @example HtmlBricks.template.tags['div'].attributes // returns the attributes list from the template for the 'div' tag
     */
    static template = {
        blocks : {
            paragraph: {
                tag: 'p',
                classes: {'default': [] },
                attributes: {'default': [] }
            },
            header: {
                tag: 'h',
                level: 1,
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            list: {
                tag: 'ul' | 'ol',
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            image: {
                tag: 'img',
                classes: { 'default': [] },
                attributes: [],
            },
            embed: {
                tag: 'iframe',
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            code: {
                tag: 'code',
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            quote: {
                tag: 'blockquote',
                classes: {'default': ["blockquote"]},
                attributes: {'default': [] },
            },
            table: {
                tag: 'table',
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            delimiter: {
                tag: 'div',
                classes: {'default': ['ce-delimiter'] },
                attributes: {'default': [] },
            },
            warning: {
                tag: 'div',
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            linkTool: {
                tag: 'div',
                classes: {'default': ['link-tool'] },
                attributes: {'default': [] },
            },
            media: {
                tag: 'div',
                classes: {'default': [] },
                attributes: {'default': [] },
            },
            attaches: {
                tag: 'a',
                classes: {'default': ['file-link'] },
                attributes: {'default': [
                        {name: 'target', value: '_blank'},
                        {name: 'rel', value: 'nofollow noindex noreferrer'}
                    ],
                    
                },
            },
        },
        properties: {
            caption: {
                tags: {'image' : 'span', 'quote' : 'span'},
                classes: {"image" : ["editor-image-caption"], 'quote' : ['blockquote-caption']},
                attributes: {
                    'default': [],
                }
            },
            image: {
                tags: {'default' : 'img', 'linkTool' : 'img'},
                classes: { 'default': [] },
                attributes: {
                    'default': [
                        {name: 'src', value: '#'},
                        {name: 'alt', value: '#'},
                        {name: 'title', value: '#'},
                    ],

                }
            },
            fileBlock: {
                tags: {'default': 'div', 'attaches' : 'div'},
                classes: { 'default': [], 'attaches' : ['file-block'] },
                attributes: {
                    'default': [],
                }
            },
            icon: {
                tags: {'default' : 'span', 'attaches' : 'span', 'fileBlock' : 'span'},
                classes: { 
                    'default': [], 
                    'attaches': ['file-icon'], 
                    'fileBlock': ['fiv-cla','fiv-icon-ppt','fiv-size-lg'] 
                },
                attributes: {
                    'default': [],
                }
            },
            fileName: {
                tags: {'default': 'span', 'attaches' : 'span'},
                classes: { 
                    'default': [],
                    'attaches': ['file-name'],
                    'fileBlock': ['file-name'], 
                },
                attributes: {
                    'default': [],
                }
            },
            body: {
                tags: {'default':'div', 'media': 'div'},
                classes: {'default': [], 'media': ['media-body']},
                attributes: {
                    'default': [],
                }
            },
            anchor: {
                tags: {'default':'span', 'linkTool' : 'span', },
                classes: { 'linkTool' : [], },
                attributes: {
                    'default': [],
                }
            },
            title: {
                tags: {'default': 'div', 'warning': 'div', 'linkTool' : 'div'},
                classes: {'warning' : ["warning-title"], 'linkTool' : ['link-tool-title']},
                attributes: {
                    'default': [],
                }
            },
            description: {
                tags: {'default':'p', 'linkTool' : 'p'},
                classes: {'linkTool' : ['link-tool-description']},
                attributes: {
                    'default': [],
                }
            },
            message: {
                tags: {'default': 'div', 'warning': 'div'},
                classes: ["warning-message"],
                attributes: {
                    'default': [],
                }
            },
            link: {
                tags: {'default': 'a', 'attaches' : 'a', 'linkTool' : 'a'},
                classes: {'default' : [], 'linkTool' : ['link-tool__content', 'link-tool__content--rendered']},
                attributes: {
                    'default': [],
                    'attaches': [],
                    'linkTool': [
                        {name: 'href', value: '#'}, 
                        {name: 'target', value: '_blank'},
                        {name: 'rel', value: 'nofollow noindex noreferrer'}
                    ],
                    'link': [],
                }
            },
            linkImg: {
                tags: {'default': 'div', 'attaches' : 'div', 'linkTool' : 'div'},
                classes: {'default' : [], 'linkTool' : ['link-tool__image'], 'link': ['link-tool__image']},
                attributes: {'default': [], 'linkTool': [], 'link': []},
            },
            root: {
                tags: {'default': 'div'},
                classes: {'default': []},
                attributes: {'default': [], 'root': []},
            },
            wrapper: {
                tags: {'default': 'div', 'root': 'div'},
                classes: {'default' : [], 'root' : ['codex-editor']},
                attributes: {'default': [], 'root': []},
            },
            subWrapper: {
                tags: {'default': 'div', 'root': 'div', 'wrapper': 'div'},
                classes: {'default' : [], 'root' : ['codex-editor__wrapper'], 'wrapper' : ['codex-editor__redactor']},
                attributes: {'default': [], 'root': [], 'wrapper': []},
            }
        },
        tags : {
            div: {
                tag: 'div',
                classes: {'wrapper': ['codex-editor'], 'subWrapper': ['codex-editor__redactor']},
                attributes: [],
            },
            pre: {
                tag: 'pre',
                classes: {'default': [], 'code': []},
                attributes: [],
            },
            li: {
                tag: 'li',
                classes: [],
                attributes: [],
            },
            
            thead: {
                tag: 'thead',
                classes: [],
                attributes: [],
            },
            th: {
                tag: 'th',
                classes: [],
                attributes: [],
            },
            tbody: {
                tag: 'tbody',
                classes: [],
                attributes: [],
            },
            tr: {
                nestable: true,
                tag: 'tr',
                classes: [],
                attributes: [],
            },
            td: {
                tag: 'td',
                classes: [],
                attributes: [],
            },
        },
    };
}