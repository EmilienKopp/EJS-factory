
export default class HtmlBricks {

    constructor() {
        // ...
    }

    static lay(block, receiver) {
        var structure = HtmlBricks.structure;
        var el = structure.wrapper.blocks[block.type];

        if (el) {
            if (block.type === 'header' 
                && block.data.level
                && block.data.level >= 1) {
                var brick = document.createElement(el.tag + block.data.level);
            } else if (block.type === 'list') {
                let listType = block.data.style == 'ordered' ? 'ol' : 'ul';
                var brick = document.createElement(listType);
            }
            if (el.classes) {
                el.classes.forEach(c => {
                    brick.classList.add(c);
                });
            }
            if (el.attributes) {
                el.attributes.forEach(a => {
                    brick.setAttribute(a.name, a.value);
                });
            }
            if (el.id) {
                brick.id = el.id;
            }
            if (el.style) {
                brick.style = el.style;
            }
        }
        receiver.appendChild(el);

        return el;
    }


    static structure = {
        wrapper: {
            tag: 'div',
            classes: ["codex-editor"],
            style: '',
            id: '',
            subWrapper: {
                tag: 'div',
                classes: ["codex-editor__redactor"],
                style: '',
                id: ''
            },
            blocks: {
                paragraph: {
                    tag: 'p',
                    classes: [],
                },
                header: {
                    tag: 'h',
                    classes: [],
                },
                list: {
                    tag: 'ul' | 'ol',
                    classes: [],
                    items: {
                        tag: 'li',
                        classes: [],
                    }
                },
                image: {
                    tag: 'img',
                    classes: [],
                    caption: {
                        tag: 'span',
                        classes: ["editor-image-caption"],
                    },
                },
                embed: {
                    tag: 'iframe',
                    classes: [],
                },
                code: {
                    tag: 'pre',
                    classes: [],
                    code: {
                        tag: 'code',
                        classes: [],
                    },
                },
                quote: {
                    tag: 'blockquote',
                    classes: ["blockquote"],
                    caption: {
                        tag: 'span',
                        classes: ["blockquote-caption"],
                    },
                },
                table: {
                    tag: 'table',
                    classes: [],
                    header: {
                        tag: 'thead',
                        classes: [],
                        items: {
                            tag: 'th',
                            classes: [],
                        },
                    },
                    body: {
                        tag: 'tbody',
                        classes: [],
                        rows: {
                            tag: 'tr',
                            classes: [],
                            cells: {
                                tag: 'td',
                                classes: [],
                            },
                        },
                    },
                },
                hr: {
                    tag: 'hr',
                    classes: [],
                },
                warning: {
                    tag: 'div',
                    classes: [],
                    title: {
                        tag: 'div',
                        classes: ["warning-title"],
                    },
                    message: {
                        tag: 'div',
                        classes: ["warning-message"],
                    },
                },
                linkTool: {
                    tag: 'a',
                    href: '',
                    target: '',
                    rel: [],
                    classes: [],
                    img: {
                        tag: 'img',
                        classes: [],
                        src: '',
                        alt: '',
                    },
                    title: {
                        tag: 'div',
                        classes: [],
                    },
                    description: {
                        tag: 'p',
                        classes: [],
                    },
                    anchor: {
                        tag: 'span',
                        classes: [],
                    },
                },
                media: {
                    tag: 'div',
                    classes: [],
                    body: {
                        tag: 'div',
                        classes: [],
                    },
                },
                attaches: {
                    tag: 'a',
                    href: '',
                    target: '',
                    rel: [],
                    classes: [],
                    block: {
                        tag: 'div',
                        classes: [],
                    },
                    icon: {
                        tag: 'span',
                        classes: [],
                    },
                    filename: {
                        tag: 'span',
                        classes: [],
                    },
                },
            }
        },
    };
}