
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


    /**
     * Define parent brick
     * @param {HtmlBrick} parentBrick 
     */
    on(parentBrick){
        this.under = parentBrick;
        parentBrick.over.push(this);
        this.nestingLevel = parentBrick.nestingLevel + 1;
        return this;
    }

    /**
     * Create a brick from a block object (editor block) 
     * @param {object} block Block object to create the brick from 
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
            this.htmlelement.classList.add(...this.classes);
        }
        return this;
    }

    fromTag(tag) {
        this.category = 'tag';
        this.tag = tag;
        this.type = tag;
        this.htmlelement = document.createElement(this.tag);
        this.classes = HtmlBricks.template.tags[this.tag].classes['default'];
        this.htmlelement.classList.add(...this.classes);
        return this;
    }

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

        console.log('Template:', HtmlBricks.template);
        console.log('Property:', property);
        console.log('Parent:', parentBrick);
        
        if (HtmlBricks.template.properties[property].attributes[parentBrick.type]) {
            this.attributes = HtmlBricks.template.properties[property].attributes[parentBrick.type];
        } else {
            this.attributes = HtmlBricks.template.properties[property].attributes['default'];
        }

        this.attributes.forEach(attribute => {
            this.htmlelement.setAttribute(attribute.name, attribute.value);
        });
        this.htmlelement.classList.add(...this.classes);
        return this;
    }

    fromElement(htmlElement) {
        this.htmlelement = htmlElement;
        return this;
    }

    asRoot() {
        this.under = null;
        this.type = 'root';
        this.over = [];
        this.position = 0;
        this.nestingLevel = 0;
        //HtmlBricks.stack[this.position] = this;
        return this;
    }

    lay() {
        this.under.htmlelement.appendChild(this.htmlelement);
        return this;
    }

    withClasses(classesArray) {
        if(classesArray) {
            this.classes = classesArray;
            this.htmlelement.classList.add(...classesArray);
        }
        return this;
    }

    withAttributes(htmlAttributes) {
        if(htmlAttributes) {
            this.attributes = htmlAttributes;
        }
        if(this.attributes) {
            this.attributes.forEach(attribute => {
                this.htmlelement.setAttribute(attribute.name, attribute.value);
            });
        }
        return this;
    }

    identify(brickID = null) {
        if(brickID) {
            this.brickID = brickID;
            return this;
        }
        return this.brickID;
    }

    static retemplate (templateObject) {
        HtmlBricks.template = templateObject;
    }

    static redefineBlock (blockName, attributeName, newValue) {
        HtmlBricks.template[blockName][attributeName] = newValue;
    }

    static redefineProperty (propertyName, attributeName, newValue) {
        HtmlBricks.template.properties[propertyName][attributeName] = newValue;
    }

    static redefineTag (tagName, attributeName, newValue) {
        HtmlBricks.template.tags[tagName][attributeName] = newValue;
    }

    static setDefaultClasses(category, name, classesArray) {
        HtmlBricks.template[category][name].classes['default'] = classesArray;
    }

    static setPropertyNestedClasses(propertyName, parentName, classesArray) {
        HtmlBricks.template.properties[propertyName].classes[parentName] = classesArray;
    }

    static find(searchID) {
        return HtmlBricks.stack.find(brick => brick.brickID === searchID);
    }

    static setRoot (wrapper, subWrapper = null) {
        HtmlBricks.stack[0] = wrapper;
        if(subWrapper) {
            HtmlBricks.stack[1] = subWrapper;
        }
    }

    /**
     * 
     * @param {HtmlBricks} wrapper Root brick
     * @param {HtmlBricks} subWrapper Sub-root brick
     * @returns 
     */
    setRoot(wrapper, subWrapper = null) {
        this.root = wrapper;
        HtmlBricks.stack[0] = wrapper;
        if(subWrapper) {
            this.root.over = subWrapper;
            subWrapper.under = wrapper;
            HtmlBricks.stack[1] = subWrapper;
        }
        return this;
    }


    /**
     * Creates an HTMLBrick from a block object or a string representing an HTML tag and append it
     * @param {object | string} block Block object or string representing an HTML tag
     * @param {HtmlBricks} receiver Brick to which the element will be appended
     * @returns {HtmlBricks} The brick representing the element, to allow chaining
     */
    static lay(block, receiver = null) {
        var brick = new HtmlBricks(block);

        if(receiver == null) {
            return brick;
        }
        receiver.htmlelement.appendChild(brick.htmlelement);
        receiver.over = brick;
        brick.under = receiver;
        HtmlBricks.stack.push(brick);
        return brick;
    }

    withHTML(innerhtml) {
        this.htmlelement.innerHTML = innerhtml;
        return this;
    }

    withText(text) {
        this.htmlelement.textContent = text;
        return this;
    }

    /**
     * Recursive function to create bricks from the template
     * going through all the nesting levels and creating bricks inside the parent one
     * @returns {void}
     */
    cascadeBuild() {
        if (this.hasNested) {
            var nested = this.template[this.type].nested;
            if(nested) {
                nested.forEach(nestedBlock => {
                    var brick = new HtmlBricks(nestedBlock);
                    brick.buildNested();
                    this.htmlelement.appendChild(brick.htmlelement);
                });
            }
        }
    }

    /**
     * Makes a new Brick element from the nested block and appends it to the parent brick,
     * returning the newly created Brick.
     * @returns {HtmlBricks} The newly created Brick
     * @memberof HtmlBricks
     */
    buildNested() {
        var brick = new HtmlBricks(this.nested);
        this.htmlelement.appendChild(brick.htmlelement);
        return brick;
    }

    /**
     * Check if a block object has nested elements
     * @param {object} block Block object
     * @returns {boolean} True if the block has nested elements
     * @memberof HtmlBricks
     * @static
     */
    static hasNested(blockName) {
        return (HtmlBricks.template[blockName].nested != undefined
                && HtmlBricks.template[blockName].nested != null
                && HtmlBricks.template[blockName].nested.length > 0);
    }

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
                tag: 'pre',
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
            hr: {
                tag: 'hr',
                classes: {'default': [] },
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
                    {name: 'href', value: '#'},
                    {name: 'target', value: '_blank'},
                    {name: 'rel', value: 'nofollow noindex noreferrer'}
                 ] },
            },
        },
        properties: {
            caption: {
                tags: {'image' : 'span', 'quote' : 'span'},
                classes: {"image" : ["editor-image-caption"], 'quote' : ['blockquote-caption']},
                attributes: [],
            },
            image: {
                nestable: true,
                tags: {'default' : 'img', 'linkTool' : 'img'},
                classes: { 'default': [] },
                attributes: [],
            },
            fileBlock: {
                tags: {'default': 'div', 'attaches' : 'div'},
                classes: [],
                attributes: [],
            },
            icon: {
                tags: {'default' : 'span', 'attaches' : 'span', 'fileBlock' : 'span'},
                classes: { 
                    'default': [], 
                    'attaches': ['file-icon'], 
                    'fileBlock': ['fiv-cla fiv-icon-ppt fiv-size-lg'] 
                },
                attributes: [],
            },
            fileName: {
                tags: {'default': 'span', 'attaches' : 'span'},
                classes: { 
                    'default': [],
                    'attaches': ['file-name'],
                    'fileBlock': ['file-name'], 
                },
                attributes: [],
            },
            body: {
                tags: {'default':'div', 'media': 'div'},
                classes: {'default': [], 'media': ['media-body']},
                attributes: [],
            },
            anchor: {
                tags: {'default':'span', 'linkTool' : 'span', },
                classes: { 'linkTool' : [], },
                attributes: [],
            },
            title: {
                tags: {'default': 'div', 'warning': 'div', 'linkTool' : 'div'},
                classes: {'warning' : ["warning-title"], 'linkTool' : ['link-tool-title']},
                attributes: [],
            },
            description: {
                tags: {'default':'p', 'linkTool' : 'p'},
                classes: {'linkTool' : ['link-tool-description']},
                attributes: [],
            },
            message: {
                tags: {'default': 'div', 'warning': 'div'},
                classes: ["warning-message"],
                attributes: [],
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
                }
            },
            linkImg: {
                tags: {'default': 'div', 'attaches' : 'div', 'linkTool' : 'div'},
                classes: {'default' : [], 'linkTool' : ['link-tool__image'], 'link': ['link-tool__image']},
            },
            wrapper: {
                tags: {'default': 'div', 'root': 'div'},
                classes: {'default' : [], 'root' : ['codex-editor']},
            },
            subWrapper: {
                tags: {'default': 'div', 'root': 'div', 'wrapper': 'div'},
                classes: {'default' : [], 'root' : ['codex-editor__wrapper'], 'wrapper' : ['codex-editor__redactor']},
            }
        },
        tags : {
            div: {
                tag: 'div',
                classes: {'wrapper': ['codex-editor'], 'subWrapper': ['codex-editor__redactor']},
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