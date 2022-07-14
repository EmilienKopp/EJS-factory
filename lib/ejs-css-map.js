


export class HtmlAttributeMap {
    
    wrapper = {
        class: { main: ["codex-editor"] },
        style: '',
        id: '',
    };

    subWrapper = { 
        class: { main: ["codex-editor__redactor"] }
    };

    paragraph = { 
        class: { main: [] } 
    };

    header = { 
        class: { main: [] }
    };

    list = { 
        class: { main: [] }
    };

    image = {  
        class: {
            main: [], caption: ["editor-image-caption"] 
        }
    };

    embed = { 
        class: { main: [] }
    };

    code = { 
        class: { main: [] }
    };

    quote = {  
        class: { 
            main: ["blockquote"] , caption: ["blockquote-caption"] 
        }
    };

    table = { 
        class: { main: [] }
    };

    hr = { 
        class: { main: [] }
    };

    warning = { 
        class: { 
            title: ["warning-title"], 
            message: ["warning-message"] 
        }
        };

        // FROM HERE
    linkTool = { 
        main: ["link-tool"], a: ["link-tool__content", "link-tool__content--rendered"], img: ["link-tool__image"], title: ["link-tool__title"], description: ["link-tool__description"], anchor: ["link-tool__anchor"] };
    
    media = { main: ["media"], body: ["media-body"]};
    
    attaches = { a: [], div: [], icon: [], filename: [] };

}